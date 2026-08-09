# Crossroads Preview

Crossroads Preview is a local desktop VS Code extension that turns canonical Crossroads Markdown into a disposable HTML review companion. It supports issue records named `GH-<number>.md` and Planpoints named `PP-<number>.md`, including the `GH-XXX.md` and `PP-X.md` templates.

Markdown remains the only editable source. A successful render creates or replaces the same-named sibling `.html` file, using the typography, colors, gradients, surfaces, assets, tabs, and folded components in `docs/assets/`.

## Use The Extension

1. Open a supported Markdown file inside a Crossroads `docs/` directory.
2. Press `Ctrl+Alt+Shift+V` on Linux or Windows, or `Cmd+Alt+Shift+V` on macOS.
3. The extension saves the Markdown, validates its structure, generates the sibling HTML file, and opens the preview in the same editor group.
4. Press the shortcut again while the preview is active to return to the Markdown editor.

While a preview is open, every later Markdown save regenerates its HTML and refreshes the preview. Ordinary unsaved edits never write HTML.

The companion is generated output. Editing it is allowed by the filesystem, but the next successful render replaces those edits without confirmation.

## Supported Documents

| Filename | Required structure | Rendered views |
|---|---|---|
| `GH-<number>.md`, `GH-XXX.md` | Matching level-one title and `# What` | What, Heatmap, Testing |
| `PP-<number>.md`, `PP-X.md` | Matching level-one title and `# Slice` | What, Issues, Heatmap |

The parser uses headings as the document schema. It supports ordinary paragraphs, links, emphasis, inline code, fenced code, ordered and unordered lists, task lists, and tables. Renderer-specific front matter, directives, or HTML tags are neither required nor executed. Authored images are represented as inert text because remote or arbitrary image loading is outside the accepted local rendering boundary.

Known empty optional sections are omitted from the generated component list. Unknown top-level sections, duplicate top-level sections, mismatched titles, and incomplete decision blocks produce VS Code diagnostics. A failed parse never replaces the last valid HTML file.

The workspace must contain these shared assets:

```text
docs/assets/
├── crossroads.css
├── crossroads.js
├── crossroad-mark.svg
├── logo-leaf.svg
└── fonts/
    ├── ibm-plex-mono-regular.woff2
    ├── instrument-sans-regular.woff2
    └── instrument-serif-regular.woff2
```

## Run From Source

Requirements: Node.js 20 or later, npm, and desktop VS Code 1.100 or later.

```sh
cd extension
npm install
npm run build
```

Open the repository root in VS Code and press `F5`. The included launch configuration builds the bundle and opens an Extension Development Host for this workspace.

## Package And Install

```sh
cd extension
npm run package
```

This produces `extension/crossroads-preview.vsix`. In VS Code, run **Extensions: Install from VSIX…**, select that file, and reload the window. Packaging is local; this project does not publish to the Marketplace.

## Development Checks

```sh
npm run typecheck
npm test
npm run build
npm run package
```

The tests cover filename classification, both heading schemas, decision validation, safe Markdown handling, deterministic HTML, Framework structure, CSP injection, and companion path derivation.

## Manual Verification

1. Run `npm install` and `npm run build` in `extension/`, open the repository root in VS Code, and press `F5`.
2. In the Extension Development Host, copy `docs/templates/GH-XXX.md` to `docs/wip/GH-901.md`, change its title to begin `# GH-901:`, and fill `# What` with a visible sentence.
3. Press `Ctrl+Alt+Shift+V`. `docs/wip/GH-901.html` should appear, and the Framework preview should replace the source across the same editor group. Its What, Heatmap, and Testing tabs should switch panels.
4. Press the shortcut again. The `GH-901.md` text editor should return in the same editor group while the preview tab remains available.
5. Change the What sentence and save. The open preview and `GH-901.html` should both contain the new sentence.
6. Add a second `# Confirmation` heading and invoke the shortcut. VS Code should mark that heading with a Crossroads Preview diagnostic, keep the Markdown visible, and leave the prior `GH-901.html` content unchanged.
7. Repeat with `docs/templates/PP-X.md` copied to `docs/planpoints/PP-901.md` and a matching title. The generated preview should show What, Issues, and Heatmap views using the Planpoint layout.
8. Narrow the editor group below 720 pixels. Cards and decision columns should stack without horizontal document overflow.

Delete the temporary `GH-901` and `PP-901` Markdown/HTML files after verification.
