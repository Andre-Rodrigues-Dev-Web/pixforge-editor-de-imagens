# Segurança e privacidade

## Controles implementados

- limite configurável de requisição, arquivos e concorrência;
- validação por magic bytes e decodificação real;
- limite de pixels para reduzir risco de decompression bomb;
- Helmet, CORS explícito, rate limiting e compressão;
- mensagens de erro padronizadas sem stack trace para clientes;
- nomes sanitizados e ausência de escrita permanente no servidor;
- service worker limitado a assets estáticos, sem cache de imagens do usuário;
- imagem binária nunca é registrada em logs.

## Reporte responsável

Não publique vulnerabilidades em issues abertas. Envie um relato privado aos mantenedores com impacto, passos mínimos para reprodução e versão afetada. Não inclua imagens ou dados reais de terceiros.

## Operação

Use Node LTS compatível, mantenha dependências sem vulnerabilidades conhecidas e configure `CORS_ORIGIN` para a origem exata de produção. Execute `npm audit --omit=dev` e os testes antes de cada release.
