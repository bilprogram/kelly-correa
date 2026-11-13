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
├── acompanhamento-neuropsicopedagogico/      # Rota clean-URL (index.html)
├── avaliacao-neuropsicopedagogica/           # Rota clean-URL (index.html)
├── orientacao-parental-inclusao-escolar/     # Rota clean-URL (index.html)
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

### Opção 1: Servidor Local via Python
```bash
# Na raiz do projeto:
python3 -m http.server 8000
```
Acesse em: `http://localhost:8000`

### Opção 2: VS Code Live Server / Extensões
Abra a pasta no VS Code e clique em **Go Live** no canto inferior direito.

### Opção 3: Hospedagem em Produção
Faça o deploy direto em qualquer provedor de hospedagem estática (Vercel, Netlify, Cloudflare Pages, GitHub Pages ou servidor Apache/Nginx).

