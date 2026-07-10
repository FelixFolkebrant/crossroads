
## Project Overview

<!-- Replace with very brief explaination -->

## Read When Needed

All documents inside of docs is local by design.

- Product intent and constraints: `docs/project/IDEA.md`
- Current direction: `docs/project/ROADMAP.md`
- Workflow details: `docs/project/WORKFLOW.md`
- Heatmap definitions: `docs/project/HEATMAP.md`
- Accepted implementation patterns: `docs/project/PATTERNS.md`
- Accepted style choices: `docs/project/STYLE.md`
- Templates: `docs/templates/`
- Manifesto: `docs/CROSSROADS_MANIFESTO.md` only when changing workflow, templates, or this file.

## Design Philosophy

*These guidelines bias toward caution over speed. For trivial tasks, use judgment.*

**Self documenting code**
* Code should be understandable over smart
* Don't comment unless it is something that is not obvious from reading the code.

**Simplicity**
- Build simple > Premature optimization. (Major optimization suggestions should be brought up in revierw and issue notes) 
- No flexibility/configuration unless asked for
- YAGNI

> Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**Fail loudly**
* Do not create rollbacks or backups. If something fails it should fail. 

## Documentation
- **GH-XXX-PLAN.md:** Create a temporary file plan that will be deleted after merge in @docs-local/ISSUES/WIP (template exists)
- **GH-XXX-REVIEW.md** Use only when prompted. Suggest if the review requires a lot or big changes in @docs-local/ISSUES/WIP (template exists)
- **GH-XXX.md:** Create after finishing issue work. This is the only document that will exist after merge. Exists in in @docs-local/ISSUES (template exists)


## Git Conventions

- **Branch format:** `<name>/GH->/<revision>` — e.g. `felixf/GL-001/0`
- **Commit format:**
  ```
  GL-001: Summary title

  Previously we <did something>, which <caused bug | "smelled bad" | didn't let us do feature>.

  This change <explain how this change allows fixing the issue we had>
  ```
  The subject line is the issue prefix plus a short imperative title. The body is mandatory: one sentence on what existed before and why it was a problem, one sentence on how this commit resolves it.
- **Atomic commits:** one commit does exactly one thing; never bundle unrelated changes
- **Fixup commits:** use `git commit --fixup=<hash>` to create a fixup for an earlier commit; the message is set automatically as `fixup! GL-001: original message`. Before pushing,  rebase once to squash all pending fixups in one pass. 


### Completing issue work

1. Ensure the issue recap at `docs/ISSUES/GL-XXX.md` contains current **What**, **Acceptance criteria**, **Confirmation**, and **Notes** sections.
   - Confirmation must separate automated checks from manual testing.
   - Manual testing must tell the reviewer how to start the feature, what changed from the previous behavior or appearance, which actions to perform, and exactly what should be visible or happen after each action.
   - Cover every user-facing acceptance criterion, including relevant loading, empty, error, responsive, and keyboard states. Do not use vague instructions such as "run the app and inspect it."
   - Use unchecked task boxes for judgments only the user can make so approval remains with the reviewer.
2. Run the repository's relevant checks and ensure the worktree is clean.
3. Fetch the remote and rebase onto the latest default branch before pushing. If fixup commits exist, autosquash them in one pass with `GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash origin/main`. Otherwise use `git rebase origin/main`. Resolve conflicts carefully and rerun affected checks. Never rebase the default branch.
4. Push the issue branch with upstream tracking. Use a normal push when history is unchanged and `--force-with-lease` only when the rebase rewrote a branch that already exists remotely. Never use `--force`.
