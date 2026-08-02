# One-Shot Heatmap

Heat describes how much human judgment a choice deserves, not its severity or implementation effort. One-shot projects use only Crossroad and Hot decisions.

## Crossroad

A Crossroad is hard or expensive to reverse after implementation. It blocks the next gate until the user accepts it.

Use Crossroad for:

- application stack or host platform;
- storage or source-of-truth ownership;
- third-party provider or external protocol;
- authentication, privacy, security boundaries, or destructive behavior;
- offline versus network-dependent behavior;
- a scope boundary that changes what product will be delivered;
- the policy for new hard-to-reverse choices during the unattended build.

Do not use Crossroad for a preferred library inside an accepted stack, local module boundaries, naming, formatting, or choices that can be replaced without changing primary flows.

Required fields in `decisions.html`:

```text
C1 - Title
Decision
Impact if wrong
Options, with consequences
Proposed choice
Why
Status: Open | Decided in IDEA | Accepted
```

## Hot

A Hot decision has meaningful alternatives and benefits from visibility, but Codex may choose it without stopping the unattended build.

Use Hot for:

- interaction behavior that shapes user trust;
- error or validation strategy;
- a non-obvious abstraction likely to influence several modules;
- testing or compatibility boundaries with real trade-offs;
- an opinionated dependency within an accepted stack;
- a UI workflow that is meaningful but inexpensive to revise.

Do not use Hot for routine code, standard configuration, obvious host-platform requirements, or purely stylistic expression.

Required fields in `decisions.html`:

```text
H1 - Title
Decision
Proposed approach
Why
Alternatives
Review focus
Status: Proposed | Accepted | Delegated during build
```

## Classification Test

Ask in order:

1. Would changing this after the build meaningfully rewrite the product, move or endanger user data, replace a provider, or alter a security boundary? Use **Crossroad**.
2. Are there real alternatives where the user's taste would improve the result, but changing later is affordable? Use **Hot**.
3. Otherwise omit it from `decisions.html`.

Prefer fewer well-formed decisions. Difficulty, novelty, or code volume alone does not create heat.
