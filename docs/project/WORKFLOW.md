# Crossroads Workflow

This file is the operational version of the manifesto. Use the manifesto only when changing the workflow itself.

## File Roles

- `docs/project/IDEA.md`: product intent, user flows, constraints.
- `docs/project/ROADMAP.md`: current direction and upcoming planpoints.
- `docs/planpoints/PP-<n>.md`: accepted vertical slice plan.
- `docs/wip/GH-<n>-PLAN.md`: accepted issue plan before code.
- `docs/wip/GH-<n>-REVIEW.md`: review findings and fix status.
- `docs/wip/GH-<n>.md`: final issue record before merge.
- `docs/issues/GH-<n>.md`: final issue record after merge.
- `docs/project/PATTERNS.md`: accepted reusable implementation patterns.
- `docs/project/STYLE.md`: accepted stylistic choices.

## Planning

1. Start from `IDEA.md`.
2. Draft or update `ROADMAP.md`.
3. Wait for roadmap acceptance.
4. Draft `PP-<n>.md`.
5. Wait for planpoint acceptance.

Roadmaps stay loose. Planpoints decide only the hard-to-reverse choices needed before issue work starts.

## Issue Work

1. Create `docs/wip/GH-<n>-PLAN.md` from the template.
2. Check out `FelixFolkebrant/GH-<n>{/<revision>}`.
3. Implement the accepted plan with atomic commits.
4. Keep `docs/wip/GH-<n>.md` updated with what changed, plan diffs, decisions, and verification.

Issue plans contain issue-level Hot decisions. Crossroads belong in the roadmap or planpoint unless discovered late.

## Review Loop

1. Review the branch into `docs/wip/GH-<n>-REVIEW.md`.
2. User accepts the review.
3. Fix each accepted finding with `git commit --fixup=<target-hash>`.
4. Update `GH-<n>.md` and check off `GH-<n>-REVIEW.md`.
5. User reviews fixup commits.
6. Rebase only after the user says to.
7. Repeat until accepted.

## Finish

1. Push the branch and create the MR/PR.
2. Run CI and manual review if requested.
3. After approval and merge, remove WIP docs.
4. Move the final issue record to `docs/issues/GH-<n>.md`.
