export const issueMarkdown = `# GH-42: Render documents

# What

- Render canonical Markdown.

# Acceptance Criteria

- [x] Generate a companion.

# Plan Diff

- None

# Confirmation

## Automated Checks

- Command: npm test
- Result: passed

## Manual Testing

- Start the feature: Press F5.
- Action: Toggle the preview.
- Expected result: Preview fills the editor.

# Project Guidance

- Applied patterns: PAT-001

# Heatmap

## Hot

### H1 - Toggle the preview

- Decision: Use one editor group.
- Where: src/extension.ts
- Why: Keep review focused.
- Alternatives: Side-by-side view.

## Warm

- Reuse accepted styles.

## Cold

| Where | What |
|---|---|
| src/extension.ts | Command wiring. |

# Notes

- HTML is disposable.`;

export const planpointMarkdown = `# PP-3: Render document views

# Slice

Markdown renders into a review companion.

- Issue and Planpoint schemas work end to end.

## Out Of Scope

- Generic Markdown

## Deferred To Later Planpoints

- More document types

# Crossroads

## C1 - Source ownership

- Decision: Markdown owns content.
- Options: Markdown or HTML.
- Impact if wrong: Documents drift.
- Proposed choice: Markdown.
- Why: It remains readable.
- Status: decided

# Plumbing

- Threaded now: One typed model.
- Pattern set: One renderer per schema.

# Issues

1. **GH-42 - Build the renderer**: Parse and render both document types.

# Conceptual Heatmap

## Crossroads

- C1: Markdown is canonical.

## Hot

### H1 - Toggle the full view

- Decision: Reuse one editor group.
- Why: It keeps review focused.
- Alternatives: Side-by-side preview.`;
