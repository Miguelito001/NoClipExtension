# Diagnóstico CodeMirror — 2.1.1

Esta build usa o mesmo fluxo-base da versão 1.1 que funcionava no ambiente original:
`.CodeMirror` -> `element.CodeMirror` -> textarea keyup -> getCursor/getLine -> replaceRange.

A diferença é que o mapa de snippets vem de `chrome.storage.local`.

## Teste
1. Recarregue a extensão.
2. Recarregue completamente a página do editor.
3. Confirme que `/teste` existe em Snippets.
4. Digite `/teste`.

## Se ainda não substituir
Abra DevTools da página e procure no Console:

- `NoClipExtension: X snippets disponíveis no CodeMirror.`
- `NoClipExtension conectado ao CodeMirror.`

Essas duas mensagens dizem exatamente qual metade falhou:
- se não aparecer a primeira, o bridge não recebeu os snippets;
- se aparecer a primeira mas não a segunda, a instância CodeMirror não foi localizada;
- se aparecerem as duas, o próximo diagnóstico é o evento/forma de edição.
