---
name: one-shot
description: Turn a freeform IDEA.md into a finished, verified small software project through one decision gate and one prototype/readiness gate, followed by an unattended build. Use for greenfield utilities, plugins, extensions, and similarly bounded applications that should be completed in one focused run. Do not use for ongoing feature work, large products that need gradual planning, or requests that only ask for a prototype or plan.
---

# One Shot

Build a small project completely while concentrating human input into two concrete approvals. Prefer a well-motivated proposal over an exploratory interview.

## Ground Rules

- Treat the repository-root `IDEA.md` as the source prompt. Preserve its freeform shape.
- Read and follow repository instructions. Treat explicit choices in `IDEA.md` as decided, including stack and style preferences.
- Resolve routine gaps from the repository, established conventions, and focused research. Do not ask questions that can be answered safely that way.
- Keep the workflow proportional to a small project. Do not introduce roadmaps, issues, feature branches, review loops, or speculative extensibility.
- Do not implement product code before both gates pass.
- Do not deploy, publish, purchase, create accounts, or mutate third-party production data unless `IDEA.md` explicitly authorizes it.

Read [references/heatmap.md](references/heatmap.md) before classifying decisions or creating `decisions.html`.

## 0. Establish The Input

1. Locate `IDEA.md` at the repository root.
2. If it is missing, copy [assets/IDEA.md](assets/IDEA.md) there and stop. Tell the user to write the idea in any form and invoke `$one-shot` again.
3. Inspect the repository, applicable instructions, Git state, available runtimes, and any existing code before proposing choices.
4. Determine whether the requested outcome is reasonably one-shot sized. If not, make the smallest coherent scope boundary a Crossroad instead of silently dropping features.
5. Research current facts only when they materially affect a Crossroad, dependency, integration, or implementation. Prefer primary sources.

## 1. Create The Decision Gate

Create `decisions.html` from [assets/decisions.html](assets/decisions.html) and copy [assets/document.css](assets/document.css) to `.one-shot/document.css`.

Populate only these sections:

- **Crossroads:** hard-to-reverse product, architecture, provider, ownership, security, destructive-behavior, or workflow choices.
- **Hot decisions:** opinionated implementation or interaction choices with real alternatives that do not block progress.

For each decision:

- Use stable IDs `C1`, `C2`, ... and `H1`, `H2`, ... .
- State the decision, alternatives, proposed choice, rationale, and review consequence.
- Mark user choices already stated in `IDEA.md` as `Decided in IDEA`, not as open questions.
- Recommend one option. Do not present equivalent options without judgment.
- Include only decisions that can change the resulting product. Omit Warm, Cold, Stylistic, and routine implementation work.

Always include the late-Crossroad policy as a Crossroad unless repository guidance has already settled it:

- **Continue:** choose the option with the lowest reversal cost, continue unattended, and record the late decision prominently in `build.html`.
- **Stop:** leave the repository safe and report the exact decision needed.

Recommend **Continue** for the normal one-shot goal, but make the delegation explicit.

Do not create an additional plan document. `IDEA.md` and `decisions.html` are the complete pre-prototype context.

### Gate 1

Ask one question after writing and checking `decisions.html`:

1. Accept the proposed decisions and create the prototype.
2. Request changes by decision ID.
3. Stop.

Use a structured choice UI when the client provides one. Otherwise present the numbered choices in chat and accept a reply such as `1` or `Change C2 to ...`.

When the user requests changes, update `decisions.html` and ask the same single gate question again. Do not begin the prototype until all open Crossroads are accepted.

## 2. Create The Prototype And Readiness Gate

After Gate 1 passes, mark the accepted Crossroads in `decisions.html` and create `prototype.html` when it can test meaningful behavior.

### Prototype

- Make it a standalone HTML file with no build step or external runtime dependency.
- Implement the most important user flows and interactions, not merely a visual sketch.
- Use representative local data and clearly label simulated external effects.
- Cover the states most likely to reveal a mismatch: first use, normal use, empty results, failures, and destructive confirmation when relevant.
- Support keyboard use and narrow viewports when the product has a visual interface.
- Favor behavioral alignment and information hierarchy over polish.
- Adapt the interface to the intended host. For example, simulate the relevant Obsidian surface instead of presenting a generic website.

For a non-visual tool, use `prototype.html` as an interactive scenario walkthrough only when that helps the user judge inputs, outputs, or failure behavior. Otherwise omit it and explain the omission at Gate 2.

### External Readiness

Find every human dependency that could interrupt the build: secrets, API access, OAuth configuration, service accounts, local applications, SDKs, signing identities, device access, or permission settings.

When environment variables are required:

1. Create `.env.example` with names and safe placeholders only.
2. Create `ENV.md` with one section per dependency containing:
   - why it is needed;
   - exactly where and how to obtain it;
   - required account, console, redirect, or permission setup;
   - the target file and variable name;
   - a safe way to verify readiness.
3. Ensure `.env` and equivalent secret-bearing files are ignored by Git without ignoring `.env.example`.
4. Ask the user to populate `.env` before Gate 2.
5. Validate presence without printing, logging, committing, or embedding secret values.

Do not create `.env.example` or `ENV.md` when the project has no external setup.

Before Gate 2, confirm that:

- all foreseeable Crossroads are represented and accepted;
- required human setup is complete;
- the configured Codex permissions can support dependency installation, testing, and local tooling without routine approval prompts;
- the repository state is understood and existing user changes will be preserved;
- no known manual input remains between the gate and a locally complete application.

### Gate 2

Ask one question:

1. Accept the prototype/readiness state and begin the unattended build.
2. Request changes.
3. Stop.

Use a structured choice UI when available and the numbered fallback otherwise. If no prototype was useful, name the concrete scenarios the build will satisfy before asking.

When the user requests changes, update the relevant artifact, recheck readiness, and ask the same single gate question again.

## 3. Build Unattended

After Gate 2 passes, work autonomously until the project is locally complete or the accepted late-Crossroad policy requires a stop.

### Implementation

- Use the simplest stack and architecture consistent with accepted decisions.
- Implement every promised primary flow end to end.
- Handle proportionate loading, empty, failure, validation, keyboard, responsive, and destructive states.
- Add tests around behavior that is easy to regress or expensive to verify manually.
- Add linting, formatting, type checking, builds, or packaging only where they contribute to the chosen stack's normal quality baseline.
- Write installation, usage, configuration, and development instructions in the project's normal user documentation.
- Do not leave unaccepted mocks, placeholders, disabled checks, TODO implementations, or known broken paths.
- Diagnose and fix routine failures without asking the user how to proceed.
- For a new Crossroad, follow the accepted late-Crossroad policy. Treat all new Hot decisions as delegated, choose a reasonable approach, and record them.

### Git

- Use the repository's default branch directly; prefer `main` for a new repository. Do not create feature branches for one-shot work.
- Preserve pre-existing changes and fail loudly if they overlap the work in a way that cannot be separated safely.
- Use a small number of cohesive, revertible capability commits rather than one huge commit or issue-level micro-commits.
- Number one-shot commits sequentially from the existing history using `COS-NNN`.
- Use this mandatory format:

```text
COS-001: Imperative summary

Previously we <described the prior state>, which <explained the limitation or problem>.

This change <explains the resulting behavior and how it resolves the problem>.
```

- Keep secrets and machine-local state out of commits.
- Do not push, publish, deploy, or create a pull request unless explicitly authorized.

## 4. Verify And Record The Build

1. Re-read `IDEA.md` and every accepted decision.
2. Inspect the finished diff and trace each primary flow through the implementation.
3. Run all relevant automated checks. Add or repair missing checks when a core promise is otherwise unverified.
4. Exercise the built product with the strongest local method available. Use browser or host-application testing when available.
5. Record exact manual verification steps for behavior Codex cannot execute. Separate unperformed human judgment from completed automated evidence.
6. Confirm the worktree contains no accidental artifacts or secret values.
7. Create `build.html` from [assets/build.html](assets/build.html) after the product commits exist.

In `build.html`:

- Summarize the finished outcome and verification status.
- Group actual `COS-NNN` product commits into retrospective **capability stages**.
- Show each commit's subject, short hash, before/after purpose, and relevant Crossroad or Hot IDs.
- Link decision IDs back to anchors in `decisions.html`.
- Separate automated evidence from precise manual verification.
- List late Crossroads and delegated Hot decisions explicitly; use a clear empty state when there were none.
- State that capability stages reconstruct the implementation history and were not forward-planned Planpoints.
- Exclude the final record-only commit from the capability stages.

Commit `build.html` and any final documentation correction as the last `COS-NNN` commit. Finish with a concise user report containing the outcome, checks, manual steps still requiring human judgment, and commit range.
