# BBPS — Business Overview

> **Start here if you're new to fintech QA, in HR, or from a non-QA technical role.** This
> document explains what a BBPS integration does and why it matters, before you look at any
> test case or code. See [`README.md`](./README.md) for the full documentation map if you landed
> here directly.

## 1. What problem does it solve?

Consumers pay dozens of different bills — electricity, water, gas, DTH, telecom, insurance — each
traditionally on the biller's own separate portal. BBPS standardizes this into one payment rail:
a platform integrated with BBPS can let a user pay any registered biller's bill in one place.

## 2. Core Modules and Their Submodules

The bullet list below names *what* exists. This table adds the submodule-level detail a test
plan or automation suite actually needs, plus which skill category (see
[`tech-and-skills.md`](./tech-and-skills.md)) is the primary way each module gets tested.

| Module | Submodules / Key Components | Responsible For | Primarily Tested Via |
|---|---|---|---|
| **Bill Categories** | Category Taxonomy · Biller Directory per Category | The taxonomy of biller types offered (electricity, water, gas, DTH, etc.) — Bharat Connect spans 25+ categories and 22,000+ billers platform-wide | UI Automation |
| **Bill Fetch** | Live Fetch Call (via BBPCU → biller's BOU) · Freshness-Window Timer | A real-time lookup of the current outstanding amount — see [`architecture-and-flow.md`](./architecture-and-flow.md) sections 1–2 for exactly how this routes through Bharat Connect's real participant structure | API Testing |
| **Bill Payment** | Payment Execution · Stale-Amount Guard | The actual payment against a fetched bill, gated by the freshness check (section 4 below) | API Testing + Functional Testing |
| **Payment Rail Resolver** | Live Eligibility Check (Payout/Connected Banking) · Fee Calculation per Rail | Deciding, at the moment of payment, whether this merchant's bill routes through the internal rail or an external Gateway (section 3) | API Testing |
| **Transaction Status** | Status State Machine · Ambiguous/Pending Handling | Tracking a payment to a definitive success/failure state, without ever guessing in the meantime | Functional Testing |
| **Settlement** | Settlement Batch Processing | The financial reconciliation between the platform and the biller | Data-Level Testing |
| **Reports** | Payment History · Rail-Attribution Breakdown | Payment history and settlement reporting, including which rail (internal vs. external) each transaction used | API Testing |

## 3. Payment Execution: Gateway vs. Internal Payout Rail

Once a bill is fetched, a customer/merchant can actually **pay it two different ways** — this is
a core commercial and architectural decision, not just a UI choice:

| Path | How It Works | Fee |
|---|---|---|
| **External Payment Gateway** | Routed through a third-party PG (e.g. PhonePe PG, Razorpay PG, Cashfree Payment Gateway) | Standard gateway fee applies |
| **Internal Payout / Connected Banking Rail** | If the merchant already uses this platform's Payout or Connected Banking service, the bill payment executes through that existing internal rail instead of an external gateway | **Lower service charge** — a commercial incentive for merchants already on-platform |

```
Bill fetched, ready for payment
        │
        ▼
Payment method resolved
        │
        ├──▶ Merchant has active Payout/Connected Banking service
        │         │
        │         ▼
        │    Routed through Internal Payout/Connected Banking Rail
        │         │
        │         ▼
        │    Lower service charge applied
        │
        └──▶ No active internal rail available
                  │
                  ▼
             Routed through External Payment Gateway (PhonePe PG / Razorpay PG / Cashfree PG)
                  │
                  ▼
             Standard gateway fee applied
```

**Why this matters for testing:** the same bill payment can legitimately cost the merchant a
different fee depending on *which rail* executed it — this is not a bug, but it means fee
calculation, receipt/reporting line items, and rail-selection logic all need explicit test
coverage for both paths, and for the correct rail being chosen when a merchant qualifies for the
internal one.

## 4. Why Biller Integration Risk Is the Central Testing Theme

Unlike a self-contained product, a BBPS platform's reliability partly depends on **systems it
doesn't own** — each biller's own backend, and (per section 3) potentially an external Payment
Gateway too. This creates a distinct risk profile:

- A biller can time out or be temporarily unavailable during fetch
- A fetched bill amount can become stale if payment happens even slightly later
- A biller's status callback can be delayed or inconsistent, leaving a transaction in an
  ambiguous state from the user's point of view
- An external Payment Gateway (when that path is used) introduces its own latency/availability
  profile, separate from the biller's

Because of this, QA strategy for BBPS treats **biller and payment-rail failure modes** as
first-class scenarios, not edge cases — a platform that only tests the happy path will pass
internal testing and still fail in production the moment one biller (or one PG) has a bad day.

## 5. Glossary

| Term | Meaning |
|---|---|
| **Biller** | The utility/service provider whose bill is fetched and paid (e.g. an electricity provider) |
| **Bill Fetch** | The real-time lookup of a bill's current outstanding amount |
| **Stale Amount** | A previously fetched bill amount that may no longer be accurate by payment time |
| **Settlement** | The reconciliation of funds between the platform and the biller after payment |
| **BBPS / Bharat Connect** | Bharat Bill Payment System — rebranded **Bharat Connect** by NPCI in late 2024. Same underlying infrastructure, settlement rails, and biller network as before; a name change, not an architecture change |
| **BBPCU** | Bharat Bill Pay Central Unit — operated by NPCI Bharat BillPay Ltd (NBBL); sets the rules, runs the central clearing/settlement platform every fetch and payment is mediated through |
| **BBPOU** | Bharat Bill Payment Operating Unit — a bank or authorized non-bank participant connecting to the BBPCU, as a COU, a BOU, or both |
| **COU** | Customer Operating Unit — the customer-facing BBPOU role. This platform operates as a COU (see [`architecture-and-flow.md`](./architecture-and-flow.md) section 1) |
| **BOU** | Biller Operating Unit — the biller-facing BBPOU role; each biller connects to the BBPCU through one |
| **Payment Gateway (PG)** | An external, third-party payment processor (e.g. PhonePe PG, Razorpay PG, Cashfree PG) used when the internal rail isn't available |
| **Internal Payout Rail** | Routing a bill payment through the platform's own Payout/Connected Banking service instead of an external PG, at a lower fee |

## 6. Involved Parties (Stakeholders)

| Stakeholder | Why They Care |
|---|---|
| **Customers** | The end payer — needs accurate bill amounts and reliable payment confirmation |
| **Billers** | The utility/service provider — depends on the platform correctly relaying their live bill data |
| **Merchants** | May offer bill payment as a service to their own customers; those already using Payout/Connected Banking benefit from lower fees on this internal rail |
| **NPCI/BBPS Ecosystem** | The standardized national framework this platform integrates with — governs compliance requirements |
| **Banks** | Handle the actual settlement of paid amounts |
| **Payment Gateway Providers** | External partners (PhonePe, Razorpay, Cashfree) used as the fallback/default payment rail |
| **Finance Team** | Owns settlement reconciliation accuracy between the platform and each biller, and correct fee application across both payment rails |

## 7. Dependencies

**Shared, company-wide platform services** — see [`shared-platform-services.md`](./shared-platform-services.md)
for the engines this product consumes rather than reimplements: Authentication, Settlement
Engine, Reconciliation Engine, Commercial Engine, Notification Service, Scheduler/Background
Workers.

**Internal platform dependencies (new, per section 3):**

- **Payout Engine** — one of the two possible payment execution rails for a bill payment, when
  the merchant already has an active Payout relationship
- **Connected Banking** — the other possible internal execution rail

**External, third-party dependencies:**

- **Billers** (electricity, water, gas, broadband, DTH, mobile recharge, FASTag, insurance,
  education, municipal taxes) — the platform is only as reliable as each biller's own backend,
  which it does not control (see section 4 above)
- **External Payment Gateways** (PhonePe PG, Razorpay PG, Cashfree Payment Gateway) — the
  fallback payment rail when no internal Payout/Connected Banking relationship exists
- **NPCI/BBPS Ecosystem** — the standardized rail this integration is built on
- **Banks** — for settlement fund movement
- **Notification Services** — payment confirmations and bill-fetch failure notices

## 8. Cross-Module Dependencies (Conceptual, Within the Platform)

- **Payout Engine / Connected Banking** — the internal, lower-fee payment execution rail (see
  section 3) — this is the most architecturally significant cross-module dependency for BBPS
- **Commercial Engine** — for platform convenience fees, on both the internal-rail and
  external-PG paths
- **Ledger** — for settlement reconciliation records
- **Reports** — for merchant/internal reconciliation views
- **AI Dispute Resolution Engine** — handles customer support issues raised about bill payment
  disputes, as part of the shared cross-product support layer

See [`ui-consistency.md`](./ui-consistency.md) for how bill/payment data must render
consistently across every screen it appears on.
