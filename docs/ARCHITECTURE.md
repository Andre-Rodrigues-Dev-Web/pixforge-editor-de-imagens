# Arquitetura PixForge

## Visão geral

O repositório é um monorepo npm com três workspaces:

- `frontend`: Angular 22, standalone components, Signals, Router, Reactive Forms, SSR/hydration e PWA;
- `backend`: Fastify, Sharp e serviços TypeScript;
- `shared`: contratos sem dependência de framework.

O frontend carrega cada feature sob demanda. Conversão, otimização, remoção de fundo e favicon usam a API. Editor, thumbnail e enquadramento social mantêm um documento não destrutivo no Canvas até a exportação.

## Backend

```text
Route/Controller → ImageProcessorService → Provider/Adapter → Sharp
                                 ↘ ImageProcessingQueue
```

`ImageProcessingQueue` limita concorrência. `BackgroundRemovalProvider` e `HeicDecoder` evitam acoplamento a implementações específicas. Uploads são consumidos em memória, validados por assinatura real e descartados ao fim da requisição; nenhum nome original é usado como caminho.

## Evolução

Features futuras devem registrar um item na configuração central de ferramentas, criar rota lazy e manter contratos de processamento fora dos componentes. Provedores de IA devem implementar a interface existente, respeitar timeouts e não enviar imagens a terceiros sem consentimento explícito.
