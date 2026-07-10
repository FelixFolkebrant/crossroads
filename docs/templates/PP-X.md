Feel free to use emojis. This document is meant to not be cognitively heavy while still communicating concepts clearly and concisely. Explanations of each category live in this template only — real PlanPoints should be written with just content.

A PlanPoint sits **above** issues. It is one vertical slice (walking skeleton) of the product. Its job is to make the decisions that must happen *before* issues are written, defer everything else, then spawn the issues (`GL-XXX`) that fill the slice in. It is a persistent document — it is not deleted after merge.

Rule of thumb: if a decision only matters *inside* one issue, it does not belong here — it is a Hot decision for that issue's `GL-XXX-PLAN.md`. Only decisions that shape the slice as a whole belong at this level.

---

# PLANPOINT-X: \<name\>

One sentence: what capability exists after this slice that did not before.

# 🎯 Slice
The walking skeleton this PlanPoint stands up — one thin path threaded end to end (e.g. one attribute type flowing from BigQuery → API → builder UI, not all types).

- What is delivered end-to-end.
- Why this is the right *next* slice (what it unblocks).

### What not
Scope explicitly outside this slice. Few words, bullets.

### Deferred to later PlanPoints
Bigger scope pushed forward on purpose. For each, one line on **why it's safe to defer** — i.e. deferring won't force a heavy rewrite later. (If it *would* force a rewrite, it's a Crossroad below, not a deferral.)

<br />

---

<br />

# 🧭 Crossroads
The core of the PlanPoint. Crossroads are big decisions that need human input because of application scale or goal — the human acts as the source of taste. Choice of stack, third-party vs self-hosted vs in-memory, relational vs no-SQL, auth strategy.

We defer decisions as much as possible. A decision earns a Crossroad slot **only** if getting it wrong is expensive to undo. Everything else is deferred or left to issue level.

> **Impact = time to rewrite.** High impact → must decide now. Low impact → defer it.

### C1 - \<the decision\>
- **Decision:** what is being chosen.
- **Options:** each option, one line of trade-off.
- **Impact if wrong:** rough time/effort to reverse. This is *why* it's a Crossroad and not deferred.
- **Chosen + why:** the call and the reasoning. Best practice? Fits an existing pattern? Goal-driven?
- **Status:** `open` (needs human) / `decided`.

```
Code or schema sketch if it explains the trade-off better than prose.
```

<br />

---

<br />

# 🧱 Plumbing
The goal is not to define every schema — it is to define *how* schemas are defined and to prove one flows end to end.

- **Threaded now:** the one hello-world type/shape carried across the full stack for this slice.
- **Pattern set:** the convention later types will follow (so widening is cheap and Cold).

# 📦 Issues
Loose breakdown into `GL-XXX` issues, in build order. Titles plus one line each — do not over-plan; detail is decided when each issue's `GL-XXX-PLAN.md` is written. Some dots only connect in hindsight.

1. **GL-XXX — \<title\>** — one line.
2. **GL-XXX — \<title\>** — one line.

<br />

---

<br />

# 🌡️ Conceptual Heatmap
Same terminology as issue heatmaps, but one level up: we only care about **Crossroad** and conceptual **Hot** here. Granular Hot/Warm/Cold/Stylistic decisions belong in the issue-level `GL-XXX-PLAN.md`, not here.

> **Crossroad:** big decision needing human input due to scale or goal. Stack, third-party integration, DB kind. (Detailed in the Crossroads section above — list here for the at-a-glance map.)

> **Hot (conceptual):** a statement has been made at slice level, but reversible cheaply enough that it isn't a Crossroad. Worth a look, not a blocker.

## Crossroad
- C1 → \<decision\> — see Crossroads section.

## Hot
### 1
- What conceptual decision.
- Why proposed (best practice / existing pattern / goal).
- Alternatives considered.
