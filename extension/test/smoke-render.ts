import {cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {parseDocument} from "../src/markdown.js";
import {renderDocument} from "../src/render.js";

const repositoryRoot = path.resolve(process.cwd(), "..");
const smokeRoot = mkdtempSync(path.join(os.tmpdir(), "crossroads-preview-"));
const docsRoot = path.join(smokeRoot, "docs");
const templatesRoot = path.join(docsRoot, "templates");

cpSync(path.join(repositoryRoot, "docs", "assets"), path.join(docsRoot, "assets"), {recursive: true});
mkdirSync(templatesRoot, {recursive: true});

for (const [fileName, displayPath] of [
  ["GH-XXX.md", "templates/GH-XXX.md"],
  ["PP-X.md", "ROADMAP/PP-X"],
] as const) {
  const source = readFileSync(path.join(repositoryRoot, "docs", "templates", fileName), "utf8");
  const model = parseDocument(source, fileName);
  const html = renderDocument(model, {assetBaseHref: "../assets", displayPath});
  writeFileSync(path.join(templatesRoot, fileName), source);
  writeFileSync(path.join(templatesRoot, fileName.replace(/\.md$/, ".html")), html);
}

console.log(templatesRoot);
