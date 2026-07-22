# BBPS — Automation Framework

Automation for the BBPS bill fetch-to-payment journey, built with **Cypress + JavaScript**.

## Why Cypress

- Strong support for intercepting/mocking network calls — essential here, since simulating biller
  timeouts and delayed status callbacks is a core part of this module's test strategy
- Fast feedback loop for UI-heavy flows like category selection and bill fetch display

## Suggested Project Structure

```
automation/
├── README.md
├── cypress.config.js
├── cypress/
│   ├── e2e/
│   │   └── sample-bill-payment.cy.js
│   ├── fixtures/
│   │   └── dummy-biller-response.json
│   └── support/
```

> This repo currently includes one representative sample (`sample-bill-payment.spec.ts`, written
> in Cypress-compatible style) rather than the full framework, to keep the portfolio focused.

## Test Data Policy

All automation uses **dummy data only**:
- Dummy consumer numbers / biller references
- Mocked biller responses (including simulated timeouts and stale-amount scenarios) rather than
  hitting any real biller

## Priority Automated Scenarios

1. Bill category selection
2. Bill fetch (valid biller reference)
3. Bill fetch failure handling (simulated timeout)
4. Bill payment against a freshly fetched amount
5. Transaction status polling
6. Settlement reconciliation check
