# NoClipExtension — Chrome productivity extension

Extensão de navegador para expansão de snippets e utilitários de desenvolvimento. Integra o ecossistema [NoClipCode](https://www.noclipcode.com/).

**Versão documentada:** 2.2.0 · **Nome anterior:** CodeHelp

## Problema que resolve

Reescrever trechos frequentes de texto e código em diferentes sites e editores é repetitivo. A NoClipExtension permite salvar atalhos e expandi-los enquanto o usuário digita.

Exemplos de gatilhos: `/email`, `/fetch`, `/sql`, `/assinatura`, `/groovyEach`.

## Compatibilidade documentada

| Ambiente | Suporte descrito |
|---|---|
| Campos `input` de texto | Sim |
| `textarea` | Sim |
| `contenteditable` | Sim |
| CodeMirror 5 | Sim |
| Iframes | Quando o Chrome permite executar content scripts |

## Ferramentas de desenvolvimento

- Formatar e minificar JSON
- Encode/decode de Base64 e URL
- Inspecionar localmente header e payload de JWT
- Converter timestamps Unix
- Acessar o NoClipCode

## Privacidade e armazenamento

Os snippets são armazenados em `chrome.storage.local`. As transformações descritas nesta versão são executadas localmente.

## Evolução

O projeto começou como **CodeHelp**, inicialmente focado em atalhos para CodeMirror. A versão 2.2.0 consolidou a identidade NoClipExtension e o suporte a diferentes campos.

## Publicação

Antes de atualizar uma publicação na Chrome Web Store, conferir nome, descrição, screenshots, ícones, política de privacidade e referências antigas ao CodeHelp.

## Documentação a ampliar

Adicionar screenshots, instruções de instalação para desenvolvimento, arquitetura da extensão e resultados de testes verificados.
