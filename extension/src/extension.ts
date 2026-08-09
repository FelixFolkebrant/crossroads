import path from "node:path";
import * as vscode from "vscode";
import {
  classifyDocument,
  DocumentParseError,
  parseDocument,
  type ParseIssue,
  type ParsedDocument,
} from "./markdown.js";
import {
  companionPath,
  documentDisplayPath,
  findDocsDirectory,
  relativeAssetHref,
} from "./paths.js";
import {renderDocument} from "./render.js";

const viewType = "crossroads.preview";
const requiredAssets = [
  "crossroads.css",
  "crossroads.js",
  "logo-leaf.svg",
  "crossroad-mark.svg",
  "fonts/instrument-serif-regular.woff2",
  "fonts/instrument-sans-regular.woff2",
  "fonts/ibm-plex-mono-regular.woff2",
];

interface PreviewSession {
  panel: vscode.WebviewPanel;
  sourceUri: vscode.Uri;
  assetsUri: vscode.Uri;
  model: ParsedDocument;
}

export function activate(context: vscode.ExtensionContext): void {
  const controller = new PreviewController(context);
  context.subscriptions.push(
    controller,
    vscode.commands.registerCommand("crossroads.togglePreview", () => controller.toggle()),
    vscode.workspace.onDidSaveTextDocument((document) => controller.onDocumentSaved(document)),
  );
}

export function deactivate(): void {}

class PreviewController implements vscode.Disposable {
  private readonly diagnostics = vscode.languages.createDiagnosticCollection("crossroads");
  private readonly sessions = new Map<string, PreviewSession>();
  private readonly suppressedSaves = new Set<string>();
  private activeSession: PreviewSession | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {
    context.subscriptions.push(this.diagnostics);
  }

  async toggle(): Promise<void> {
    if (this.activeSession?.panel.active) {
      await this.revealSource(this.activeSession);
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      void vscode.window.showInformationMessage("Open a supported Crossroads Markdown file before toggling its preview.");
      return;
    }

    const document = editor.document;
    const fileName = path.basename(document.uri.fsPath);
    if (document.uri.scheme !== "file" || !classifyDocument(fileName)) {
      void vscode.window.showErrorMessage("Crossroads Preview supports local GH-<number>.md and PP-<number>.md files only.");
      return;
    }

    if (document.isDirty) {
      const key = document.uri.toString();
      this.suppressedSaves.add(key);
      try {
        const saved = await document.save();
        if (!saved) {
          void vscode.window.showErrorMessage(`Save ${fileName} before generating its HTML companion.`);
          return;
        }
      } finally {
        this.suppressedSaves.delete(key);
      }
    }

    await this.generateAndReveal(document, editor.viewColumn);
  }

  onDocumentSaved(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    if (this.suppressedSaves.has(key)) return;
    const session = this.sessions.get(key);
    if (!session) return;
    void this.regenerateOpenPreview(document, session);
  }

  dispose(): void {
    for (const session of this.sessions.values()) session.panel.dispose();
    this.sessions.clear();
    this.activeSession = undefined;
  }

  private async generateAndReveal(document: vscode.TextDocument, viewColumn: vscode.ViewColumn | undefined): Promise<void> {
    const key = document.uri.toString();
    let htmlWasWritten = false;
    try {
      const prepared = await this.prepare(document);
      const existed = await uriExists(prepared.outputUri);
      await vscode.workspace.fs.writeFile(prepared.outputUri, new TextEncoder().encode(prepared.html));
      htmlWasWritten = true;
      this.diagnostics.delete(document.uri);

      let session = this.sessions.get(key);
      if (!session) {
        session = this.createSession(document.uri, prepared.assetsUri, prepared.model, viewColumn);
        this.sessions.set(key, session);
      } else {
        session.assetsUri = prepared.assetsUri;
        session.model = prepared.model;
      }

      this.configureWebview(session);
      session.panel.webview.html = this.renderWebview(session, prepared.displayPath);
      session.panel.title = `Preview ${path.basename(document.uri.fsPath)}`;
      session.panel.reveal(viewColumn ?? vscode.ViewColumn.Active, false);
      this.activeSession = session;
      vscode.window.setStatusBarMessage(
        `Crossroads: ${existed ? "Replaced" : "Created"} ${path.basename(prepared.outputUri.fsPath)}`,
        4500,
      );
    } catch (error) {
      this.reportFailure(document, error, true, htmlWasWritten);
    }
  }

  private async regenerateOpenPreview(document: vscode.TextDocument, session: PreviewSession): Promise<void> {
    let htmlWasWritten = false;
    try {
      const prepared = await this.prepare(document);
      await vscode.workspace.fs.writeFile(prepared.outputUri, new TextEncoder().encode(prepared.html));
      htmlWasWritten = true;
      this.diagnostics.delete(document.uri);
      session.assetsUri = prepared.assetsUri;
      session.model = prepared.model;
      this.configureWebview(session);
      session.panel.webview.html = this.renderWebview(session, prepared.displayPath);
      vscode.window.setStatusBarMessage(`Crossroads: Regenerated ${path.basename(prepared.outputUri.fsPath)}`, 3500);
    } catch (error) {
      this.reportFailure(document, error, false, htmlWasWritten);
    }
  }

  private async prepare(document: vscode.TextDocument): Promise<{
    model: ParsedDocument;
    assetsUri: vscode.Uri;
    outputUri: vscode.Uri;
    displayPath: string;
    html: string;
  }> {
    const sourcePath = document.uri.fsPath;
    const fileName = path.basename(sourcePath);
    const model = parseDocument(document.getText(), fileName);
    const docsPath = findDocsDirectory(sourcePath);
    if (!docsPath) {
      throw new Error(`${fileName} must be inside a docs directory containing the Crossroads assets.`);
    }

    const assetsPath = path.join(docsPath, "assets");
    const assetsUri = vscode.Uri.file(assetsPath);
    await ensureAssets(assetsUri);
    const outputUri = vscode.Uri.file(companionPath(sourcePath));
    const displayPath = documentDisplayPath(sourcePath, docsPath, model.kind);
    const html = renderDocument(model, {
      assetBaseHref: relativeAssetHref(sourcePath, assetsPath),
      displayPath,
    });
    return {model, assetsUri, outputUri, displayPath, html};
  }

  private createSession(
    sourceUri: vscode.Uri,
    assetsUri: vscode.Uri,
    model: ParsedDocument,
    viewColumn: vscode.ViewColumn | undefined,
  ): PreviewSession {
    const panel = vscode.window.createWebviewPanel(
      viewType,
      `Preview ${path.basename(sourceUri.fsPath)}`,
      viewColumn ?? vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [assetsUri, vscode.Uri.joinPath(this.context.extensionUri, "media")],
      },
    );
    const session: PreviewSession = {panel, sourceUri, assetsUri, model};

    panel.onDidChangeViewState(({webviewPanel}) => {
      if (webviewPanel.active) this.activeSession = session;
      else if (this.activeSession === session) this.activeSession = undefined;
    }, undefined, this.context.subscriptions);

    panel.onDidDispose(() => {
      this.sessions.delete(sourceUri.toString());
      if (this.activeSession === session) this.activeSession = undefined;
    }, undefined, this.context.subscriptions);

    panel.webview.onDidReceiveMessage((message: unknown) => {
      void this.handleWebviewMessage(session, message);
    }, undefined, this.context.subscriptions);

    return session;
  }

  private configureWebview(session: PreviewSession): void {
    session.panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [session.assetsUri, vscode.Uri.joinPath(this.context.extensionUri, "media")],
    };
  }

  private renderWebview(session: PreviewSession, displayPath: string): string {
    const webview = session.panel.webview;
    const assetBaseHref = webview.asWebviewUri(session.assetsUri).toString();
    const bridgeScriptHref = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "preview.js")).toString();
    const cspSource = webview.cspSource;
    return renderDocument(session.model, {
      assetBaseHref,
      bridgeScriptHref,
      contentSecurityPolicy: `default-src 'none'; img-src ${cspSource} data:; style-src ${cspSource}; font-src ${cspSource}; script-src ${cspSource};`,
      displayPath,
    });
  }

  private async revealSource(session: PreviewSession): Promise<void> {
    const document = await vscode.workspace.openTextDocument(session.sourceUri);
    await vscode.window.showTextDocument(document, {
      preview: false,
      preserveFocus: false,
      viewColumn: session.panel.viewColumn ?? vscode.ViewColumn.Active,
    });
  }

  private async handleWebviewMessage(session: PreviewSession, message: unknown): Promise<void> {
    if (!isWebviewMessage(message)) return;
    if (message.type === "returnToSource") {
      await this.revealSource(session);
      return;
    }
    if (message.type === "openLink" && message.href) {
      await this.openLink(session, message.href);
    }
  }

  private async openLink(session: PreviewSession, href: string): Promise<void> {
    if (/^(https?:|mailto:)/i.test(href)) {
      await vscode.env.openExternal(vscode.Uri.parse(href));
      return;
    }
    if (href.startsWith("#") || href.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(href)) return;

    const pathWithoutFragment = href.split("#", 1)[0];
    if (!pathWithoutFragment) return;
    const docsPath = findDocsDirectory(session.sourceUri.fsPath);
    if (!docsPath) return;
    let decodedPath: string;
    try {
      decodedPath = decodeURIComponent(pathWithoutFragment);
    } catch {
      return;
    }
    const targetPath = path.resolve(path.dirname(session.sourceUri.fsPath), decodedPath);
    const relative = path.relative(docsPath, targetPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return;
    await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(targetPath));
  }

  private reportFailure(document: vscode.TextDocument, error: unknown, notify: boolean, htmlWasWritten = false): void {
    const effect = htmlWasWritten
      ? "The companion was generated, but the preview could not refresh."
      : "Existing HTML was not changed.";
    if (error instanceof DocumentParseError) {
      this.diagnostics.set(document.uri, error.issues.map(toDiagnostic));
      const first = error.issues[0];
      const message = first
        ? `${path.basename(document.uri.fsPath)}:${first.line + 1} — ${first.message} ${effect}`
        : `${path.basename(document.uri.fsPath)} could not be parsed. ${effect}`;
      if (notify) void vscode.window.showErrorMessage(message);
      else vscode.window.setStatusBarMessage(`Crossroads: ${message}`, 6000);
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    if (notify) void vscode.window.showErrorMessage(`Crossroads Preview: ${message} ${effect}`);
    else vscode.window.setStatusBarMessage(`Crossroads: ${message} ${effect}`, 6000);
  }
}

function toDiagnostic(issue: ParseIssue): vscode.Diagnostic {
  const line = Math.max(0, issue.line);
  const diagnostic = new vscode.Diagnostic(
    new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER),
    issue.message,
    vscode.DiagnosticSeverity.Error,
  );
  diagnostic.source = "Crossroads Preview";
  return diagnostic;
}

async function ensureAssets(assetsUri: vscode.Uri): Promise<void> {
  const missing: string[] = [];
  for (const asset of requiredAssets) {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(assetsUri, ...asset.split("/")));
    } catch {
      missing.push(asset);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing docs/assets files: ${missing.join(", ")}.`);
  }
}

async function uriExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

function isWebviewMessage(value: unknown): value is {type: string; href?: string} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as {type?: unknown; href?: unknown};
  return typeof candidate.type === "string" && (candidate.href === undefined || typeof candidate.href === "string");
}
