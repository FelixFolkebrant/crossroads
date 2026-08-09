import path from "node:path";
import type {DocumentKind} from "./markdown.js";

export function companionPath(sourcePath: string): string {
  return sourcePath.replace(/\.md$/, ".html");
}

export function findDocsDirectory(sourcePath: string): string | undefined {
  let current = path.dirname(sourcePath);
  const root = path.parse(current).root;

  while (current !== root) {
    if (path.basename(current) === "docs") return current;
    current = path.dirname(current);
  }
  return path.basename(root) === "docs" ? root : undefined;
}

export function relativeAssetHref(sourcePath: string, assetsPath: string): string {
  const relative = path.relative(path.dirname(companionPath(sourcePath)), assetsPath);
  return relative.split(path.sep).join("/") || ".";
}

export function documentDisplayPath(sourcePath: string, docsPath: string, kind: DocumentKind): string {
  const stem = path.basename(sourcePath, ".md");
  if (kind === "planpoint") return `ROADMAP/${stem}`;
  return path.relative(docsPath, sourcePath).split(path.sep).join("/");
}
