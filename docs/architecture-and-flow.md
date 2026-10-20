# BBPS — Architecture & Flow

> See [`business-overview.md`](./business-overview.md) for why biller-integration failure and
> dual-rail payment execution are this product's two central risks,
> [`tech-and-skills.md`](./tech-and-skills.md) for the tools and skills behind this testing
> approach, and [`README.md`](./README.md) for the full documentation map.
>
> Every diagram below is drawn in <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer">Mermaid</a>,
> which GitHub renders natively in-page — nothing here requires opening another site or tool to
> read it.

## 1. System Architecture — Who Talks to Whom

```mermaid
flowchart TD
    User(["🧑 End User"]) --> UI["Platform UI<br/>(acting as a COU — Customer Operating Unit)"]
    UI --> GW["API Gateway"]
    GW --> BF["🔍 Bill Fetch Service"]
    GW --> RR["⚙️ Payment Rail Resolver"]
    GW --> TS["Transaction Status Service"]

    BF -.Bharat Connect / BBPS rails.-> BBPCU["🏛️ BBPCU<br/>NPCI Bharat BillPay Ltd — central unit"]
    BBPCU -.routes to.-> BOU["Biller's own BOU<br/>Biller Operating Unit"]
    BOU --> Biller(["🏢 Biller: electricity / water / gas / DTH / etc."])

    RR -->|merchant has an ACTIVE internal rail| Payout["✅ Payout Engine /<br/>Connected Banking"]
    RR -->|no active internal rail| ExtPG["🌐 External Payment Gateway<br/>PhonePe PG / Razorpay PG / Cashfree PG"]

    Payout --> Settle["Settlement Engine"]
    ExtPG --> Settle
    Settle --> Recon["Reconciliation Engine"]

    classDef person fill:#1a237e,color:#fff,stroke:#5c6bc0,stroke-width:1px
    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef service fill:#004d40,color:#fff,stroke:#26a69a,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef warn fill:#e65100,color:#fff,stroke:#fb8c00,stroke-width:1px

    class User,Biller person
    class BBPCU,RR gate
    class UI,GW,BF,TS,Settle,Recon service
    class Payout good
    class ExtPG warn
```

**What "acting as a COU" means, concretely:** BBPS (rebranded **Bharat Connect** by NPCI in late
2024 — same underlying infrastructure, settlement rails, and biller network, just a new brand
name) is structured as a central unit plus two participant roles. The **BBPCU** (Bharat Bill Pay
Central Unit, operated by NPCI Bharat BillPay Ltd) sets the rules and runs the clearing/
settlement layer. **BBPOUs** (Bharat Bill Payment Operating Units — banks or authorized
non-banks) connect to it as either a **COU** (Customer Operating Unit, the customer-facing side —
what this platform is) or a **BOU** (Biller Operating Unit, the biller-facing side). This
platform never talks to a biller directly — every fetch and payment is mediated by the BBPCU,
which is exactly why biller-side failures (section 4 of
[`business-overview.md`](./business-overview.md)) are a structural risk this platform can
mitigate but never fully control.

## 2. Bill Fetch & Stale-Amount-Protected Payment

```mermaid
sequenceDiagram
    actor User as 🧑 User
    participant UI
    participant BF as 🔍 Bill Fetch Service
    participant BBPCU as 🏛️ BBPCU
    participant BOU as Biller's BOU
    participant Pay as Payment Service

    User->>UI: Selects category, enters consumer number
    UI->>BF: Fetch bill
    BF->>BBPCU: Route fetch request
    BBPCU->>BOU: Forward to biller
    BOU-->>BBPCU: Current outstanding amount + fetchedAt timestamp
    BBPCU-->>BF: Amount, due date
    BF-->>UI: Amount shown — freshness window starts counting from fetchedAt
    User->>UI: Confirms payment
    UI->>Pay: Pay the fetched amount
    Pay->>Pay: Check elapsed time since fetchedAt
    alt Within the freshness window
        rect rgb(27, 94, 32)
        Pay->>Pay: Proceed to rail selection (section 3) and charge
        end
    else Freshness window exceeded
        rect rgb(183, 28, 28)
        Pay-->>UI: BLOCKED — "Please refetch"
        UI-->>User: Stale-amount warning shown — never silently charged
        end
    end
```

**This is the exact mechanism behind [`sample-defect-report.md`](../sample-defect-report.md)
Defect #1:** the diagram's `alt`/`else` branch simply didn't exist in the actual implementation.
Every payment proceeded down the "within window" path regardless of how much time had actually
passed, because nothing checked `fetchedAt` at payment time at all. The fix isn't adding a timer
to the UI countdown — it's enforcing the elapsed-time check **inside the Payment Service itself**,
server-side, independent of anything the client displays.

## 3. Payment Rail Selection — the Mechanism Behind Defect #2

```mermaid
flowchart TD
    Start["Bill ready for payment"] --> Check{"Rail Resolver:<br/>does this merchant have an ACTIVE<br/>Payout/Connected Banking service RIGHT NOW?"}
    Check -->|"Checks LIVE status (correct)"| LiveCheck{"Live status = Active?"}
    Check -->|"❌ Checks a CACHED/historical flag instead<br/>(Defect #2's actual root cause)"| StaleCheck["Stale flag may still say<br/>'has used Payout before',<br/>not 'is active right now'"]
    LiveCheck -->|Yes| Internal["✅ Routed: Internal Payout/Connected Banking rail<br/>→ lower service charge"]
    LiveCheck -->|No| External["🌐 Routed: External Payment Gateway<br/>→ standard gateway fee"]
    StaleCheck --> WrongRoute["🚨 Possible WRONG routing —<br/>e.g. a recently-reinstated-eligible merchant<br/>still sent external and overcharged"]

    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef warn fill:#e65100,color:#fff,stroke:#fb8c00,stroke-width:1px
    classDef bad fill:#b71c1c,color:#fff,stroke:#e53935,stroke-width:1px

    class Check,LiveCheck gate
    class Internal good
    class External warn
    class StaleCheck,WrongRoute bad
```

**Why "ever had Payout" and "has Payout active right now" are different questions, and why the
difference matters commercially:** a merchant can deactivate and later reinstate their Payout/
Connected Banking relationship. A rail-resolver that checks a cached eligibility flag set once
and never re-verified will keep routing that merchant's bill payments externally, at the higher
fee, even after they've become eligible again for the lower one. This is a real-money,
real-recurring defect every single time that merchant pays a bill, not a one-off glitch, which is
exactly why [`sample-defect-report.md`](../sample-defect-report.md) rates it Major rather than
Minor: the impact compounds with every transaction until the live-check fix ships.

## 4. Biller Timeout — Never Show Stale Data as Current

```mermaid
sequenceDiagram
    participant UI
    participant BF as 🔍 Bill Fetch Service
    participant BBPCU as 🏛️ BBPCU
    participant BOU as Biller's BOU

    UI->>BF: Fetch bill
    BF->>BBPCU: Route fetch request
    BBPCU->>BOU: Forward to biller
    alt Biller responds in time
        rect rgb(27, 94, 32)
        BOU-->>BBPCU: Amount
        BBPCU-->>BF: Amount
        BF-->>UI: Amount displayed
        end
    else Biller times out
        rect rgb(183, 28, 28)
        BOU--xBBPCU: No response within the timeout window
        BBPCU-->>BF: Timeout signal
        BF-->>UI: Clear "temporarily unavailable" error —<br/>NEVER a stale or zero amount shown as current
        end
    end
```

**Why this diagram looks structurally identical to section 2's stale-amount diagram:** both
express the same underlying principle — never present a number the platform can't currently vouch
for as if it's current — applied at two different moments (fetch-time unavailability vs.
payment-time staleness). `TC-004` and `TC-006` in
[`regression-checklist.md`](../regression-checklist.md) test these as separate cases
specifically because they're triggered differently (a biller outage vs. elapsed time), even
though the correct platform behavior rhymes.

## 5. Settlement & Reconciliation

```mermaid
flowchart LR
    Payout["Internal Rail Payments"] --> Settle["Settlement Engine"]
    ExtPG["External Gateway Payments"] --> Settle
    Settle --> Recon{"Reconciliation Engine:<br/>platform-recorded totals vs. biller-side records"}
    Recon -->|Match| Clean["✅ Clean — no action needed"]
    Recon -->|Mismatch| Flag["🚨 Flagged for Finance Team review<br/>(TC-009)"]

    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef bad fill:#b71c1c,color:#fff,stroke:#e53935,stroke-width:1px

    class Recon gate
    class Clean good
    class Flag bad
```

**Why reconciliation has to compare against the *biller's* records, not just the platform's own
payment log:** per [`business-overview.md`](./business-overview.md) section 4, the platform
doesn't control the biller's side of this relationship. A payment the platform recorded as
successful could still be unrecognized on the biller's own ledger if a status callback was lost
or delayed (section 4 above), and reconciliation is the only process positioned to catch that
drift independently of either side's own optimistic self-report.

---

**Sources for the real-world standards referenced above** (used to ground this document's
diagrams in genuine BBPS/Bharat Connect architecture, not invented mechanics):
<a href="https://en.wikipedia.org/wiki/Bharat_Connect" target="_blank" rel="noopener noreferrer">Bharat Connect rebrand, BBPCU/BBPOU/COU/BOU structure — Wikipedia</a>,
<a href="https://www.mindgate.solutions/guides/bharat-connect-bbps/" target="_blank" rel="noopener noreferrer">Bharat Connect participant roles and scope — Mindgate</a>.
