# BBPS — Regression Checklist & Test Cases

> Sample regression suite structure with dummy data. Format: ID | Scenario | Steps | Expected Result.
> See [`docs/business-overview.md`](./docs/business-overview.md) for why biller-integration
> failure modes (TC-004, TC-006) are treated as first-class scenarios here, and
> [`docs/README.md`](./docs/README.md) for the full documentation map.

## 1. Core Flow

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-001 | Bill category listing | 1. Open bill payment section | All supported categories (electricity, water, gas, DTH, etc.) are listed |
| TC-002 | Bill fetch — valid reference | 1. Select category 2. Enter a dummy valid biller reference/consumer number | Current outstanding amount is fetched and displayed |
| TC-003 | Bill fetch — invalid reference | 1. Enter a dummy invalid consumer number | Clear "invalid reference" error, no amount shown |
| TC-004 | Bill fetch — biller timeout | 1. Simulate a biller timeout (test env) | Clear timeout error shown, user can retry, no stale amount displayed |
| TC-005 | Bill payment — happy path | 1. Fetch a bill 2. Pay the fetched amount immediately | Payment succeeds, status transitions correctly |
| TC-006 | Stale-amount protection | 1. Fetch a bill 2. Wait beyond the platform's freshness window 3. Attempt payment | Platform re-validates or blocks payment with a "please refetch" message — never silently charges the old amount |
| TC-007 | Transaction status — success | 1. Complete a successful payment 2. Check status | Status shows SUCCESS with correct amount and timestamp |
| TC-008 | Transaction status — ambiguous/pending | 1. Simulate a delayed biller callback | Status shows a clear "Processing" state, not a false SUCCESS or FAILURE |
| TC-009 | Settlement reconciliation | 1. Compare settlement report totals to payment totals for a date range | Totals match exactly |
| TC-010 | Report download | 1. Download a payment history report | Downloaded totals match on-screen data |

## 2. Payment Rail Selection (Gateway vs. Internal Payout Rail)

> Derived from [`docs/business-overview.md`](./docs/business-overview.md) section 3 — a merchant
> already using Payout/Connected Banking gets a lower fee routing through that internal rail
> instead of an external Payment Gateway.

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-016 | Internal rail selected when eligible | 1. As a dummy merchant with an active Payout/Connected Banking service, pay a fetched bill | Payment routes through the internal Payout/Connected Banking rail; lower service charge applied |
| TC-017 | External Gateway selected when no internal rail | 1. As a dummy merchant with no active Payout/Connected Banking service, pay a fetched bill | Payment routes through the external Payment Gateway (dummy PhonePe PG/Razorpay PG/Cashfree PG); standard gateway fee applied |
| TC-018 | Correct fee displayed before payment confirmation | 1. Initiate payment as an internal-rail-eligible merchant 2. Initiate payment as a non-eligible merchant | Each shows its own correct, distinct fee amount prior to confirmation — never the wrong rail's fee |
| TC-019 | Rail choice reflected accurately in Reports | 1. Complete one payment via each rail 2. Check the reconciliation/reports view | Each transaction's report line item correctly attributes which rail was used and which fee applied |
| TC-020 | Internal rail failure falls back gracefully (or fails clearly) | 1. Simulate the internal Payout/Connected Banking rail being unavailable for an eligible merchant (test env) | Either a clear, defined fallback to the external Gateway occurs, or a clear error is shown — never a silent hang or double-charge |
| TC-021 | Merchant eligibility change reflected correctly | 1. Deactivate a merchant's Payout/Connected Banking service 2. Attempt a bill payment immediately after | Merchant is correctly routed to the external Gateway on the very next payment — no stale "eligible" state |

## 3. UI Consistency

> Derived from [`docs/ui-consistency.md`](./docs/ui-consistency.md) — cross-screen consistency,
> not single-screen correctness.

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-011 | Stale-amount block visually distinct from a hard failure | 1. Trigger a stale-amount block (TC-006) 2. Compare against a genuine payment failure (TC-004-style) | Different color/label — never overlapping |
| TC-012 | Currency formatting consistency | 1. View the same bill amount on Bill Fetch, Payment Confirmation, and an exported Report | Decimal places, thousands separator, and ₹ placement match exactly |
| TC-013 | Due date formatting consistency | 1. Compare the due date shown at fetch time vs. on the payment confirmation vs. in a report export | Identical date format across all three |
| TC-014 | Terminology consistency: "Biller" | 1. Compare labels referring to the service provider across category selection, fetch results, and reports | Identical terminology used everywhere — no "Biller" in one place and "Provider" in another |
| TC-015 | Status badges distinguishable without color | 1. View Success/Failed/Fetch-Failed/Please-Refetch badges with color/grayscale rendering simulated | Each remains distinguishable via icon/text label alone |
| TC-022 | Payment rail label consistency | 1. Compare how "Internal Payout Rail" vs. "External Gateway" is labeled across Payment Confirmation, Transaction Status, and Reports | Identical rail naming/labeling used everywhere — no "Internal Rail" in one place and "Payout Payment" in another |

## 4. Full Regression Checklist

- [ ] Bill Categories
- [ ] Bill Fetch (valid / invalid biller reference)
- [ ] Bill Fetch failure handling (timeout, error response)
- [ ] Bill Payment
- [ ] Payment Rail Selection (internal Payout/Connected Banking vs. external Gateway)
- [ ] Stale-amount protection
- [ ] Transaction Status (success / failure / ambiguous)
- [ ] Settlement
- [ ] Reports
- [ ] UI Consistency (status representation, formatting, terminology, accessibility)

## 5. Priority Automation Candidates

1. Bill category selection
2. Bill fetch (valid biller reference)
3. Bill fetch failure handling (simulated timeout)
4. Bill payment against a freshly fetched amount
5. Transaction status polling
6. Settlement reconciliation check

See [`automation/`](./automation) for the Cypress implementation.
