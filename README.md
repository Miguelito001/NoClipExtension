# NoClipExtension 2.2.0

**NoClipExtension** é a evolução do antigo CodeHelp para uma extensão de produtividade integrada ao ecossistema **NoClipCode**.

## Proposta

Crie snippets como:

- `/email`
- `/fetch`
- `/sql`
- `/assinatura`
- `/groovyEach`

e expanda os atalhos diretamente enquanto digita.

## Suporte atual

- `<input>` de texto
- `<textarea>`
- elementos `contenteditable`
- CodeMirror 5
- iframes onde extensões do Chrome podem executar content scripts

## Developer Tools

A extensão também mantém ferramentas rápidas para:

- JSON: formatar e minificar
- Base64: encode/decode
- URL: encode/decode
- JWT: inspeção local de header/payload
- Timestamp: conversão Unix/data
- integração com o NoClipCode

## Privacidade

Os snippets ficam armazenados em `chrome.storage.local`.
As transformações implementadas nesta versão são processadas localmente.

## Histórico

O projeto nasceu como **CodeHelp**, uma extensão focada em atalhos `/comando` para produtividade em CodeMirror.

A partir da versão **2.2.0**, passa a se chamar **NoClipExtension**, mantendo a ideia de expansão de snippets e ampliando o suporte para campos e editores diferentes.

## Observação para Chrome Web Store

Esta build altera apenas a identidade exibida e mantém o funcionamento da 2.1.2.
Ao atualizar o listing existente, revise também:

- nome do item
- descrição curta e completa
- screenshots
- ícones
- política de privacidade
- textos que ainda mencionem CodeHelp no Developer Dashboard
