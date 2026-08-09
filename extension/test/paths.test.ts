import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  companionPath,
  documentDisplayPath,
  findDocsDirectory,
  relativeAssetHref,
} from "../src/paths.js";

test("derives sibling companions and shared asset paths", () => {
  const root = path.join(path.sep, "workspace", "crossroads");
  const issue = path.join(root, "docs", "wip", "GH-42.md");
  const planpoint = path.join(root, "docs", "planpoints", "PP-3.md");
  const assets = path.join(root, "docs", "assets");

  assert.equal(companionPath(issue), path.join(root, "docs", "wip", "GH-42.html"));
  assert.equal(findDocsDirectory(issue), path.join(root, "docs"));
  assert.equal(relativeAssetHref(issue, assets), "../assets");
  assert.equal(documentDisplayPath(issue, path.join(root, "docs"), "issue"), "wip/GH-42.md");
  assert.equal(documentDisplayPath(planpoint, path.join(root, "docs"), "planpoint"), "ROADMAP/PP-3");
});

test("rejects files outside a docs tree", () => {
  assert.equal(findDocsDirectory(path.join(path.sep, "workspace", "GH-42.md")), undefined);
});
