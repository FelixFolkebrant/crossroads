import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";
import test from "node:test";
import {parseDocument} from "../src/markdown.js";
import {renderDocument} from "../src/render.js";

const templatesPath = path.resolve(process.cwd(), "..", "docs", "templates");

test("parses and renders the repository issue template unchanged", () => {
  const source = readFileSync(path.join(templatesPath, "GH-XXX.md"), "utf8");
  const model = parseDocument(source, "GH-XXX.md");
  const html = renderDocument(model, {
    assetBaseHref: "../assets",
    displayPath: "templates/GH-XXX.md",
  });

  assert.equal(model.kind, "issue");
  assert.match(html, /GH-XXX: &lt;Title&gt;/);
  assert.match(html, /data-document="issue"/);
});

test("parses and renders the repository Planpoint template unchanged", () => {
  const source = readFileSync(path.join(templatesPath, "PP-X.md"), "utf8");
  const model = parseDocument(source, "PP-X.md");
  const html = renderDocument(model, {
    assetBaseHref: "../assets",
    displayPath: "ROADMAP/PP-X",
  });

  assert.equal(model.kind, "planpoint");
  assert.match(html, /PP-X: &lt;Planpoint Title&gt;/);
  assert.match(html, /data-document="planpoint"/);
});
