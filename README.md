# Crossroads

> A documentation workflow for moving quickly with AI without handing over the decisions that shape the project.

AI-assisted development tends to drift toward one of two extremes: trust every generated decision, or review every generated line. The first loses human taste; the second loses the speed.

Crossroads takes a middle path. Work is planned in gradually smaller slices, hard-to-reverse choices require human acceptance, and reviews point attention toward decisions rather than volume.

## The Process

```text
Idea -> Roadmap -> Planpoint -> Issue plan -> Build -> Review -> Merge
                       ^                         |
                       +-- raise Crossroads -----+
```

### 1. Set Direction

Start with [`IDEA.md`](docs/project/IDEA.md): describe the product, important user flows, constraints, and any stack preferences already known.

Turn that into [`ROADMAP.md`](docs/project/ROADMAP.md). The roadmap shows where the project is going without pretending every future detail is settled.

### 2. Plan One Vertical Slice

Create a **Planpoint** from [`PP-X.md`](docs/templates/PP-X.md). A Planpoint defines one end-to-end capability and decides only the Crossroads that would be expensive to reverse later.

The human accepts those decisions before issue work begins. Everything cheaper to change stays deferred.

### 3. Plan And Build One Issue

Create `docs/wip/GH-<n>-PLAN.md` from the [issue plan template](docs/templates/GH-XXX-PLAN.md). Agree on scope, acceptance criteria, atomic commits, and any issue-level decisions that deserve attention.

Before implementation, read [`PATTERNS.md`](docs/project/PATTERNS.md) and [`STYLE.md`](docs/project/STYLE.md). Record which accepted guidance applies, or explicitly record that none does. Choices already settled by project guidance are Warm or Cold instead of decisions to revisit.

Build on `<name>/GH-<n>/<revision>`, keep commits atomic, and maintain `docs/wip/GH-<n>.md` from the [issue record template](docs/templates/GH-XXX.md). This record captures what changed, how to verify it, and which project guidance was applied or changed.

If implementation exposes a hard-to-reverse decision, stop and raise it to the Planpoint instead of letting the AI choose silently.

### 4. Review What Matters

When review is requested, create `docs/wip/GH-<n>-REVIEW.md` from the [review template](docs/templates/GH-XXX-REVIEW.md). Findings have two separate signals:

- **Severity** says how important a problem is to fix.
- **Heat** says how much human judgment a decision deserves.

Review also checks that declared project guidance was followed and identifies Hot or Stylistic decisions worth reusing. The human accepts any promotion before it is added to `PATTERNS.md` or `STYLE.md`.

Fix accepted findings and add accepted guidance with fixup commits, review them, then rebase once. Repeat until the issue is accepted.

### 5. Finish And Preserve Context

Push the branch, open a PR, and complete CI and manual review. Before merge, make sure any accepted guidance is in `PATTERNS.md` or `STYLE.md` and named in the final issue record. After merge, remove the temporary plan and review documents, then move the final issue record to `docs/issues/GH-<n>.md`.

The final record is the durable explanation of what changed, how it was confirmed, and which decisions future work should inherit.

## Document Map

| File | Purpose |
|---|---|
| [`IDEA.md`](docs/project/IDEA.md) | Product intent, user flows, constraints, and known preferences. |
| [`ROADMAP.md`](docs/project/ROADMAP.md) | Current direction, upcoming Planpoints, and deferred decisions. |
| `docs/planpoints/PP-<n>.md` | One vertical slice and its accepted Crossroads. |
| `docs/wip/GH-<n>-PLAN.md` | Temporary issue scope, acceptance criteria, and proposed decisions. |
| `docs/wip/GH-<n>-REVIEW.md` | Temporary review findings, severity, heat, and resolution status. |
| `docs/wip/GH-<n>.md` | Issue record maintained during implementation. |
| `docs/issues/GH-<n>.md` | Durable issue record preserved after merge. |
| [`HEATMAP.md`](docs/project/HEATMAP.md) | Canonical definitions for Crossroad, Hot, Warm, Cold, and Stylistic. |
| [`PATTERNS.md`](docs/project/PATTERNS.md) | Accepted implementation choices that future work can follow. |
| [`STYLE.md`](docs/project/STYLE.md) | Accepted style choices that should stay consistent. |

## Principles

- Plan gradually. Decide only what the next slice needs.
- Build thin vertical slices that prove the system end to end.
- Keep human taste focused on costly or opinionated decisions.
- Turn repeated decisions into accepted patterns and style.
- Preserve the reasoning that future work needs; delete temporary process noise.

The [Crossroads Manifesto](docs/CROSSROADS_MANIFESTO.md) is the highest-level source of truth. See the [workflow reference](docs/project/WORKFLOW.md) for the operational rules.

## One Shot Companion

Small, self-contained projects do not always benefit from Crossroads' gradual roadmap, Planpoint, issue, and review layers. The repo-local [`one-shot`](.agents/skills/one-shot/SKILL.md) Codex skill keeps the same focus on human judgment while using only two approval gates:

```text
IDEA.md -> decisions.html -> prototype/readiness -> unattended build -> build.html
```

To use it in another repository:

1. Copy `.agents/skills/one-shot/` into the same path in the target repository.
2. Copy `assets/IDEA.md` from the skill to the repository root as `IDEA.md`, then replace its comment with the idea in any form you prefer.
3. Open the repository in Codex and invoke `$one-shot`.

If `IDEA.md` is missing, the skill creates the freeform starter file and pauses. During a run, `decisions.html` contains only hard-to-reverse Crossroads and opinionated Hot choices. After those decisions and the behavioral prototype are accepted, Codex completes the local application without routine implementation questions and reconstructs the `COS-NNN` commit history in `build.html`.

The skill does not pin a model. Sol is the safer default while a loose idea still needs judgment and polish; Terra is a pragmatic choice when the idea and accepted gates make the build straightforward.
