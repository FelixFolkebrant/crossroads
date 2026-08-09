import MarkdownIt from "markdown-it";

export type DocumentKind = "issue" | "planpoint";

export interface ParseIssue {
  line: number;
  message: string;
}

export interface HeadingNode {
  level: number;
  title: string;
  line: number;
  endLine: number;
  body: string;
  children: HeadingNode[];
  parent?: HeadingNode;
}

export interface ParsedDocument {
  kind: DocumentKind;
  fileName: string;
  title: string;
  root: HeadingNode;
  sections: Map<string, HeadingNode>;
}

const issueSections = new Set([
  "what",
  "acceptance criteria",
  "plan diff",
  "confirmation",
  "project guidance",
  "heatmap",
  "notes",
]);

const planpointSections = new Set([
  "slice",
  "crossroads",
  "plumbing",
  "issues",
  "conceptual heatmap",
]);

const markdown = new MarkdownIt({
  breaks: false,
  html: false,
  linkify: false,
  typographer: false,
});

const defaultLinkOpen = markdown.renderer.rules.link_open;
markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
  const token = tokens[index];
  const href = token?.attrGet("href") ?? "";
  if (/^https?:/i.test(href)) {
    token?.attrSet("rel", "noreferrer noopener");
  }
  if (defaultLinkOpen) {
    return defaultLinkOpen(tokens, index, options, environment, renderer);
  }
  return renderer.renderToken(tokens, index, options);
};

markdown.renderer.rules.image = (tokens, index) => {
  const token = tokens[index];
  const alt = escapeHtml(token?.content || "image");
  return `<span class="unsupported-image">[Image: ${alt}]</span>`;
};

export class DocumentParseError extends Error {
  readonly issues: ParseIssue[];

  constructor(issues: ParseIssue[]) {
    super(issues.map((issue) => `Line ${issue.line + 1}: ${issue.message}`).join("\n"));
    this.name = "DocumentParseError";
    this.issues = issues;
  }
}

export function classifyDocument(fileName: string): DocumentKind | undefined {
  if (/^GH-(?:\d+|XXX)\.md$/.test(fileName)) return "issue";
  if (/^PP-(?:\d+|X)\.md$/.test(fileName)) return "planpoint";
  return undefined;
}

export function parseDocument(source: string, fileName: string): ParsedDocument {
  const kind = classifyDocument(fileName);
  if (!kind) {
    throw new DocumentParseError([{
      line: 0,
      message: "Only GH-<number>.md, GH-XXX.md, PP-<number>.md, and PP-X.md are supported.",
    }]);
  }

  const headings = collectHeadings(source);
  const issues: ParseIssue[] = [];
  const rootHeadings = headings.filter((heading) => heading.level === 1);
  const root = rootHeadings[0];
  const stem = fileName.slice(0, -3);

  if (!root) {
    throw new DocumentParseError([{line: 0, message: `Add a level-one title beginning with “${stem}:”.`}]);
  }

  if (root.title !== stem && !root.title.startsWith(`${stem}:`)) {
    issues.push({
      line: root.line,
      message: `The document title must begin with “${stem}:” so it matches the filename.`,
    });
  }

  const allowedSections = kind === "issue" ? issueSections : planpointSections;
  const sections = new Map<string, HeadingNode>();

  for (const heading of rootHeadings.slice(1)) {
    const key = normalizeTitle(heading.title);
    if (!allowedSections.has(key)) {
      issues.push({
        line: heading.line,
        message: `Unknown top-level section “${heading.title}” for a ${kind} document.`,
      });
      continue;
    }
    const previous = sections.get(key);
    if (previous) {
      issues.push({
        line: heading.line,
        message: `Duplicate # ${heading.title}; the first occurrence is on line ${previous.line + 1}.`,
      });
      continue;
    }
    sections.set(key, heading);
  }

  const requiredSection = kind === "issue" ? "what" : "slice";
  if (!sections.has(requiredSection)) {
    issues.push({
      line: root.line,
      message: `Missing required # ${titleCase(requiredSection)} section.`,
    });
  }

  const model: ParsedDocument = {
    kind,
    fileName,
    title: root.title,
    root,
    sections,
  };

  validateDecisions(model, issues);

  if (issues.length > 0) throw new DocumentParseError(issues);
  return model;
}

export function getSection(model: ParsedDocument, title: string): HeadingNode | undefined {
  return model.sections.get(normalizeTitle(title));
}

export function getChild(section: HeadingNode | undefined, title: string): HeadingNode | undefined {
  const normalized = normalizeTitle(title);
  return section?.children.find((child) => normalizeTitle(child.title) === normalized);
}

export function parseLabeledFields(body: string): Map<string, string> {
  const fields = new Map<string, string>();
  let currentKey: string | undefined;

  for (const line of body.split("\n")) {
    const match = /^\s*-\s+(?:\*\*)?([^:*]+?)(?:\*\*)?:\s*(.*)$/.exec(line);
    if (match) {
      currentKey = normalizeTitle(match[1] ?? "");
      fields.set(currentKey, (match[2] ?? "").trim());
      continue;
    }

    if (currentKey && /^\s{2,}\S/.test(line)) {
      const existing = fields.get(currentKey) ?? "";
      fields.set(currentKey, `${existing}\n${line.trim()}`.trim());
      continue;
    }

    if (line.trim()) currentKey = undefined;
  }

  return fields;
}

export function renderMarkdown(source: string): string {
  if (!source.trim()) return "";
  return markdown.render(source).replace(
    /(<li>\s*(?:<p>)?)\[([ xX])\]\s+/g,
    (_, opening: string, checked: string) => `${opening}<input class="task-list-checkbox" type="checkbox" disabled${checked.toLowerCase() === "x" ? " checked" : ""}> `,
  );
}

export function renderInline(source: string): string {
  return markdown.renderInline(source);
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function isEmptyMarkdown(source: string): boolean {
  return !source.trim();
}

export function isNoneMarkdown(source: string): boolean {
  const normalized = source
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/[.`*_]/g, "")
    .trim()
    .toLowerCase();
  return normalized === "none";
}

function collectHeadings(source: string): HeadingNode[] {
  const lines = source.split(/\r?\n/);
  const tokens = markdown.parse(source, {});
  const headings: HeadingNode[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token || token.type !== "heading_open" || !token.map) continue;
    const inline = tokens[index + 1];
    const level = Number.parseInt(token.tag.slice(1), 10);
    headings.push({
      level,
      title: inline?.type === "inline" ? inline.content.trim() : "",
      line: token.map[0],
      endLine: lines.length,
      body: "",
      children: [],
    });
  }

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    if (!heading) continue;
    for (let cursor = index + 1; cursor < headings.length; cursor += 1) {
      const candidate = headings[cursor];
      if (candidate && candidate.level <= heading.level) {
        heading.endLine = candidate.line;
        break;
      }
    }
    const firstChild = headings.slice(index + 1).find((candidate) => candidate.line < heading.endLine);
    const bodyEndLine = firstChild?.line ?? heading.endLine;
    heading.body = lines.slice(heading.line + 1, bodyEndLine).join("\n").trim();
  }

  const stack: HeadingNode[] = [];
  for (const heading of headings) {
    while (stack.length > 0 && (stack.at(-1)?.level ?? 0) >= heading.level) stack.pop();
    const parent = stack.at(-1);
    if (parent) {
      heading.parent = parent;
      parent.children.push(heading);
    }
    stack.push(heading);
  }

  return headings;
}

function validateDecisions(model: ParsedDocument, issues: ParseIssue[]): void {
  if (model.kind === "planpoint") {
    const crossroads = getSection(model, "Crossroads");
    for (const decision of crossroads?.children.filter((child) => child.level === 2) ?? []) {
      requireFields(decision, ["decision", "options", "impact if wrong", "proposed choice", "why", "status"], issues);
    }

    const conceptualHeatmap = getSection(model, "Conceptual Heatmap");
    const hot = getChild(conceptualHeatmap, "Hot");
    for (const decision of hot?.children.filter((child) => child.level === 3) ?? []) {
      requireFields(decision, ["decision", "why", "alternatives"], issues);
    }
    return;
  }

  const heatmap = getSection(model, "Heatmap");
  const hot = getChild(heatmap, "Hot");
  for (const decision of hot?.children.filter((child) => child.level === 3) ?? []) {
    requireFields(decision, ["decision", "where", "why", "alternatives"], issues);
  }

  const stylistic = getChild(heatmap, "Stylistic");
  for (const decision of stylistic?.children.filter((child) => child.level === 3) ?? []) {
    requireFields(decision, ["choice", "alternative", "when to apply"], issues);
  }
}

function requireFields(node: HeadingNode, required: string[], issues: ParseIssue[]): void {
  const fields = parseLabeledFields(node.body);
  const missing = required.filter((field) => !fields.has(field));
  if (missing.length === 0) return;
  issues.push({
    line: node.line,
    message: `Decision “${node.title}” is missing ${missing.map((field) => `“${field}”`).join(", ")}.`,
  });
}

function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
