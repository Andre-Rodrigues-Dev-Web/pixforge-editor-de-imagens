# Contribuição e GitFlow

## Branches permanentes

- `main`: versão estável e publicável;
- `develop`: integração do próximo ciclo.

Nenhuma alteração deve ser feita diretamente em `main`. Pull requests precisam de build, testes e revisão de segurança aprovados.

## Branches temporárias

Crie branches a partir de `develop`:

```bash
git switch develop
git pull --ff-only
git switch -c feature/conversao-em-lote
```

Prefixos:

- `feature/`: nova capacidade;
- `fix/`: correção comum;
- `hotfix/`: correção urgente criada a partir de `main`;
- `release/`: estabilização de versão;
- `chore/`: manutenção, dependências ou infraestrutura;
- `docs/`: documentação.

Use nomes curtos em kebab-case, sem nomes pessoais ou números sem contexto.

## Commits

Adotamos Conventional Commits:

```text
feat(converter): adiciona download de lote em zip
fix(upload): rejeita arquivo com assinatura inválida
docs(usage): explica fluxo do editor
test(api): cobre conversão png para webp
chore(deps): atualiza sharp por correção de segurança
```

Um commit deve representar uma mudança coerente, não misturar refatoração com feature e nunca incluir `.env`, arquivos enviados por usuários, builds ou segredos.

## Pull request

Antes de abrir o PR:

```bash
npm ci
npm run build
npm test
npm audit --omit=dev
```

Descreva problema, solução, riscos, evidências de teste e impacto visual. Para mudanças de API, documente contrato e compatibilidade. Prefira **Squash and merge** em features pequenas; preserve commits quando cada um tiver valor isolado para revisão.

## Releases

1. Crie `release/x.y.z` a partir de `develop`.
2. Faça apenas correções de estabilização e documentação.
3. Mescle em `main`, crie a tag assinada `vx.y.z` e retorne o merge para `develop`.
4. Para hotfix, crie `hotfix/x.y.z` a partir de `main` e mescle em `main` e `develop`.

## Regras de qualidade

- TypeScript strict e sem `any` explícito;
- componentes pequenos e regras de negócio fora da UI/controllers;
- arquivos reais nos testes de imagem;
- validação por magic bytes no backend;
- foco visível, labels e navegação por teclado;
- nenhuma imagem privada em logs, cache público ou fixtures versionadas.
