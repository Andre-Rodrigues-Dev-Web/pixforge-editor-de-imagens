# Design QA — Marca para galeria

## Evidências

- Fonte visual Sou Mais Minas Gerais: `C:\Users\AndreLR\Desktop\noticias-soumaisbambui\aniversario-ifmg\comprimidas\foto-7.png`
- Fonte visual Sou Mais Bambuí: `C:\Users\AndreLR\Desktop\noticias-soumaisbambui\aniversario-ifmg\soumaisbambui\pixforge-resultados\foto-1-pixforge.jpg`
- Implementação desktop Minas: `docs/brand-gallery/01-editor-minas-desktop.png`
- Implementação desktop Bambuí: `docs/brand-gallery/02-editor-bambui-desktop.png`
- Implementação móvel: `docs/brand-gallery/03-onboarding-mobile.png`
- Comparação focada Minas: `docs/brand-gallery/qa-minas-comparison.png`
- Comparação focada Bambuí: `docs/brand-gallery/qa-bambui-comparison.png`
- Estado: duas imagens carregadas, marca alternada, logo e endereço ativos, WebP a 78%, largura máxima de 1920 px.
- Viewport desktop: 1440 × 1000 CSS px, DPR 1.
- Viewport móvel: 390 × 844 CSS px, DPR 1.
- Fontes visuais: 6000 × 4000 px. Canvas de saída: 1920 × 1280 px. Comparações normalizadas em 450 × 300 px por lado.

## Superfícies de fidelidade

- Tipografia: a faixa utiliza Manrope/Arial em peso 700, equivalente ao texto branco forte dos modelos, com ajuste automático para evitar corte em qualquer largura.
- Espaçamento e layout: Sou Mais Minas mantém o logo no canto superior direito e Sou Mais Bambuí mantém o lockup centralizado acima da faixa. A faixa ocupa aproximadamente 54% da largura e respeita a margem inferior observada.
- Cores e tokens: fundo preto translúcido, texto branco e contornos oficiais vermelho `#ed1c24` e verde `#07963f` correspondem aos modelos.
- Imagens e ativos: foram usados logotipos raster transparentes oficiais, sem reconstruções em CSS ou SVG. A proporção e a suavização da foto são preservadas.
- Copy: o endereço muda automaticamente entre `soumaisminasgerais.com.br` e `soumaisbambui.com.br`.

## Comparação completa

As capturas desktop confirmam hierarquia clara entre fila, prévia e configuração. O estado da marca, os controles de exportação e a economia alcançada ficam visíveis sem interromper o trabalho no canvas.

## Comparação focada

As composições lado a lado confirmam posição, escala, contraste e contorno equivalentes aos modelos. A diferença de conteúdo fotográfico na comparação Bambuí é intencional: a ferramenta foi testada alternando a marca sobre o mesmo lote para validar o switch.

## Histórico de iteração

1. Primeira captura: fluxo funcional, porém o orçamento de estilo gerava aviso no build e o download era acionado apenas por link criado em memória.
2. Correções: orçamento compatível com a complexidade do editor; download individual passou a usar um link visível com nome de arquivo e URL de saída próprios; URLs temporárias agora são revogadas ao remover, limpar ou alterar configurações.
3. Evidência pós-correção: build sem avisos da aplicação, quatro testes aprovados, preview responsivo, dois arquivos processados para 142 KB e 109 KB e console limpo.

## Interações e console

- Upload múltiplo testado com duas imagens de 6000 × 4000 px.
- Switch entre Sou Mais Bambuí e Sou Mais Minas Gerais testado.
- Processamento em lote testado em WebP, qualidade 78%, largura 1920 px.
- Resultado observado: 9,4 MB para 252 KB no lote de validação, redução aproximada de 97%.
- Links individuais e ação de pacote ZIP apresentados após o processamento.
- Layout testado em 1440 × 1000 e 390 × 844 sem overflow horizontal.
- Console verificado sem erros ou avisos da aplicação.

## Findings

Nenhuma diferença P0, P1 ou P2 permanece. Como refinamento P3, uma futura versão pode permitir arrastar manualmente o logo; o posicionamento automático atual é deliberado para manter consistência editorial.

## Implementation Checklist

- [x] Alternância entre as duas marcas
- [x] Switches independentes para logo e endereço
- [x] Composição fiel aos modelos
- [x] Processamento de até 30 imagens
- [x] WebP/JPEG, qualidade e largura configuráveis
- [x] Download individual e pacote ZIP
- [x] Responsividade e acessibilidade básica
- [x] Build, testes e console aprovados

final result: passed
