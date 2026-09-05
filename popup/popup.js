import { transform } from "../tools/transformers.js";

const $ = id => document.getElementById(id);

function setResult(value, isError = false) {
  const result = $("result");
  result.textContent = value || "O resultado aparece aqui.";
  result.classList.toggle("empty", !value);
  result.style.color = isError ? "#fca5a5" : "";
}

async function execute() {
  try {
    const value = $("input").value;
    const action = $("tool").value;
    const result = transform(action, value);

    setResult(result);

    await chrome.storage.local.set({
      lastInput: value,
      lastResult: result,
      lastAction: action
    });
  } catch (error) {
    setResult(`Erro: ${error.message}`, true);
  }
}

chrome.storage.local.get(["lastInput", "lastResult", "lastAction"]).then(state => {
  if (state.lastInput) $("input").value = state.lastInput;
  if (state.lastAction) $("tool").value = state.lastAction;
  if (state.lastResult) setResult(state.lastResult);
});

$("run").addEventListener("click", execute);

$("copy").addEventListener("click", async () => {
  const text = $("result").textContent || "";
  if (!text || $("result").classList.contains("empty")) return;

  await navigator.clipboard.writeText(text);

  const btn = $("copy");
  const old = btn.textContent;
  btn.textContent = "Copiado ✓";
  setTimeout(() => btn.textContent = old, 900);
});

$("clear").addEventListener("click", () => {
  $("input").value = "";
  setResult("");
  $("input").focus();
});

$("options").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("openSnippets").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("openNoclip").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://noclipcode.com/" });
});

$("input").addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    execute();
  }
});
