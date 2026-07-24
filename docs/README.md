# BBPS — Documentation Map

> If you're approaching this repo the way a curious QA engineer, automation tester, or
> tech-enthusiast would — "what is this, how does it actually work, who's involved, what does it
> depend on" — this page answers that directly, one question at a time.
>
> Note: unlike this portfolio's three flagship fintech repos (Collection Engine, Payout Engine,
> Connected Banking), BBPS doesn't yet have dedicated `architecture-and-flow.md`,
> `business-flow.md`, `feature-modules.md`, or `service-architecture.md` docs — the content below
> reflects what actually exists today.

| Your Question | Answer Lives In |
|---|---|
| **What is this, in plain terms?** | [`business-overview.md`](./business-overview.md) — the "start here" doc |
| **Who's involved? (Stakeholders)** | [`business-overview.md`](./business-overview.md) section 6 — Customers, Billers, Merchants, NPCI/BBPS Ecosystem, Banks, Payment Gateway Providers, Finance Team |
| **What does it depend on?** | [`shared-platform-services.md`](./shared-platform-services.md) (company-wide shared engines) + **Payout Engine / Connected Banking** (internal payment rail) + external billers and Payment Gateways (this product has no dedicated `service-architecture.md` yet) |
| **How does it work? (Business/Tech Flow)** | [`business-overview.md`](./business-overview.md) sections 1–4 — Bill Categories → Bill Fetch → Bill Payment (Gateway vs. internal Payout rail) → Settlement, and why biller/PG failure is the central risk |
| **What's actually tested?** | [`../regression-checklist.md`](../regression-checklist.md) |
| **Does the UI behave consistently everywhere?** | [`ui-consistency.md`](./ui-consistency.md) |
| **What's been automated?** | [`../automation/`](../automation) |
| **What real defects has this surfaced?** | [`../sample-defect-report.md`](../sample-defect-report.md) |
| **What does a regression run look like?** | [`../regression-execution-summary.md`](../regression-execution-summary.md) |

## Reading Order (Recommended)

```
1. business-overview.md         ← the "why" — what problem, who's involved, biller-risk framing
        │
        ▼
2. ui-consistency.md            ← the "does it hold together" — cross-screen consistency
        │
        ▼
3. regression-checklist.md, automation/, sample-defect-report.md, regression-execution-summary.md
   ← the proof — coverage, automation, real findings, real numbers
```

## A Note on This Repo's Depth vs. the Flagship Fintech Repos

Collection Engine, Payout Engine, and Connected Banking each have a dedicated internal-flow doc
(`architecture-and-flow.md`), a customer-journey doc (`business-flow.md`), a screen inventory
(`feature-modules.md`), and a microservice breakdown (`service-architecture.md`). BBPS currently
condenses the equivalent of all four into `business-overview.md`'s sections 1–4. If this repo
gets the same deep-dive treatment later, that's the natural expansion path — each of those four
concepts already has a clear home to split into, once there's enough content to justify it.
