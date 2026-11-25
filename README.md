# Kelly Corrêa — Neuropsicopedagoga Clínica

Website profissional de Kelly Corrêa, neuropsicopedagoga clínica em São José do Rio Pardo/SP, especializado em atendimento para TEA, TDAH, dificuldades de aprendizagem e orientação parental.

---

## Estrutura do Projeto

```text
.
├── index.html                                # Página Inicial
├── acompanhamento-neuropsicopedagogico.html  # Serviço: Acompanhamento
├── avaliacao-neuropsicopedagogica.html       # Serviço: Avaliação
├── orientacao-parental-inclusao-escolar.html # Serviço: Orientação e Inclusão
├── politica-de-privacidade.html              # Política de Privacidade
├── 404.html                                  # Página de Erro 404
├── _headers                                  # Cabeçalhos Cloudflare (noindex *.pages.dev, cache)
├── robots.txt                                # Diretivas para rastreadores
├── sitemap.xml                               # Mapa do site para motores de busca
├── site.webmanifest                          # Configuração PWA e ícones
├── favicon.ico                               # Favicon padrão
└── assets/
    ├── css/                                  # Estilos (fonts.css, main.css, premium.css)
    ├── js/                                   # Scripts e módulos de animação GSAP
    ├── fonts/                                # Tipografia local WOFF2 (Lora e Manrope)
    ├── img/                                  # Imagens organizadas (consultorio, favicons, logos, profissionais)
    └── videos/                               # Vídeo do hero (MP4 e poster WebP)
```

---

## Como Executar o Site

O site é estático (HTML5, CSS3 e JavaScript nativo com GSAP/ScrollTrigger via CDN). Não requer etapas de compilação ou dependências do Node.js.

### Opção 1: Servidor Local com URLs limpas (igual ao Cloudflare Pages)
Os links internos usam URLs limpas (`/avaliacao-neuropsicopedagogica`), como o Cloudflare Pages serve em produção.
```bash
# Na raiz do projeto:
npx serve .
```
Acesse em: `http://localhost:3000`

### Opção 2: VS Code Live Server / Extensões
Abra a pasta no VS Code e clique em **Go Live** no canto inferior direito.

### Opção 3: Hospedagem em Produção
Faça o deploy direto em qualquer provedor de hospedagem estática (Vercel, Netlify, Cloudflare Pages, GitHub Pages ou servidor Apache/Nginx).

