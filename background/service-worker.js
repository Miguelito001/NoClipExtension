import { transform } from "../tools/transformers.js";

const ROOT = "codehelp";
const ACTIONS = [
  ["json-format", "Formatar JSON"],
  ["json-minify", "Minificar JSON"],
  ["base64-encode", "Base64 → Encode"],
  ["base64-decode", "Base64 → Decode"],
  ["url-encode", "URL → Encode"],
  ["url-decode", "URL → Decode"],
  ["jwt-inspect", "Inspecionar JWT"],
  ["timestamp", "Converter timestamp"]
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: ROOT, title: "NoClipExtension", contexts: ["selection"]
    });
    for (const [id, title] of ACTIONS) {
      chrome.contextMenus.create({
        id, parentId: ROOT, title, contexts: ["selection"]
      });
    }
    chrome.contextMenus.create({
      id: "open-noclipcode", parentId: ROOT, title: "Abrir NoClipCode",
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selected = info.selectionText || "";
  if (info.menuItemId === "open-noclipcode") {
    chrome.tabs.create({ url: "https://noclipcode.com/" });
    return;
  }
  try {
    const result = transform(String(info.menuItemId), selected);
    await chrome.storage.local.set({ lastResult: result, lastInput: selected, lastAction: info.menuItemId });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "CODEHELP_RESULT", result }).catch(() => {});
    }
  } catch (error) {
    await chrome.storage.local.set({ lastResult: `Erro: ${error.message}`, lastInput: selected, lastAction: info.menuItemId });
  }
});
