# Sample Defect Report — BBPS

> Template + worked example using dummy data. Reflects the biller-integration failure modes
> that are the primary defect theme for this module.

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

