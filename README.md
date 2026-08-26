# PixForge

![PixForge](frontend/public/assets/pixforge-logo.png)

Oficina digital para converter, otimizar, editar e preparar imagens para web e redes sociais. O projeto combina processamento seguro no backend com edição não destrutiva no navegador.

## Recursos

- conversão JPEG, PNG, WebP e entrada HEIC/HEIF quando suportada pelo libvips da plataforma;
- otimização com qualidade, formato e dimensões configuráveis;
- lotes com progresso e download ZIP;
- remoção local de fundos uniformes com provider substituível;
- editor Canvas com filtros reais, comparação, undo/redo e exportação;
- thumbnails 1280 × 720 com texto em camadas;
- presets para redes sociais e áreas seguras de Story/Reels;
- pacote de favicon com ICO, PNGs, manifest e tags HTML;
- tema claro/escuro/sistema, SSR/hydration e PWA.

## Tecnologias

Angular 22, TypeScript strict, Standalone Components, Signals, Router, Reactive Forms, Canvas API, Fastify 5, Sharp 0.35, Vitest, SCSS e Docker.

## Pré-requisitos

- Node.js `22.22.3`, `24.15+` ou `26+` (LTS recomendado);
- npm 10 ou superior;
- Docker e Docker Compose, opcionalmente.

Node 25 não é suportado oficialmente pelo Angular 22. O build pode funcionar, mas use uma versão LTS listada acima em desenvolvimento e produção.

## Instalação e desenvolvimento

```bash
cp .env.example .env
npm ci
npm run dev
```

Abra `http://localhost:4200`. A API fica em `http://localhost:3000`.

## Build e testes

```bash
npm run build
npm test
npm audit --omit=dev
```

Artefatos são gerados em `frontend/dist/frontend` e `backend/dist`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

O frontend fica disponível na porta 4200 e a API na porta 3000.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---:|---|
| `NODE_ENV` | `development` | Ambiente de execução |
| `PORT` | `3000` | Porta da API |
| `MAX_UPLOAD_SIZE_MB` | `50` | Limite por arquivo |
| `MAX_BATCH_FILES` | `30` | Limite do lote |
| `TMP_FILE_TTL_MINUTES` | `30` | Reservado para providers que usem temporários |
| `IMAGE_PROCESSING_CONCURRENCY` | `4` | Operações simultâneas |
| `CORS_ORIGIN` | `http://localhost:4200` | Origem permitida |

## Estrutura

```text
pixforge/
├── frontend/       Angular 22, design system e features lazy
├── backend/        API Fastify e engine de imagem
├── shared/         contratos TypeScript
├── docs/           uso, arquitetura, segurança e contribuição
├── docker/         imagens de produção
├── docker-compose.yml
└── .env.example
```

## API

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/v1/health` | Saúde da API |
| `POST` | `/api/v1/images/convert` | Conversão |
| `POST` | `/api/v1/images/optimize` | Otimização |
| `POST` | `/api/v1/images/remove-background` | Fundo transparente |
| `POST` | `/api/v1/images/crop` | Crop |
| `POST` | `/api/v1/images/resize` | Redimensionamento |
| `POST` | `/api/v1/images/export` | Exportação |
| `POST` | `/api/v1/favicon/generate` | Pacote favicon |

Uploads usam `multipart/form-data` no campo `file`. Opções como `format`, `quality`, `width`, `height` e `removeMetadata` são query parameters. Respostas de processamento bem-sucedidas são binárias; erros seguem o contrato `{ success: false, error: { code, message } }`.

## Documentação

- [Guia de uso](docs/USAGE.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Segurança](docs/SECURITY.md)
- [Contribuição e GitFlow](docs/CONTRIBUTING.md)

## Deploy e segurança

Execute atrás de um proxy TLS, configure a origem CORS exata, limite recursos do container e monitore taxa de erros sem registrar conteúdo binário. O backend atual trabalha em memória e descarta buffers ao fim da requisição. Consulte o guia de segurança antes de disponibilizar publicamente.

## Licença

Defina uma licença antes da distribuição pública. A logo PixForge e a identidade visual permanecem sob os direitos de seus proprietários.
