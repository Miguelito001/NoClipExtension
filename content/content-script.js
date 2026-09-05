(() => {
  'use strict';

  let snippets = [];
  let snippetMap = new Map();
  let settings = { universalSnippets: true };

  const STATE_ID = 'codehelp-snippet-state-v211';

  function normalizeCommand(command) {
    const clean = String(command || '').trim();
    if (!clean) return '';
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  function rebuildSnippetMap() {
    snippetMap = new Map(
      snippets
        .filter(s =>
          s &&
          s.enabled !== false &&
          typeof s.command === 'string' &&
          typeof s.replacement === 'string' &&
          s.command.trim()
        )
        .map(s => [normalizeCommand(s.command), s.replacement])
    );
  }

  function writeBridgeState() {
    let state = document.getElementById(STATE_ID);

    if (!state) {
      state = document.createElement('meta');
      state.id = STATE_ID;
      state.style.display = 'none';
      (document.head || document.documentElement).appendChild(state);
    }

    state.setAttribute(
      'data-snippets',
      JSON.stringify(snippets.filter(s => s?.enabled !== false))
    );

    // DOM event is used instead of postMessage so the page-context bridge
    // always has a deterministic state source.
    document.dispatchEvent(new CustomEvent('codehelp-snippets-updated'));
  }

  function injectCodeMirrorBridge() {
    if (document.documentElement.dataset.codehelpBridgeV211 === '1') return;
    document.documentElement.dataset.codehelpBridgeV211 = '1';

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page/codemirror-bridge.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  async function loadState() {
    const state = await chrome.storage.local.get(['snippets', 'settings']);
    snippets = Array.isArray(state.snippets) ? state.snippets : [];
    settings = { ...settings, ...(state.settings || {}) };

    rebuildSnippetMap();

    // IMPORTANT: state exists before CodeMirror bridge is injected.
    writeBridgeState();
    injectCodeMirrorBridge();
  }

  function extractCommand(beforeCursor) {
    const match = String(beforeCursor || '').match(/\/[\w.-]+$/);
    return match ? match[0] : '';
  }

  function tryExpandTextControl(el) {
    if (!settings.universalSnippets) return false;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return false;

    // CodeMirror gets its own adapter in page context.
    if (el.closest?.('.CodeMirror')) return false;

    if (el instanceof HTMLInputElement) {
      const allowed = new Set(['text', 'search', 'url', 'email', 'tel', '']);
      if (!allowed.has((el.type || '').toLowerCase())) return false;
    }

    const caret = el.selectionStart;
    if (typeof caret !== 'number') return false;

    const value = el.value || '';
    const command = extractCommand(value.slice(0, caret));
    if (!command) return false;

    const replacement = snippetMap.get(command);
    if (replacement == null) return false;

    const start = caret - command.length;
    const end = el.selectionEnd ?? caret;

    el.setRangeText(replacement, start, end, 'end');
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: replacement
    }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  }

  function closestEditable(node) {
    let el = node instanceof Element ? node : node?.parentElement;
    while (el) {
      if (el.isContentEditable) return el;
      el = el.parentElement;
    }
    return null;
  }

  function getTextBeforeCaretWithin(root) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return null;

    const current = selection.getRangeAt(0);
    if (!root.contains(current.endContainer)) return null;

    const probe = document.createRange();
    probe.selectNodeContents(root);
    probe.setEnd(current.endContainer, current.endOffset);
    return probe.toString();
  }

  function replaceCommandInContentEditable(root, command, replacement) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;

    const caretRange = selection.getRangeAt(0);
    let caretNode = caretRange.endContainer;
    let caretOffset = caretRange.endOffset;

    if (caretNode.nodeType !== Node.TEXT_NODE) {
      const insert = document.createTextNode(replacement);
      caretRange.insertNode(insert);
      caretRange.setStartAfter(insert);
      caretRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caretRange);
      root.dispatchEvent(new InputEvent('input', { bubbles: true, data: replacement }));
      return true;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    let index = nodes.indexOf(caretNode);
    if (index < 0) return false;

    let remaining = command.length;
    const segments = [];

    while (index >= 0 && remaining > 0) {
      const node = nodes[index];
      const end = node === caretNode ? caretOffset : node.data.length;
      const take = Math.min(remaining, end);

      segments.unshift({ node, start: end - take, end });
      remaining -= take;
      index--;
    }

    if (remaining > 0 || !segments.length) return false;

    const range = document.createRange();
    range.setStart(segments[0].node, segments[0].start);
    range.setEnd(
      segments[segments.length - 1].node,
      segments[segments.length - 1].end
    );

    range.deleteContents();

    const textNode = document.createTextNode(replacement);
    range.insertNode(textNode);

    const after = document.createRange();
    after.setStartAfter(textNode);
    after.collapse(true);

    selection.removeAllRanges();
    selection.addRange(after);

    root.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: replacement
    }));

    return true;
  }

  function tryExpandContentEditable(target) {
    if (!settings.universalSnippets) return false;

    const root = closestEditable(target);
    if (!root || root.closest?.('.CodeMirror')) return false;

    const before = getTextBeforeCaretWithin(root);
    if (before == null) return false;

    const command = extractCommand(before);
    if (!command) return false;

    const replacement = snippetMap.get(command);
    if (replacement == null) return false;

    return replaceCommandInContentEditable(root, command, replacement);
  }

  function handleTyping(event) {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;

    const target = event.target;

    if (target instanceof Element && target.closest('.CodeMirror')) return;

    if (tryExpandTextControl(target)) return;
    tryExpandContentEditable(target);
  }

  document.addEventListener('keyup', handleTyping, true);

  document.addEventListener('input', (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest('.CodeMirror')) return;

    if (tryExpandTextControl(target)) return;
    tryExpandContentEditable(target);
  }, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.snippets) {
      snippets = Array.isArray(changes.snippets.newValue)
        ? changes.snippets.newValue
        : [];
      rebuildSnippetMap();
      writeBridgeState();
    }

    if (changes.settings) {
      settings = { ...settings, ...(changes.settings.newValue || {}) };
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'CODEHELP_RESULT') {
      showToast(message.result);
    }
  });

  function showToast(text) {
    document.getElementById('codehelp-toast')?.remove();

    const box = document.createElement('div');
    box.id = 'codehelp-toast';
    box.textContent = text.length > 500 ? text.slice(0, 500) + '…' : text;

    Object.assign(box.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '2147483647',
      maxWidth: '520px',
      maxHeight: '240px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      background: '#111827',
      color: '#f9fafb',
      border: '1px solid #22c55e',
      padding: '12px 14px',
      borderRadius: '10px',
      font: '13px/1.45 monospace',
      boxShadow: '0 10px 30px rgba(0,0,0,.35)'
    });

    document.documentElement.appendChild(box);

    box.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        box.textContent = 'Copiado!';
      } catch {}
      setTimeout(() => box.remove(), 800);
    });

    setTimeout(() => box.remove(), 8000);
  }

  loadState();
})();
