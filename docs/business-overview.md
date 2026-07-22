# BBPS — Business Overview

> **Start here if you're new to fintech QA, in HR, or from a non-QA technical role.** This
> document explains what a BBPS integration does and why it matters, before you look at any
> test case or code.

## 1. What problem does it solve?

Consumers pay dozens of different bills — electricity, water, gas, DTH, telecom, insurance — each
traditionally on the biller's own separate portal. BBPS standardizes this into one payment rail:
a platform integrated with BBPS can let a user pay any registered biller's bill in one place.

## 2. Core Modules

- **Bill Categories** — the taxonomy of biller types offered (electricity, water, gas, DTH, etc.)
- **Bill Fetch** — a real-time call to the biller to retrieve the current outstanding amount
- **Bill Payment** — the actual payment against a fetched bill
- **Transaction Status** — tracks the payment to a definitive success/failure state
- **Settlement** — the financial reconciliation between the platform and the biller
- **Reports** — payment history and settlement reporting

## 3. Why Biller Integration Risk Is the Central Testing Theme

Unlike a self-contained product, a BBPS platform's reliability partly depends on **systems it
doesn't own** — each biller's own backend. This creates a distinct risk profile:

- A biller can time out or be temporarily unavailable during fetch
- A fetched bill amount can become stale if payment happens even slightly later
- A biller's status callback can be delayed or inconsistent, leaving a transaction in an
  ambiguous state from the user's point of view

Because of this, QA strategy for BBPS treats **biller failure modes** as first-class scenarios,
not edge cases — a platform that only tests the happy path will pass internal testing and still
fail in production the moment one biller has a bad day.

## 4. Glossary

| Term | Meaning |
|---|---|
| **Biller** | The utility/service provider whose bill is fetched and paid (e.g. an electricity provider) |
| **Bill Fetch** | The real-time lookup of a bill's current outstanding amount |
| **Stale Amount** | A previously fetched bill amount that may no longer be accurate by payment time |
| **Settlement** | The reconciliation of funds between the platform and the biller after payment |
| **BBPS** | Bharat Bill Payment System — the standardized ecosystem this platform integrates with |

## 5. Cross-Module Dependencies

- **Commercial Engine** — for any platform convenience fee
- **Ledger** — for settlement reconciliation records
- **Reports** — for merchant/internal reconciliation views
