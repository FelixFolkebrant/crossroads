## Project Overview

Crossroads is a documentation workflow for planning and reviewing AI-assisted project work while keeping human decisions explicit.

## Project Context

All documents inside `docs/` are local by design.

- Product intent and constraints: `docs/project/IDEA.md`
- Current direction: `docs/project/ROADMAP.md`
- Workflow details: `docs/project/WORKFLOW.md`
- Heatmap definitions: `docs/project/HEATMAP.md`
- Accepted implementation patterns: `docs/project/PATTERNS.md`
- Accepted style choices: `docs/project/STYLE.md`
- Templates: `docs/templates/`
- Manifesto: `docs/CROSSROADS_MANIFESTO.md` only when changing workflow, templates, or this file.

Before planning, implementing, or reviewing issue work:
- Read `docs/project/PATTERNS.md` and `docs/project/STYLE.md`.
- Record each applicable project guidance ID in the issue plan, or explicitly record `None`.
- Treat choices settled by accepted project guidance as Warm or Cold instead of reconsidering them as Hot or Stylistic.

When an issue-level Hot or Stylistic decision should guide future work, propose it as project guidance in the issue plan or review. Add it to `PATTERNS.md` or `STYLE.md` only after the user accepts the proposal, then record the change in the final issue record.

## Maintaining This Template

When changing Crossroads itself, keep the repository as a generic template:
- `docs/wip/`, `docs/issues/`, and `docs/planpoints/` may contain local maintenance artifacts, but never commit anything there except `.gitkeep`.
- Do not populate `docs/project/IDEA.md` or `docs/project/ROADMAP.md` with Crossroads maintenance work.
- Remove local maintenance artifacts before merging.

## Design Philosophy

*These guidelines bias toward caution over speed. For trivial tasks, use judgment.*

**Self-documenting code**
- Code should be understandable over smart.
- Do not comment unless the reason is not obvious from reading the code.

**Simplicity**
- Build simple over premature optimization. Major optimization suggestions belong in review and issue notes.
- No flexibility or configuration unless asked for.
- YAGNI.

> Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**Fail loudly**
- Do not create rollbacks or backups. If something fails, it should fail.

## Documentation

- **GH-XXX-PLAN.md:** Temporary issue plan in `docs/wip/`, deleted after merge.
- **GH-XXX-REVIEW.md:** Temporary review document in `docs/wip/`, used only when prompted.
- **GH-XXX.md:** Final issue record. Keep it in `docs/wip/` before merge, then move it to `docs/issues/` after merge.

## Git Conventions

- **Branch format:** `<name>/GH-<n>/<revision>`; for example, `felixf/GH-001/0`.
- **Commit format:**
  ```text
  GH-001: Summary title

  Previously we <did something>, which <caused bug | "smelled bad" | did not let us do feature>.

  This change <explain how this change fixes the issue>.
  ```
  The subject line is the issue prefix plus a short imperative title. The body is mandatory: one sentence on what existed before and why it was a problem, one sentence on how this commit resolves it.
- **Atomic commits:** one commit does exactly one thing; never bundle unrelated changes.
- **Fixup commits:** use `git commit --fixup=<hash>` to create a fixup for an earlier commit. Before pushing, rebase once to squash all pending fixups in one pass.

### Completing Issue Work

1. Ensure the issue recap at `docs/wip/GH-XXX.md` contains current **What**, **Acceptance Criteria**, **Confirmation**, **Project Guidance**, and **Notes** sections.
   - Confirmation must separate automated checks from manual testing.
   - Manual testing must tell the reviewer how to start the feature, what changed from the previous behavior or appearance, which actions to perform, and exactly what should be visible or happen after each action.
   - Cover every user-facing acceptance criterion, including relevant loading, empty, error, responsive, and keyboard states. Do not use vague instructions such as "run the app and inspect it."
   - Use unchecked task boxes for judgments only the user can make so approval remains with the reviewer.
2. Run the repository's relevant checks and ensure the worktree is clean.
3. Fetch the remote and rebase according to `docs/CROSSROADS_MANIFESTO.md` and `docs/project/WORKFLOW.md`. Resolve conflicts carefully and rerun affected checks. Never rebase the default branch.
4. Push the issue branch with upstream tracking. Use a normal push when history is unchanged and `--force-with-lease` only when the rebase rewrote a branch that already exists remotely. Never use `--force`.
