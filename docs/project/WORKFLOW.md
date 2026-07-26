# Crossroads Workflow

This file is the operational version of `docs/CROSSROADS_MANIFESTO.md`. The manifesto is the highest-level source of truth when changing the workflow itself.

## File Roles

- `docs/project/IDEA.md`: product intent, user flows, and constraints.
- `docs/project/ROADMAP.md`: current direction and upcoming Planpoints.
- `docs/planpoints/PP-<n>.md`: accepted vertical slice plan.
- `docs/wip/GH-<n>-PLAN.md`: accepted issue plan before code.
- `docs/wip/GH-<n>-REVIEW.md`: review findings and fix status.
- `docs/wip/GH-<n>.md`: final issue record before merge.
- `docs/issues/GH-<n>.md`: final issue record after merge.
- `docs/project/HEATMAP.md`: canonical heatmap definitions.
- `docs/project/PATTERNS.md`: accepted reusable implementation patterns.
- `docs/project/STYLE.md`: accepted stylistic choices.

## Planning

1. Create or update `docs/project/IDEA.md`.
2. Create or update `docs/project/ROADMAP.md`.
3. Wait for roadmap acceptance.
4. Create `docs/planpoints/PP-<n>.md`.
5. Wait for Planpoint acceptance.

Roadmaps set direction. Planpoints decide only the hard-to-reverse choices needed before issue work starts.

## Issue Work

1. Read `docs/project/PATTERNS.md` and `docs/project/STYLE.md`.
2. Create `docs/wip/GH-<n>-PLAN.md` from the template.
3. Record the applicable project guidance IDs, or explicitly record `None`.
4. Propose any issue-level Hot or Stylistic decisions that should become project guidance.
5. Wait for plan acceptance.
6. Check out `<name>/GH-<n>/<revision>`.
7. Implement the accepted plan with atomic commits, including project guidance accepted with the plan.
8. Keep `docs/wip/GH-<n>.md` updated with what changed, plan diffs, decisions, verification, and project guidance.

Choices already settled by accepted project guidance are Warm or Cold. Issue plans contain only new issue-level Hot decisions and notable Stylistic choices. Crossroads belong in the roadmap or Planpoint unless discovered late.

If implementation departs from accepted project guidance or reveals a reusable decision, record it as Hot or Stylistic until the user accepts the change.

## Review Loop

1. Review the branch into `docs/wip/GH-<n>-REVIEW.md`, including project guidance conformance and promotion candidates.
2. User accepts findings and each proposed project guidance entry.
3. Fix each accepted finding and add each accepted guidance entry with `git commit --fixup=<target-hash>`.
4. User reviews the fixup commits.
5. Update `docs/wip/GH-<n>.md` with applied and changed guidance, then check off `docs/wip/GH-<n>-REVIEW.md`.
6. Rebase the branch after accepted fixes.
7. Repeat until accepted.

## Finish

1. Confirm any accepted guidance is recorded in `PATTERNS.md` or `STYLE.md` and the final issue record.
2. Push the branch and create the PR.
3. Run CI and manual review if requested.
4. After approval and merge, remove WIP docs.
5. Move the final issue record to `docs/issues/GH-<n>.md`.
