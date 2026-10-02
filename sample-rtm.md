# Sample Requirement Traceability Matrix — BBPS

> Worked example using dummy data. An RTM is referenced throughout this repo's sibling documents
> as a core QA artifact — this is what that artifact actually looks like, not just a claim that
> it exists. See [`docs/README.md`](./docs/README.md) for the full documentation map.

## What an RTM Is Actually For

A regression checklist (see [`regression-checklist.md`](./regression-checklist.md)) answers
"what do we test." An RTM answers a different, equally important question: **"does every
business requirement have test coverage, and is that coverage actually sufficient?"** The two
documents look similar but serve different purposes — a checklist is organized by test area; an
RTM is organized by *requirement*, which is what makes it the tool that actually catches a
requirement with **no** test coverage at all, not just a weakly-tested one.

## The Matrix

| Req ID | Requirement (from a sample sprint story) | Linked Test Case(s) | Automation Status | Coverage Status |
|---|---|---|---|---|
| REQ-301 | All supported bill categories are listed and selectable | TC-001 | Automated | ✅ Covered |
| REQ-302 | A valid consumer number returns the current outstanding amount | TC-002 | Automated | ✅ Covered |
| REQ-303 | An invalid consumer number is rejected with a clear error, no amount shown | TC-003 | Automated | ✅ Covered |
| REQ-304 | A biller timeout never displays a stale or zero amount as if it were current | TC-004 | Automated | ✅ Covered |
| REQ-305 | Payment against a freshly fetched amount succeeds and transitions status correctly | TC-005 | Automated | ✅ Covered |
| REQ-306 | Payment against a bill fetched outside the freshness window is blocked, never silently charged | TC-006 | Manual | ✅ Covered — this is the requirement `BUG-BBPS-1104` violated |
| REQ-307 | An ambiguous/delayed biller callback shows a Processing state, never a false Success or Failure | TC-008 | Manual | ✅ Covered |
| REQ-308 | Settlement totals reconcile exactly against payment totals for a given period | TC-009 | Manual | ⚠️ Partial — only the matching case is tested; no case covers what happens when totals *don't* match |
| REQ-309 | A merchant with an active internal Payout/Connected Banking service is routed to it, at the lower fee | TC-016 | Automated | ✅ Covered |
| REQ-310 | A merchant's rail eligibility is checked live, not from a cached/historical flag | TC-021 | Manual | ✅ Covered — this is the requirement `BUG-BBPS-1122` violated |
| REQ-311 | The fee shown before payment confirmation always matches the fee actually charged | TC-018 | Manual | ✅ Covered |
| REQ-312 | Bill-fetch latency and error rate stay within defined targets during due-date-driven traffic spikes | — | — | ❌ **Gap — identified when performance testing was added to this suite; see `docs/tech-and-skills.md` section 5** |
| REQ-313 | A reconciliation mismatch is actively flagged to the Finance Team, not just silently detected | — | — | ❌ **Gap — no test case exists yet** |

## What the Gaps Actually Caught

This is the part a checklist alone wouldn't surface, because a checklist only tells you about the
tests that already exist:

- **REQ-312** is a gap this RTM only caught because performance testing was added to this suite's
  scope at all. `TC-004`–`TC-006` all test biller/fetch behavior one request at a time — none of
  them say anything about whether the fetch path (and, critically, the freshness-window check
  riding on top of it) still holds its correctness and latency targets during the kind of 10x
  due-date traffic spike [`docs/tech-and-skills.md`](./docs/tech-and-skills.md) section 5
  describes. A slow fetch under load could push a legitimate, promptly-paid bill right up against
  the staleness boundary — a false positive this suite had never actually tested for.
- **REQ-313** came from reading `TC-009` literally: it only asserts "Totals match exactly." Per
  [`architecture-and-flow.md`](./docs/architecture-and-flow.md) section 5, reconciliation exists
  specifically to catch the *mismatch* case — but there was no test confirming a mismatch actually
  reaches the Finance Team (per `business-overview.md` section 6) rather than being logged
  somewhere nobody looks at it. A reconciliation engine that detects a problem but doesn't
  surface it is barely better than one that doesn't detect it at all. Raised as a new story
  (illustrative ID `BBPS-2208`).

**The general pattern:** an RTM's value isn't the rows that say "Covered" — those just confirm
existing test design. Its value is specifically the rows that say "Gap" or "Partial," because
those are the requirements a test-case-first workflow (write tests, forget to check them against
the original requirement list) would never have surfaced on its own.
