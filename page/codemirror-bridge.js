(() => {
  'use strict';

  const DELAY = 300;
  const STATE_ID = 'codehelp-snippet-state-v211';

  let typingTimer;
  let METHOD_MAP = {};

  function normalizeCommand(command) {
    const clean = String(command || '').trim();
    if (!clean) return '';
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  function loadSnippetsFromDom() {
    try {
      const state = document.getElementById(STATE_ID);
      const raw = state?.getAttribute('data-snippets') || '[]';
      const snippets = JSON.parse(raw);

      METHOD_MAP = {};

      if (Array.isArray(snippets)) {
        snippets.forEach(item => {
          if (
            item &&
            item.enabled !== false &&
            typeof item.command === 'string' &&
            typeof item.replacement === 'string'
          ) {
            METHOD_MAP[normalizeCommand(item.command)] = item.replacement;
          }
        });
      }

      console.log(
        `✅ NoClipExtension: ${Object.keys(METHOD_MAP).length} snippets disponíveis no CodeMirror.`
      );
    } catch (error) {
      console.error('❌ NoClipExtension: erro lendo snippets:', error);
      METHOD_MAP = {};
    }
  }

  document.addEventListener('codehelp-snippets-updated', loadSnippetsFromDom);
  loadSnippetsFromDom();

  // This intentionally follows the NoClipExtension v1.1 mechanism that already worked
  // in the target CodeMirror environment.
  function waitForEditorInitialization() {
    const cmElements = document.querySelectorAll('.CodeMirror');

    cmElements.forEach(cmElement => {
      if (!cmElement.dataset.codehelpListenerAdded) {
        const interval = setInterval(() => {
          if (
            cmElement.CodeMirror &&
            typeof cmElement.CodeMirror.getValue === 'function'
          ) {
            clearInterval(interval);
            cmElement.dataset.codehelpListenerAdded = 'true';
            addListenersToEditor(cmElement);
          }
        }, 500);
      }
    });
  }

  function addListenersToEditor(cmElement) {
    const editor = cmElement.CodeMirror;

    if (editor && typeof editor.getValue === 'function') {
      const textarea = cmElement.querySelector('textarea');

      if (textarea) {
        textarea.addEventListener('keyup', () => {
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => handleInput(editor), DELAY);
        });

        console.log('✅ NoClipExtension conectado ao CodeMirror.');
      } else {
        console.error('❌ NoClipExtension: textarea não encontrado no CodeMirror.');
      }
    }
  }

  function handleInput(editor) {
    const cursor = editor.getCursor();
    const content = editor.getLine(cursor.line);

    const lastWord = extractLastWord(content, cursor.ch);

    if (METHOD_MAP[lastWord]) {
      replaceMethod(
        editor,
        lastWord,
        METHOD_MAP[lastWord],
        cursor
      );
    }
  }

  function extractLastWord(content, cursorPos) {
    const beforeCursor = content.slice(0, cursorPos);
    const match = beforeCursor.match(/\/[\w.]*$/);
    return match ? match[0] : '';
  }

  function replaceMethod(editor, method, replacement, cursor) {
    const lineContent = editor.getLine(cursor.line);
    const methodIndex = lineContent.lastIndexOf(method);

    if (methodIndex !== -1) {
      const startPos = {
        line: cursor.line,
        ch: methodIndex
      };

      const endPos = {
        line: cursor.line,
        ch: methodIndex + method.length
      };

      editor.replaceRange(
        replacement,
        startPos,
        endPos
      );
    }
  }

  setInterval(waitForEditorInitialization, 1000);
  waitForEditorInitialization();
})();
