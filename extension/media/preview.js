const vscode = acquireVsCodeApi();

document.addEventListener("keydown", (event) => {
  const usesMacShortcut = event.metaKey && event.altKey && event.shiftKey;
  const usesOtherShortcut = event.ctrlKey && event.altKey && event.shiftKey;
  if ((usesMacShortcut || usesOtherShortcut) && event.key.toLowerCase() === "v") {
    event.preventDefault();
    vscode.postMessage({type: "returnToSource"});
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#")) return;
  event.preventDefault();
  vscode.postMessage({type: "openLink", href});
});
