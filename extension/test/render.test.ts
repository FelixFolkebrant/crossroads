import assert from "node:assert/strict";
import test from "node:test";
import {parseDocument} from "../src/markdown.js";
import {renderDocument} from "../src/render.js";
import {issueMarkdown, planpointMarkdown} from "./fixtures.js";

const diskOptions = {
  assetBaseHref: "../assets",
  displayPath: "wip/GH-42.md",
};

test("renders the issue reference structure and every known populated section", () => {
  const model = parseDocument(issueMarkdown, "GH-42.md");
  const html = renderDocument(model, diskOptions);

  assert.match(html, /<body data-document="issue" data-view="what">/);
  assert.match(html, /class="tabs"/);
  assert.match(html, /class="panel panel--what"/);
  assert.match(html, /class="panel panel--heatmap"/);
  assert.match(html, /class="panel panel--testing"/);
  assert.match(html, /Acceptance Criteria/);
  assert.match(html, /Project Guidance/);
  assert.match(html, /class="decision decision--hot"/);
  assert.match(html, /1\. Automated Checks/);
  assert.doesNotMatch(html, /<article class="plan-diff">/);
  assert.match(html, /href="\.\.\/assets\/crossroads\.css"/);
});

test("renders the Planpoint reference structure and document trail", () => {
  const model = parseDocument(planpointMarkdown, "PP-3.md");
  const html = renderDocument(model, {
    assetBaseHref: "../assets",
    displayPath: "ROADMAP/PP-3",
  });

  assert.match(html, /<body data-document="planpoint" data-view="what">/);
  assert.match(html, /class="planpoint-title">PP-3: Render document views/);
  assert.match(html, /class="scope-grid"/);
  assert.match(html, /class="crossroad-card" open/);
  assert.match(html, /class="plumbing-flow"/);
  assert.match(html, /href="\.\.\/wip\/GH-42\.html"/);
  assert.match(html, /class="decision decision--hot" open/);
});

test("produces deterministic output", () => {
  const model = parseDocument(issueMarkdown, "GH-42.md");
  assert.equal(renderDocument(model, diskOptions), renderDocument(model, diskOptions));
});

test("adds a strict webview CSP and bridge without changing document classes", () => {
  const model = parseDocument(issueMarkdown, "GH-42.md");
  const html = renderDocument(model, {
    assetBaseHref: "vscode-webview://assets",
    bridgeScriptHref: "vscode-webview://extension/preview.js",
    contentSecurityPolicy: "default-src 'none'; style-src vscode-webview:",
    displayPath: "wip/GH-42.md",
  });

  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /default-src &#039;none&#039;/);
  assert.match(html, /src="vscode-webview:\/\/extension\/preview\.js"/);
  assert.match(html, /<main class="issue">/);
});

test("escapes authored HTML in generated document content", () => {
  const source = issueMarkdown.replace("- Render canonical Markdown.", "<img src=x onerror=alert(1)>");
  const html = renderDocument(parseDocument(source, "GH-42.md"), diskOptions);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});
