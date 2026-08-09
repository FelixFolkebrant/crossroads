import {
  escapeHtml,
  getChild,
  getSection,
  isEmptyMarkdown,
  isNoneMarkdown,
  parseLabeledFields,
  renderInline,
  renderMarkdown,
  type HeadingNode,
  type ParsedDocument,
} from "./markdown.js";

export interface RenderOptions {
  assetBaseHref: string;
  displayPath: string;
  contentSecurityPolicy?: string;
  bridgeScriptHref?: string;
}

export function renderDocument(model: ParsedDocument, options: RenderOptions): string {
  return model.kind === "issue"
    ? renderIssue(model, options)
    : renderPlanpoint(model, options);
}

function renderIssue(model: ParsedDocument, options: RenderOptions): string {
  const what = getSection(model, "What");
  const acceptance = getSection(model, "Acceptance Criteria");
  const planDiff = getSection(model, "Plan Diff");
  const guidance = getSection(model, "Project Guidance");
  const notes = getSection(model, "Notes");

  const whatBlocks = [
    what && !isEmptyMarkdown(what.body)
      ? `<div class="issue-summary markdown-body">${renderMarkdown(what.body)}</div>`
      : "",
    planDiff && !isEmptyMarkdown(planDiff.body) && !isNoneMarkdown(planDiff.body)
      ? `<article class="plan-diff"><h1>Plan diff</h1><div class="plan-diff__body markdown-body">${renderMarkdown(planDiff.body)}</div></article>`
      : "",
    renderRecordBlock("Acceptance Criteria", acceptance),
    renderRecordBlock("Project Guidance", guidance),
    renderRecordBlock("Notes", notes),
  ].filter(Boolean).join("\n");

  return `<!doctype html>
<html lang="en">
${renderHead(model, options)}
<body data-document="issue" data-view="what">
  ${renderBrand(options)}

  <main class="issue">
    <p class="document-path">${escapeHtml(options.displayPath)}</p>

    <nav class="tabs" aria-label="Issue recap sections">
      <a class="tab" id="what-tab" data-tab="what" href="#what">What?</a>
      <a class="tab" id="heatmap-tab" data-tab="heatmap" href="#heatmap">Heatmap</a>
      <a class="tab" id="testing-tab" data-tab="testing" href="#testing">Testing</a>
    </nav>

    <section class="panel panel--what" id="what-panel" data-panel="what" aria-labelledby="what-tab">
      ${whatBlocks || renderEmptyState("No review content", "Add content under # What to populate this view.")}
    </section>

    <section class="panel panel--heatmap" id="heatmap-panel" data-panel="heatmap" aria-labelledby="heatmap-tab" hidden>
      ${renderIssueHeatmap(model, options)}
    </section>

    <section class="panel panel--testing" id="testing-panel" data-panel="testing" aria-labelledby="testing-tab" hidden>
      ${renderIssueTesting(model)}
    </section>
  </main>
</body>
</html>`;
}

function renderPlanpoint(model: ParsedDocument, options: RenderOptions): string {
  const slice = getSection(model, "Slice");
  const [intro, sliceDetails] = splitLeadingBlock(slice?.body ?? "");
  const outOfScope = getChild(slice, "Out Of Scope");
  const deferred = getChild(slice, "Deferred To Later Planpoints");
  const scopeCards = [
    renderScopeCard("Slice", "scope-card--slice", sliceDetails),
    renderScopeCard("Out of scope", "scope-card--out", outOfScope?.body ?? ""),
    renderScopeCard("Deferred", "scope-card--deferred", deferred?.body ?? ""),
  ].filter(Boolean).join("\n");

  return `<!doctype html>
<html lang="en">
${renderHead(model, options)}
<body data-document="planpoint" data-view="what">
  ${renderBrand(options)}

  <main class="planpoint">
    <p class="document-path">${escapeHtml(options.displayPath)}</p>
    <h1 class="planpoint-title">${escapeHtml(model.title)}</h1>

    <nav class="tabs planpoint-tabs" aria-label="Planpoint sections">
      <a class="tab" id="planpoint-what-tab" data-tab="what" href="#what">What?</a>
      <a class="tab" id="planpoint-issues-tab" data-tab="issues" href="#issues">Issues</a>
      <a class="tab" id="planpoint-heatmap-tab" data-tab="heatmap" href="#heatmap">Heatmap</a>
    </nav>

    <section class="panel planpoint-panel planpoint-panel--what" id="planpoint-what-panel" data-panel="what" aria-labelledby="planpoint-what-tab">
      ${intro ? `<div class="planpoint-intro markdown-body">${renderMarkdown(intro)}</div>` : ""}
      ${scopeCards ? `<div class="scope-grid">${scopeCards}</div>` : ""}
      ${renderPlanpointCrossroads(model, options)}
      ${renderPlumbing(model)}
    </section>

    <section class="panel planpoint-panel planpoint-panel--issues" id="planpoint-issues-panel" data-panel="issues" aria-labelledby="planpoint-issues-tab" hidden>
      ${renderPlanpointIssues(model)}
    </section>

    <section class="panel planpoint-panel planpoint-panel--heatmap" id="planpoint-heatmap-panel" data-panel="heatmap" aria-labelledby="planpoint-heatmap-tab" hidden>
      ${renderPlanpointHeatmap(model, options)}
    </section>
  </main>
</body>
</html>`;
}

function renderHead(model: ParsedDocument, options: RenderOptions): string {
  const assetBase = options.assetBaseHref.replace(/\/$/, "");
  const csp = options.contentSecurityPolicy
    ? `\n  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(options.contentSecurityPolicy)}">`
    : "";
  const bridge = options.bridgeScriptHref
    ? `\n  <script src="${escapeHtml(options.bridgeScriptHref)}" defer></script>`
    : "";
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">${csp}
  <title>${escapeHtml(model.title)} · Crossroads</title>
  <link rel="stylesheet" href="${escapeHtml(assetBase)}/crossroads.css">
  <script src="${escapeHtml(assetBase)}/crossroads.js" defer></script>${bridge}
</head>`;
}

function renderBrand(options: RenderOptions): string {
  const assetBase = options.assetBaseHref.replace(/\/$/, "");
  return `<header class="brand" aria-label="Crossroads">
    <span class="brand__mark"><img src="${escapeHtml(assetBase)}/logo-leaf.svg" alt=""></span>
    <span class="brand__name">rossroads</span>
  </header>`;
}

function renderRecordBlock(title: string, section: HeadingNode | undefined): string {
  if (!section || isEmptyMarkdown(section.body) || isNoneMarkdown(section.body)) return "";
  return `<article class="record-block">
        <h2>${escapeHtml(title)}</h2>
        <div class="record-block__body markdown-body">${renderMarkdown(section.body)}</div>
      </article>`;
}

function renderIssueHeatmap(model: ParsedDocument, options: RenderOptions): string {
  const heatmap = getSection(model, "Heatmap");
  const hot = getChild(heatmap, "Hot");
  const warm = getChild(heatmap, "Warm");
  const cold = getChild(heatmap, "Cold");
  const stylistic = getChild(heatmap, "Stylistic");
  const details: string[] = [];

  for (const [index, decision] of (hot?.children ?? []).entries()) {
    details.push(renderHotDecision(decision, index === 0));
  }
  if (warm && !isEmptyMarkdown(warm.body)) {
    details.push(renderCompactDecision("decision--warm", "Warm", warm.body));
  }
  if (cold && !isEmptyMarkdown(cold.body)) {
    details.push(renderCompactDecision("decision--cold", "Cold", cold.body));
  }
  for (const decision of stylistic?.children ?? []) {
    details.push(renderStylisticDecision(decision));
  }

  const assetBase = options.assetBaseHref.replace(/\/$/, "");
  return `<header class="crossroad-title">
        <img src="${escapeHtml(assetBase)}/crossroad-mark.svg" alt="">
        <h1>Issue heatmap</h1>
      </header>
      <div class="heatmap-list">
        ${details.join("\n") || renderEmptyState("No recorded decisions", "Empty heatmap sections do not create placeholder cards.")}
      </div>`;
}

function renderHotDecision(decision: HeadingNode, open: boolean): string {
  const fields = parseLabeledFields(decision.body);
  const where = fields.get("where");
  return `<details class="decision decision--hot"${open ? " open" : ""}>
          <summary>${escapeHtml(decision.title)}</summary>
          <div class="decision__body">
            <p class="decision__intro">${renderInline(fields.get("decision") ?? "")}${where ? ` <code>${renderInline(where)}</code>` : ""}</p>
            <div class="decision__columns">
              <section><h2>Why?</h2><div class="markdown-body">${renderMarkdown(fields.get("why") ?? "")}</div></section>
              <section><h2>Alternatives</h2><div class="markdown-body">${renderMarkdown(fields.get("alternatives") ?? "")}</div></section>
            </div>
          </div>
        </details>`;
}

function renderStylisticDecision(decision: HeadingNode): string {
  const fields = parseLabeledFields(decision.body);
  return `<details class="decision decision--warm">
          <summary>Stylistic: ${escapeHtml(decision.title)}</summary>
          <div class="decision__body">
            <p class="decision__intro">${renderInline(fields.get("choice") ?? "")}</p>
            <div class="decision__columns">
              <section><h2>Alternative</h2><div class="markdown-body">${renderMarkdown(fields.get("alternative") ?? "")}</div></section>
              <section><h2>When to apply</h2><div class="markdown-body">${renderMarkdown(fields.get("when to apply") ?? "")}</div></section>
            </div>
          </div>
        </details>`;
}

function renderCompactDecision(className: string, title: string, body: string): string {
  return `<details class="decision ${className}">
          <summary>${escapeHtml(title)}</summary>
          <div class="decision__body decision__body--compact markdown-body">${renderMarkdown(body)}</div>
        </details>`;
}

function renderIssueTesting(model: ParsedDocument): string {
  const confirmation = getSection(model, "Confirmation");
  const tests = (confirmation?.children ?? [])
    .filter((child) => !isEmptyMarkdown(child.body))
    .map((child, index) => `<details class="test"${index === 0 ? " open" : ""}>
          <summary>${index + 1}. ${escapeHtml(child.title)}</summary>
          <div class="test__body markdown-body">${renderMarkdown(child.body)}</div>
        </details>`)
    .join("\n");

  return `<div class="test-list">
        ${tests || renderEmptyState("No checks recorded yet", "Empty confirmation sections do not create test cards.")}
      </div>`;
}

function renderScopeCard(title: string, className: string, body: string): string {
  if (isEmptyMarkdown(body) || isNoneMarkdown(body)) return "";
  return `<article class="scope-card ${className}">
          <h2>${escapeHtml(title)}</h2>
          <div class="markdown-body">${renderMarkdown(body)}</div>
        </article>`;
}

function renderPlanpointCrossroads(model: ParsedDocument, options: RenderOptions): string {
  const crossroads = getSection(model, "Crossroads");
  if (!crossroads) return "";
  const cards = crossroads.children.map((decision, index) => renderCrossroadCard(decision, options, index === 0)).join("\n");
  if (!cards && isEmptyMarkdown(crossroads.body)) return "";

  return `<section class="planpoint-section">
        <h2 class="section-title">Crossroads</h2>
        ${crossroads.body ? `<div class="section-intro markdown-body">${renderMarkdown(crossroads.body)}</div>` : ""}
        ${cards}
      </section>`;
}

function renderCrossroadCard(decision: HeadingNode, options: RenderOptions, open: boolean): string {
  const fields = parseLabeledFields(decision.body);
  const assetBase = options.assetBaseHref.replace(/\/$/, "");
  const facts: Array<[string, string | undefined]> = [
    ["Decision", fields.get("decision")],
    ["Options", fields.get("options")],
    ["Impact if wrong", fields.get("impact if wrong")],
    ["Proposed choice", fields.get("proposed choice")],
    ["Why?", fields.get("why")],
  ];
  return `<details class="crossroad-card"${open ? " open" : ""}>
          <summary>
            <img src="${escapeHtml(assetBase)}/crossroad-mark.svg" alt="">
            <span>${escapeHtml(decision.title)}</span>
            <small>${escapeHtml(fields.get("status") || "Open")}</small>
          </summary>
          <div class="crossroad-card__body">
            ${facts.map(([title, value]) => `<section><h3>${escapeHtml(title)}</h3><div class="markdown-body">${renderMarkdown(value ?? "")}</div></section>`).join("\n")}
          </div>
        </details>`;
}

function renderPlumbing(model: ParsedDocument): string {
  const plumbing = getSection(model, "Plumbing");
  if (!plumbing || isEmptyMarkdown(plumbing.body)) return "";
  const issueId = findFirstIssueId(getSection(model, "Issues")?.body ?? "") ?? "GH-XXX";
  const planpointId = model.fileName.slice(0, -3);
  return `<section class="planpoint-section plumbing-section">
        <h2 class="section-title">Plumbing</h2>
        <div class="section-intro markdown-body">${renderMarkdown(plumbing.body)}</div>
        <div class="plumbing-flow" aria-label="Roadmap connects to Planpoint, which connects to issue records">
          <div><small>Direction</small><strong>ROADMAP.md</strong></div><span aria-hidden="true"></span>
          <div><small>Vertical slice</small><strong>${escapeHtml(planpointId)}.md</strong></div><span aria-hidden="true"></span>
          <div><small>Delivery</small><strong>${escapeHtml(issueId)}.md</strong></div>
        </div>
      </section>`;
}

function renderPlanpointIssues(model: ParsedDocument): string {
  const issues = getSection(model, "Issues");
  const parsedIssues = parseIssues(issues?.body ?? "");
  if (parsedIssues.length === 0) {
    return renderEmptyState("No issues listed", "Add an ordered issue list under # Issues to populate this view.");
  }

  return `<p class="planpoint-intro">Issues are shown in build order. Open an issue to follow the local document trail.</p>
      <div class="planpoint-issues">
        ${parsedIssues.map((issue, index) => `<details class="planpoint-issue"${index === 0 ? " open" : ""}>
          <summary><span>#</span><strong>${escapeHtml(issue.title)}</strong><small>Issue</small></summary>
          <div><p>${renderInline(issue.description)}</p>${issue.id ? `<a href="../wip/${escapeHtml(issue.id)}.html">Open issue recap →</a>` : ""}</div>
        </details>`).join("\n")}
      </div>`;
}

function renderPlanpointHeatmap(model: ParsedDocument, options: RenderOptions): string {
  const heatmap = getSection(model, "Conceptual Heatmap");
  const crossroads = getChild(heatmap, "Crossroads");
  const hot = getChild(heatmap, "Hot");
  const cards: string[] = [];
  for (const [index, decision] of (hot?.children ?? []).entries()) {
    cards.push(renderConceptualHot(decision, index === 0));
  }
  if (crossroads && !isEmptyMarkdown(crossroads.body)) {
    cards.push(renderCompactDecision("decision--warm", "Accepted Crossroads", crossroads.body));
  }
  const assetBase = options.assetBaseHref.replace(/\/$/, "");
  return `<header class="crossroad-title planpoint-heatmap-title">
        <img src="${escapeHtml(assetBase)}/crossroad-mark.svg" alt="">
        <h2>Conceptual heatmap</h2>
      </header>
      <div class="heatmap-list planpoint-heatmap-list">
        ${cards.join("\n") || renderEmptyState("No conceptual decisions", "Empty heatmap sections do not create placeholder cards.")}
      </div>`;
}

function renderConceptualHot(decision: HeadingNode, open: boolean): string {
  const fields = parseLabeledFields(decision.body);
  return `<details class="decision decision--hot"${open ? " open" : ""}>
          <summary>${escapeHtml(decision.title)}</summary>
          <div class="decision__body">
            <p class="decision__intro">${renderInline(fields.get("decision") ?? "")}</p>
            <div class="decision__columns">
              <section><h2>Why?</h2><div class="markdown-body">${renderMarkdown(fields.get("why") ?? "")}</div></section>
              <section><h2>Alternatives</h2><div class="markdown-body">${renderMarkdown(fields.get("alternatives") ?? "")}</div></section>
            </div>
          </div>
        </details>`;
}

function renderEmptyState(title: string, detail: string): string {
  return `<div class="document-empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div>`;
}

function splitLeadingBlock(body: string): [string, string] {
  const trimmed = body.trim();
  if (!trimmed) return ["", ""];
  const separator = /\n\s*\n/.exec(trimmed);
  if (!separator || separator.index === undefined) return [trimmed, ""];
  const end = separator.index;
  return [trimmed.slice(0, end).trim(), trimmed.slice(end + separator[0].length).trim()];
}

function parseIssues(body: string): Array<{id?: string; title: string; description: string}> {
  const issues: Array<{id?: string; title: string; description: string}> = [];
  for (const line of body.split("\n")) {
    const match = /^\s*\d+\.\s+\*\*(.+?)\*\*:\s*(.+)$/.exec(line);
    if (!match) continue;
    const title = match[1] ?? "";
    const description = match[2] ?? "";
    issues.push({
      id: findFirstIssueId(title),
      title,
      description,
    });
  }
  return issues;
}

function findFirstIssueId(value: string): string | undefined {
  return /\bGH-(?:\d+|XXX)\b/.exec(value)?.[0];
}
