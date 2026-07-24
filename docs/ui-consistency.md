# BBPS — UI Consistency

> Bill and payment data surfaces across Bill Fetch, Bill Payment confirmation, Transaction
> Status, and Reports (see [`business-overview.md`](./business-overview.md)). This document
> covers whether it's represented **consistently** across all of them.

## Why This Matters More Here Than in Most Modules

BBPS's central risk is biller-integration failure (see `business-overview.md` section 4) —
timeouts, stale amounts, ambiguous callbacks. When something goes wrong on the biller's side, the
UI is the only signal a customer has for what actually happened. Inconsistent status
representation here doesn't just look sloppy — it directly determines whether a customer retries
a payment that already went through, or gives up on one that didn't.

## 1. Status Representation Consistency

| Status | Expected Label | Expected Color (convention) |
|---|---|---|
| Bill fetched successfully | "Amount Fetched" | Neutral/Blue |
| Bill fetch failed / timeout | "Fetch Failed" | Red |
| Payment successful | "Success" | Green |
| Payment failed | "Failed" | Red |
| Stale-amount blocked | "Please Refetch" / equivalent | Amber — must be visually distinct from a hard Failed |

**Test scenario:** a stale-amount block (see `business-overview.md` section 4 and the
[`sample-defect-report.md`](../sample-defect-report.md) worked example) must never be
represented identically to a genuine payment failure — the customer's correct next action
(refetch vs. try a different payment method) depends on telling these apart.

## 2. Bill Amount Formatting Consistency

| Element | Convention to Verify |
|---|---|
| Currency symbol | Consistent ₹ placement across Bill Fetch, Payment Confirmation, and Reports |
| Decimal places | Always 2 decimal places, no screen truncating to whole rupees |
| Due date format | Consistent date format across the fetch result, payment confirmation, and report export |

## 3. Terminology Consistency

Per the glossary in [`business-overview.md`](./business-overview.md), watch for drift on:

- "Biller" vs. "Provider" vs. "Utility" used interchangeably for the same concept
- "Bill Fetch" vs. "Bill Check" vs. "Amount Lookup" as different labels for the same action
- "Settlement" here (platform-to-biller) vs. "Settlement" in Collection Engine (platform-to-
  merchant) — cross-product terminology reuse that could confuse a user familiar with both

## 4. Payment Rail Labeling Consistency

Per [`business-overview.md`](./business-overview.md) section 3, a bill payment can execute
through the internal Payout/Connected Banking rail (lower fee) or an external Payment Gateway
(standard fee). This dual-rail model introduces its own consistency requirements:

- The rail actually used (internal vs. external) must be labeled identically across Payment
  Confirmation, Transaction Status, and Reports — never "Internal Rail" in one place and "Payout
  Payment" in another
- The fee shown *before* confirming payment must match the fee actually charged — no
  last-second rail switch that changes the fee after the customer has already seen and accepted
  a quote
- If a Report or Reconciliation view breaks down transactions by rail, the terminology there
  must match the terminology used at payment time exactly

## 5. Empty States & Error Messages

- Does Bill Categories, Transaction Reports, and biller search each show a deliberate empty
  state when there's no data or no matching billers?
- Is the "biller unavailable" / timeout error worded consistently regardless of which biller
  category (electricity, water, gas, etc.) triggered it?

## 6. Cross-Browser & Responsive Consistency

- Do status badges and bill-fetch results render identically across Chrome, Firefox, and
  Safari/WebKit?
- Does the biller category selection grid degrade gracefully on smaller viewports without
  losing category icons/labels?

## 7. Accessibility Consistency

- Are Success/Failed/Fetch-Failed/Please-Refetch states distinguishable by more than color alone?

---

## Coverage Mapping

See [`../regression-checklist.md`](../regression-checklist.md) section 3 for the UI consistency
test cases (TC-011–015) derived from this document.
