# Release 0 Bug Bash Checklist

Issue: #23  
Milestone: Release 0 - Playable Seed  
Date: 2026-05-03

## Verification Tier

- Tier B
- Browser MCP unavailable - manual only.

## Focused Checklist

- [x] Confirm release scope and dependencies for #23.
- [x] Start app with `pnpm dev` and confirm dev server readiness.
- [x] Validate baseline behavior with automated checks (`pnpm test`).
- [x] Review core Release 0 gameplay paths (feed, hunger/death, pause, save) via targeted code-path inspection and existing test coverage.
- [x] Log material defects with severity, reproducible steps, and milestone assignment.
- [x] Classify each defect as blocker or non-blocker.

## Defects Logged

1. #180 - Food flakes never expire after lifetime  
   - Severity: High
   - Classification: Non-blocker
2. #181 - Escape key does not toggle pause  
   - Severity: Medium
   - Classification: Non-blocker
3. #183 - Run snapshot autosave is not tied to simulated day rollover  
   - Severity: High
   - Classification: Non-blocker

## Blocker Summary

- No release blockers identified in this bug bash pass.

## Issue #24 Resolution Notes

- Confirmed all defects logged during #23 are classified as non-blockers.
- Blocker fix scope for #24 is therefore empty for this release pass.
- Remaining defects #180 and #183 stay tracked as non-blockers under milestone Release 0.
- Validation for #24 closure is provided via fresh `pnpm lint`, `pnpm test`, and `pnpm build` runs in this PR.
