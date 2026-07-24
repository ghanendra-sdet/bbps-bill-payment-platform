# Sample Defect Report — BBPS

> Template + worked example using dummy data. Reflects the biller-integration failure modes
> that are the primary defect theme for this module — see
> [`docs/business-overview.md`](./docs/business-overview.md) section 4 for why, and
> [`docs/README.md`](./docs/README.md) for the full documentation map.

---

## Defect #1

| Field | Value |
|---|---|
| **ID** | BUG-BBPS-1104 (sample) |
| **Title** | Payment charges a stale bill amount after biller updates the balance mid-session |
| **Severity** | Critical |
| **Module** | BBPS → Bill Fetch / Payment |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Fetch a dummy bill — amount shown as ₹850
2. Wait several minutes without refreshing (simulating a biller-side amount update in the
   background, e.g. a partial payment made directly with the biller)
3. Proceed to pay the originally fetched ₹850

**Expected Result**
The platform should re-validate the amount immediately before charging, or clearly prompt the
user to refetch if enough time has passed — never charge a potentially outdated amount silently.

**Actual Result**
The payment proceeds with the stale ₹850 figure with no re-validation, even though the freshness
window has clearly elapsed.

**Impact**
Risk of overpayment or underpayment relative to the biller's true current balance — a direct
correctness and trust issue, and a support-ticket generator.

**Suggested Fix**
Enforce a maximum freshness window on fetched amounts; if payment is attempted after that window,
force a silent re-fetch (or prompt the user) before allowing payment to proceed.

---

## Defect #2

| Field | Value |
|---|---|
| **ID** | BUG-BBPS-1122 (sample) |
| **Title** | Merchant charged the external Gateway fee despite having an active internal Payout rail |
| **Severity** | Major |
| **Module** | BBPS → Payment Rail Selection |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. As a dummy merchant with an active Payout/Connected Banking service, fetch a dummy bill
2. Pay it and check which fee was applied

**Expected Result**
Per [`docs/business-overview.md`](./docs/business-overview.md) section 3, an eligible merchant
should be routed through the internal Payout/Connected Banking rail and charged the lower
service fee.

**Actual Result**
The payment is routed through the external Payment Gateway and charged the standard (higher) fee
— the rail-selection check only looks at whether the merchant has *ever* had a Payout account,
not whether that service is *currently active*, so a merchant whose Payout eligibility was
recently reinstated after a lapse is incorrectly still routed externally.

**Impact**
Merchants are overcharged relative to what they're commercially entitled to, and internal
transaction volume that should route through Payout/Connected Banking silently leaks to a
third-party gateway instead — both a merchant-trust issue and a lost-revenue-routing issue.

**Suggested Fix**
Check live Payout/Connected Banking service status at the moment of rail selection, not a cached
or historical eligibility flag.

---

## Defect Reporting Template (blank)

| Field | Value |
|---|---|
| **ID** | |
| **Title** | |
| **Severity** | Minor / Major / Critical / Blocker |
| **Module** | |
| **Environment** | |

**Steps to Reproduce**
1.
2.
3.

**Expected Result**


**Actual Result**


**Impact**


**Suggested Fix**

