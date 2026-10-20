# BBPS — Documentation Map

> If you're approaching this repo the way a curious QA engineer, automation tester, or
> tech-enthusiast would — "what is this, how does it actually work, who's involved, what does it
> depend on" — this page answers that directly, one question at a time. `architecture-and-flow.md`
> below carries the real Mermaid sequence diagrams, grounded in the actual BBPCU/BBPOU/COU/BOU
> Bharat Connect participant structure.

| Your Question | Answer Lives In |
|---|---|
| **What is this, in plain terms?** | [`business-overview.md`](./business-overview.md) — the "start here" doc |
| **What are the modules and submodules?** | [`business-overview.md`](./business-overview.md) section 2 |
| **How does fetch, payment, and rail selection actually work — real sequence diagrams?** | [`architecture-and-flow.md`](./architecture-and-flow.md) |
| **How does a real stale-amount or wrong-rail defect actually happen under the hood?** | [`architecture-and-flow.md`](./architecture-and-flow.md) sections 2–3 |
| **What tech was used, and what skills does this repo demonstrate?** | [`tech-and-skills.md`](./tech-and-skills.md) |
| **Who's involved? (Stakeholders)** | [`business-overview.md`](./business-overview.md) section 6 — Customers, Billers, Merchants, NPCI/Bharat Connect Ecosystem, Banks, Payment Gateway Providers, Finance Team |
| **What does it depend on?** | [`shared-platform-services.md`](./shared-platform-services.md) (company-wide shared engines) + **Payout Engine / Connected Banking** (internal payment rail) + external billers and Payment Gateways |
| **How does it work? (Business/Tech Flow)** | [`business-overview.md`](./business-overview.md) sections 1–4 — Bill Categories → Bill Fetch → Bill Payment (Gateway vs. internal Payout rail) → Settlement, and why biller/PG failure is the central risk |
| **What's actually tested?** | [`../regression-checklist.md`](../regression-checklist.md) |
| **Does the UI behave consistently everywhere?** | [`ui-consistency.md`](./ui-consistency.md) |
| **What's been automated?** | [`../automation/`](../automation) |
| **What real defects has this surfaced?** | [`../sample-defect-report.md`](../sample-defect-report.md) |
| **What does a regression run look like?** | [`../regression-execution-summary.md`](../regression-execution-summary.md) |
| **What does a Requirement Traceability Matrix (RTM) actually look like?** | [`../sample-rtm.md`](../sample-rtm.md) |

## Reading Order (Recommended)

```
1. business-overview.md         ← the "why" — what problem, modules, who's involved, biller-risk framing
        │
        ▼
2. architecture-and-flow.md     ← real Mermaid sequence/flow diagrams: fetch, stale-amount guard,
        │                           rail selection, biller timeout, settlement
        ▼
3. tech-and-skills.md           ← full tech stack, skill → proof map, CI/CD shape, performance depth
        │
        ▼
4. ui-consistency.md            ← the "does it hold together" — cross-screen consistency
        │
        ▼
5. regression-checklist.md, automation/, sample-defect-report.md, sample-rtm.md,
   regression-execution-summary.md ← the proof — coverage, automation, real findings, real numbers
```
