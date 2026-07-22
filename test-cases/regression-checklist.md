# BBPS — Regression Checklist & Test Cases

> Sample regression suite structure with dummy data. Format: ID | Scenario | Steps | Expected Result

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

## 2. Full Regression Checklist

- [ ] Bill Categories
- [ ] Bill Fetch (valid / invalid biller reference)
- [ ] Bill Fetch failure handling (timeout, error response)
- [ ] Bill Payment
- [ ] Stale-amount protection
- [ ] Transaction Status (success / failure / ambiguous)
- [ ] Settlement
- [ ] Reports

## 3. Priority Automation Candidates

1. Bill category selection
2. Bill fetch (valid biller reference)
3. Bill fetch failure handling (simulated timeout)
4. Bill payment against a freshly fetched amount
5. Transaction status polling
6. Settlement reconciliation check

See [`automation/`](../automation) for the Cypress implementation.
