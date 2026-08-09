import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyDocument,
  DocumentParseError,
  getSection,
  parseDocument,
  renderMarkdown,
} from "../src/markdown.js";
import {issueMarkdown, planpointMarkdown} from "./fixtures.js";

test("classifies only issue records and Planpoints", () => {
  assert.equal(classifyDocument("GH-42.md"), "issue");
  assert.equal(classifyDocument("GH-XXX.md"), "issue");
  assert.equal(classifyDocument("PP-3.md"), "planpoint");
  assert.equal(classifyDocument("PP-X.md"), "planpoint");
  assert.equal(classifyDocument("GH-42-PLAN.md"), undefined);
  assert.equal(classifyDocument("README.md"), undefined);
});

test("parses the expected issue heading schema", () => {
  const model = parseDocument(issueMarkdown, "GH-42.md");
  assert.equal(model.kind, "issue");
  assert.equal(model.title, "GH-42: Render documents");
  assert.match(getSection(model, "What")?.body ?? "", /canonical Markdown/);
  assert.equal(getSection(model, "Confirmation")?.children.length, 2);
});

test("parses the expected Planpoint heading schema", () => {
  const model = parseDocument(planpointMarkdown, "PP-3.md");
  assert.equal(model.kind, "planpoint");
  assert.equal(getSection(model, "Slice")?.children.length, 2);
  assert.equal(getSection(model, "Crossroads")?.children[0]?.title, "C1 - Source ownership");
});

test("reports duplicate and unknown top-level sections with source lines", () => {
  const invalid = `${issueMarkdown}\n\n# Confirmation\n\nDuplicate.\n\n# Surprise\n\nUnknown.`;
  assert.throws(
    () => parseDocument(invalid, "GH-42.md"),
    (error: unknown) => {
      assert.ok(error instanceof DocumentParseError);
      assert.equal(error.issues.length, 2);
      assert.match(error.issues[0]?.message ?? "", /Duplicate # Confirmation/);
      assert.match(error.issues[1]?.message ?? "", /Unknown top-level section/);
      return true;
    },
  );
});

test("reports malformed decision blocks", () => {
  const invalid = planpointMarkdown.replace("- Impact if wrong: Documents drift.\n", "");
  assert.throws(
    () => parseDocument(invalid, "PP-3.md"),
    (error: unknown) => {
      assert.ok(error instanceof DocumentParseError);
      assert.match(error.issues[0]?.message ?? "", /impact if wrong/);
      return true;
    },
  );
});

test("keeps raw HTML inert and renders task lists", () => {
  const html = renderMarkdown("<script>alert('no')</script>\n\n- [x] Safe\n- [ ] Pending\n\n[bad](javascript:alert(1))");
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /type="checkbox" disabled checked/);
  assert.match(html, /type="checkbox" disabled/);
  assert.doesNotMatch(html, /href="javascript:/);
});
