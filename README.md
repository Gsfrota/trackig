# TrackIG — HERO

Cabeçalho e HERO estáticos em HTML, CSS e JavaScript, sem dependências de execução ou requisições externas no navegador.

## Executar

Com Node.js 20 ou superior:

```sh
npm run dev
```

Abra http://127.0.0.1:4173. Para verificar a sintaxe JavaScript: `npm run check`.

## Destinos comerciais

Os dois CTAs e Contato abrem o WhatsApp oficial fornecido, +55 85 99131-8582, em nova aba com `noopener noreferrer`. Os destinos ficam em `TRACKIG_CONFIG`, no início de `script.js`; as âncoras HTML mantêm o endereço para funcionar também sem JavaScript. A área do cliente abre um aviso de que está em desenvolvimento. Não há formulário nem coleta de dados. Soluções e Como funciona abrem mensagens sobre o conteúdo em preparação, sem adicionar outras seções à página.

## Visual e acessibilidade

`assets/hero-background.png` é o fundo fornecido, em uma camada suavizada separada da arte do celular. A referência é utilizada como sprite para o logo e como camada recortada por CSS para preservar o celular e a rocha. O título visual é `assets/hero-headline.svg`: contornos vetoriais das letras extraídos da referência, com vazados preservados e sem bitmap embutido. O `h1` mantém o texto HTML acessível, e o SVG decorativo fica oculto da árvore de acessibilidade. Se o SVG falhar, o texto passa a ser exibido com a fonte local de reserva. Descrição, navegação e CTAs também são HTML real. A interface do celular pertence à imagem ilustrativa e não é um painel operacional.

O layout usa a composição de 1672 × 941 como base e muda para disposição vertical em telas de até 1050 px. Entre 1051 e 1250 px, em proporções mais altas que a referência, uma sombra adaptativa protege o contraste do texto sobre a foto. Há menu móvel, foco visível, link para pular ao conteúdo e diálogos nativos com fechamento por Escape. Roboto e a fonte de reserva Russo One estão hospedadas localmente; suas licenças estão em `assets/fonts/`.

A geração dos contornos do título foi feita fora do runtime do site; o SVG final não exige bibliotecas nem fontes externas. Os bitmaps fornecidos foram preservados. O endereço da área do cliente ainda precisa ser fornecido após seu desenvolvimento. Revisão independente e QA ficam a cargo do coordenador.
