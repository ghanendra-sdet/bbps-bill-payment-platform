# BBPS — Shared Platform Services

> BBPS doesn't run in isolation — it's one of several products (Collection, Payout, Connected
> Banking, BBPS, Reseller, and others) built on top of a **common company-wide platform layer**.
> This document lists the shared services BBPS depends on, distinct from BBPS-specific modules
> like Bill Fetch and Bill Payment (see [`business-overview.md`](./business-overview.md)).

## Why "Shared Platform" Matters for Testing

A defect in a shared service doesn't stay contained to one product. A bug in the company-wide
**Settlement Engine**, for example, doesn't just affect BBPS's biller settlement — it silently
affects Collection's and Payout's settlement correctness too. This is why a change to a shared
service should trigger **cross-product smoke testing**, not just regression scoped to whichever
product initiated the change.

## Shared Platform Services (Company-Wide)

### Identity & Access
- Authentication
- Authorization
- OTP Service
- User Management
- Role & Permission Service

### Merchant Lifecycle
- Merchant Management
- Merchant Onboarding
- Merchant Activation
- Merchant Profile

### Financial Engines
- Commercial Engine
- GST Engine
- Ledger Engine
- Settlement Engine
- Reconciliation Engine

### Reporting & Data Export
- Report Engine
- Export Engine
- Download Engine
- Dashboard Service
- Search Engine
- Filter Engine

### Platform Infrastructure
- Audit Logs
- Activity Logs
- Notification Service
- API Gateway
- Validation Service
- File Upload Service
- File Download Service
- Scheduler / Background Workers

## How BBPS Depends on These

- **Settlement Engine / Reconciliation Engine** — BBPS's biller settlement (see
  [`business-overview.md`](./business-overview.md) section 2) reconciles against the same shared
  settlement infrastructure other products use, rather than BBPS running its own independent
  settlement logic
- **Commercial Engine** — any convenience fee charged on top of a fetched bill amount goes
  through the same shared commercial calculation layer as Collection and Payout's fees — this now
  includes two different fee schedules depending on payment rail (see
  [`business-overview.md`](./business-overview.md) section 3)
- **Notification Service** — payment confirmations and bill-fetch failure notices flow through
  the shared notification layer
- **Scheduler / Background Workers** — biller reconciliation and any scheduled bill-fetch retry
  logic likely runs on the same shared async infrastructure used platform-wide

## Direct Product Dependency: Payout Engine & Connected Banking (Not "Shared Platform," But Related)

Beyond the shared engines above, BBPS has a direct **product-to-product** dependency worth
calling out separately: bill payments can execute through the **Payout Engine** or **Connected
Banking** as an internal, lower-fee rail instead of an external Payment Gateway (see
[`business-overview.md`](./business-overview.md) section 3). This is not a "shared service" in
the same sense as the engines above — it's BBPS calling into another product's own transfer
capability directly. A regression in Payout's or Connected Banking's transfer execution could
therefore surface as a BBPS payment defect, even though the shared engines above are unaffected.

## Platform Summary (Company-Wide Context)

| Product | Approx. Services |
|---|---|
| Collection | 38 |
| Payout | 35 |
| Connected Banking | 28 |
| Shared Platform | 28 |

**~70–80 unique logical services** across the platform in total — many shared rather than
independently reimplemented per product. BBPS does not have its own separately-documented
internal service breakdown in this portfolio; its module-level view is in
[`business-overview.md`](./business-overview.md).

## Testing Implication: Blast Radius

When scoping regression for a change to any shared service, ask: *which other products also
depend on this service?* For BBPS specifically, the Settlement Engine and Reconciliation Engine
are the dependencies most worth flagging — a regression there could silently produce the kind of
biller-settlement mismatch documented in [`../sample-defect-report.md`](../sample-defect-report.md),
even if nothing in BBPS's own bill-fetch/payment code changed. The direct Payout Engine/Connected
Banking dependency above has the same property in reverse: a Payout regression could surface as
a BBPS defect first, if BBPS-originated transfers are what a QA team notices failing.
