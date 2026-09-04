# Guia de uso do PixForge

O PixForge é uma oficina digital para transformar imagens sem exigir conhecimento técnico. Abra `http://localhost:4200` após iniciar o projeto e escolha uma ferramenta no painel.

## Enviar imagens

Você pode arrastar arquivos para a área pontilhada, clicar para selecionar ou colar uma imagem da área de transferência. O limite padrão é de 50 MB por arquivo e 30 arquivos por lote. Formatos aceitos: JPEG, PNG, WebP, AVIF, HEIC e HEIF, conforme a ferramenta.

## Conversor

1. Abra **Converter**.
2. Envie uma ou mais imagens.
3. Escolha JPG, PNG ou WebP e ajuste a qualidade.
4. Em configurações avançadas, defina dimensões máximas ou remova metadados.
5. Clique em **Converter imagens**.
6. Baixe cada resultado ou gere um ZIP com todo o lote.

As dimensões originais são preservadas quando largura e altura não são informadas. A orientação EXIF é aplicada automaticamente.

## Otimizador

Envie imagens, escolha o formato final, a qualidade e, opcionalmente, uma largura máxima. O resultado mostra tamanho original, tamanho final e economia percentual. A opção de não ampliar imagens menores permanece ativa por padrão.

## Removedor de fundo

O provedor inicial funciona localmente no backend e é indicado para fundos uniformes de estúdio. Envie a imagem, processe e baixe o PNG transparente. Cenas complexas exigirão o adaptador de segmentação previsto na arquitetura.

## Thumbnail para YouTube

O canvas usa 1280 × 720. Envie uma imagem, altere o texto, tamanho, cor, contorno e ajustes visuais. Use **Pressione para ver original** para comparar e exporte em JPG, PNG ou WebP.

## Gerador de favicon

Envie preferencialmente uma imagem quadrada. O ZIP contém `favicon.ico`, PNGs de 16, 32, 180, 192 e 512 pixels, `site.webmanifest` e um arquivo com as tags HTML.

## Editor de fotos

Use os presets ou ajuste brilho, contraste, saturação, temperatura e desfoque. Girar, espelhar, desfazer, refazer e resetar não recomprimem o arquivo durante a edição. A renderização definitiva ocorre apenas ao exportar.

Atalhos:

- `Ctrl/Cmd + Z`: desfazer;
- `Ctrl/Cmd + Shift + Z`: refazer;
- `Ctrl/Cmd + S`: exportar.

## Social Crop

Escolha um preset para post quadrado, feed vertical, Story/Reels, post horizontal, YouTube ou header. O PixForge redimensiona o canvas e mantém o enquadramento central. Stories exibem áreas seguras.

## Publicar evento

1. Informe nome, data, cidade e fotógrafo do evento.
2. Adicione até 200 fotos, em uma ou mais seleções.
3. Escolha o veículo: Sou Mais Bambuí, Sou Mais Minas Gerais ou Na BaladaMG.
4. Faça a triagem, marque favoritas, ajuste a ordem e exclua fotos que não serão publicadas.
5. Para cada foto, revise rotação, brilho, contraste, ponto focal, legenda, crédito e texto alternativo.
6. Escolha as saídas: galeria, capa, Instagram Feed, Story/Reels e miniaturas.
7. Gere e baixe o pacote editorial.

Galeria e miniaturas são geradas para todas as fotos incluídas. Capa e formatos sociais usam as favoritas; quando nenhuma favorita é marcada, usam a primeira foto. O ZIP separa os arquivos por canal e inclui `manifesto.json`, `fotos.csv`, `wordpress-import.json` e um guia de leitura.

As preferências de marca, qualidade e formatos ficam salvas por veículo no dispositivo. O conteúdo exportado não preserva EXIF nem localização GPS; crédito, legenda e autoria ficam registrados nos manifestos.

## Tema e privacidade

O botão de lua alterna entre claro, escuro e sistema. A preferência fica apenas no dispositivo. Imagens não são gravadas permanentemente nem incluídas em logs.
