# TrackIG — HERO, Tecnologia, Operação e Contato

Cabeçalho, HERO, seções Tecnologia, Operação e Contato e rodapé estáticos em HTML, CSS e JavaScript, sem dependências de execução ou requisições externas no carregamento da página.

## Executar

Com Node.js 20 ou superior:

```sh
npm run dev
```

Abra http://127.0.0.1:4173. Para verificar a sintaxe JavaScript: `npm run check`.

## Build e Vercel

Execute `npm run build` para gerar `dist/`. O build copia, sem modificar os bytes, apenas `index.html`, `styles.css`, `script.js` e `assets/`, incluindo as licenças das fontes. Não há dependências para instalar. Documentação, servidor local e configurações do repositório ficam fora da saída. A pasta gerada é ignorada pelo Git.

Ao importar o repositório na Vercel, use a raiz do projeto e as configurações declaradas em `vercel.json`:

- Framework Preset: **Other**.
- Build Command: `npm run build`.
- Output Directory: `dist`.

Não são necessárias variáveis de ambiente. O site é estático; os contatos e os valores da seção Operação são os conteúdos já fornecidos. A área do cliente continua com o aviso de desenvolvimento.

## Destinos comerciais

Os dois CTAs da HERO abrem o WhatsApp oficial fornecido, +55 85 99131-8582, em nova aba com `noopener noreferrer`. Os destinos ficam em `TRACKIG_CONFIG`, no início de `script.js`; as âncoras HTML mantêm o endereço para funcionar também sem JavaScript. Contato navega para o formulário da quarta seção. A área do cliente abre um aviso de que está em desenvolvimento. Soluções leva à seção Tecnologia. Seu CTA abre uma explicação sobre rastreamento em tempo real, histórico e alertas, sem simular uma integração operacional. Como funciona mantém o aviso de apresentação em preparação.

## Visual e acessibilidade

`assets/hero-background.png` é o fundo fornecido, em uma camada suavizada separada da arte do celular. A referência é utilizada como sprite para o logo e como camada recortada por CSS para preservar o celular e a rocha. O título visual é `assets/hero-headline.svg`: contornos vetoriais das letras extraídos da referência, com vazados preservados e sem bitmap embutido. O `h1` mantém o texto HTML acessível, e o SVG decorativo fica oculto da árvore de acessibilidade. Se o SVG falhar, o texto passa a ser exibido com a fonte local de reserva. Descrição, navegação e CTAs também são HTML real. A interface do celular pertence à imagem ilustrativa e não é um painel operacional.

O layout usa a composição de 1672 × 941 como base e muda para disposição vertical em telas de até 1050 px. Entre 1051 e 1250 px, em proporções mais altas que a referência, uma sombra adaptativa protege o contraste do texto sobre a foto. Há menu móvel, foco visível, link para pular ao conteúdo e diálogos nativos com fechamento por Escape. Roboto e a fonte de reserva Russo One estão hospedadas localmente; suas licenças estão em `assets/fonts/`.

Até 767 px, a HERO usa a composição vertical das referências de 720 × 1280, com altura determinada pelo conteúdo e alvos de toque de pelo menos 44 px. Os JPEGs `hero-mobile-motorcycle.jpg` e `hero-mobile-car.jpg` são os originais íntegros; o CSS mostra somente sua fotografia abaixo de y690. Uma máscara vetorial mantém o celular e a rocha da moto fixos enquanto o veículo e seus reflexos alternam por fade. Título vetorial, descrição, cabeçalho, CTAs e controles continuam separados da fotografia, com texto HTML acessível e fallback de título. O módulo `hero-mobile-carousel.js` alterna a cada cinco segundos, oferece anterior/próximo, swipe e pausa e suspende a troca fora da tela, com aba oculta, menu/diálogo aberto, foco ou mouse na HERO. Movimento reduzido começa parado e remove o fade. Sem JavaScript ou com falha na segunda foto, a moto permanece visível e os controles ficam ocultos.

A geração dos contornos do título foi feita fora do runtime do site; o SVG final não exige bibliotecas nem fontes externas. Os bitmaps fornecidos foram preservados. O endereço da área do cliente ainda precisa ser fornecido após seu desenvolvimento. Revisão independente e QA ficam a cargo do coordenador.

A seção Tecnologia usa o novo design claro de 1280 × 720 com espaçamentos compactos, sem altura mínima de tela: o conteúdo tem largura máxima de 1200 px para limitar seu crescimento em monitores maiores. Seu título visual, `assets/technology-headline.svg`, mantém os contornos da referência e o texto acessível em um `h2`, com fallback local. A imagem `assets/technology-map-reference.jpg` preserva o JPEG original byte a byte; somente o recorte do mapa (x84/y241, 1112 × 276) aparece em um sprite CSS com proporção própria no desktop. Até 767 px, o sprite passa a usar `assets/technology-mobile-reference.jpg`, também copiado byte a byte do original 720 × 1280: somente o mapa x50/y325, 622 × 389 fica visível, com carro, pin e etiquetas completos. Título, descrição, três cards empilhados com bordas e ícones vetoriais e CTA continuam em HTML/CSS separados da fotografia. Os textos dos cards têm pelo menos 14 px e podem quebrar em celulares estreitos; a altura da seção acompanha o conteúdo. O mapa e suas etiquetas são exemplos ilustrativos estáticos, sem controles ou telemetria reais, com descrição acessível. O CTA Explorar a tecnologia tem alvo de pelo menos 44 px e reutiliza o diálogo existente com retorno de foco. A composição de desktop a partir de 768 px é preservada.

A seção Operação fica imediatamente abaixo de Tecnologia e usa o fundo original limpo de 1672 × 941, com escala proporcional, brilho ajustado e um painel central escuro para leitura. O título, os valores e os ícones dos cards usam SVGs de contornos da referência, sem raster embutido; os títulos e indicadores permanecem como texto HTML acessível, com fallback local. A pequena marca na parede usa um sprite decorativo recortado da referência, com bordas suavizadas. Os três cards são elementos HTML/CSS com fundo opaco e passam a uma coluna em telas de até 1150 px. Os valores +1.482, 98,7% e a afirmação de operação nacional reproduzem o material fornecido: são estáticos, sem contador, consulta de telemetria, CTA ou novas integrações.

Em telas abaixo de 768 px, Operação usa a composição mobile fornecida: caminhão à direita, título em três linhas, parágrafo mobile e três cards lado a lado. Até 360 px, os cards passam a uma coluna para preservar a leitura. Entre 361 e 479 px, somente as legendas complementares dos cards usam 12 px para manter palavras inteiras; o restante do corpo mantém no mínimo 14 px. A arte ilustrativa `operation-mobile-clean-background.png` foi editada com ImageGen a partir da referência para remover textos, cards e selo; fotografia e mapa aparecem como recortes CSS sem máscaras de apagamento. A proveniência está registrada em `artifacts/operation-mobile/imagegen-record.md`. Título, parágrafo, números, textos dos cards e selo de cobertura são HTML; os ícones dos indicadores reutilizam os SVGs existentes. O mapa é ilustrativo, sem API, animação ou controles. A altura da seção acompanha o conteúdo; a composição desktop e seu texto continuam preservados a partir de 768 px.

A seção Contato segue a referência de 1672 × 941 com fundo claro em CSS, título vetorial acessível e campos HTML reais. O nome aceita acentos e nomes curtos e rejeita vazio/apenas espaços. O WhatsApp aceita número brasileiro com DDD e 10 ou 11 dígitos, pontuação comum e código 55 opcional. O interesse deve ser uma das quatro categorias exibidas. Erros em português identificam os campos e direcionam o foco ao primeiro inválido.

Ao iniciar atendimento com dados válidos, o navegador abre uma conversa no WhatsApp comercial com nome, telefone normalizado e interesse codificados na URL, para o visitante revisar e enviar. A página não envia a mensagem automaticamente, não armazena os dados, não os registra em console e não usa backend, analytics ou variáveis de ambiente. O aviso de privacidade da referência é preservado. O envio nativo fica desativado até o JavaScript conectar a validação; sem JavaScript, o botão permanece inativo e é mostrado um link direto ao WhatsApp, sem incorporar os campos à URL da hospedagem. O método POST é apenas uma proteção contra GET nativo, não um endpoint de coleta. As regras puras estão em `assets/contact-form.js` e não exigem bibliotecas.

O rodapé segue a referência de 2170 × 725, com marca vetorial acessível, slogans, colunas e contatos reais em HTML. A navegação leva às quatro seções; Soluções e Sobre levam à seção Operação. O telefone oficial é +55 85 99131-8582 e o email é comercial@trackig.com.br. Instagram, LinkedIn, YouTube, Privacidade e Termos de uso abrem avisos de indisponibilidade no diálogo existente, conforme solicitado; não há perfis ou documentos inventados. Os controles sociais têm alvo mínimo de 44 px, nomes acessíveis e retorno de foco ao fechar o aviso.
