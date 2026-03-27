# UNINOVARE — Documentacao Tecnica Completa (v2.0)

**Data:** Março de 2026
**Domínio:** uninovare.com.br
**Repositório:** github.com/JPauloSantos/uninovare-site (privado)
**VPS UNINOVARE:** 187.77.33.115 (Hostinger KVM 2)
**VPS ESGP:** 187.77.52.115 (outro VPS, não mexer)

---

## SUMARIO

1. [Visão Geral](#1-visao-geral)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Como o Site foi Construído](#3-como-o-site-foi-construido)
4. [Onde Mexer no Código](#4-onde-mexer-no-codigo)
5. [Sistema Admin (Gestão de Cursos)](#5-sistema-admin)
6. [SEO e Indexação](#6-seo-e-indexacao)
7. [Infraestrutura e Deploy](#7-infraestrutura-e-deploy)
8. [Manutenção e Troubleshooting](#8-manutencao-e-troubleshooting)
9. [Credenciais e Acessos](#9-credenciais-e-acessos)
10. [Histórico de Versões](#10-historico-de-versoes)

---

## 1. VISAO GERAL

O site da UNINOVARE é um site institucional multi-página para a empresa de treinamento, cursos e consultoria em Campina Grande/PB.

### O que mudou (v1.0 → v2.0)

| Aspecto | v1.0 (anterior) | v2.0 (atual) |
|---------|-----------------|--------------|
| Estrutura | One-page (1 HTML) | Multi-página (7 páginas + admin) |
| Fontes | Baloo 2 + Merriweather | Baloo 2 + Open Sans |
| Cursos | Lista estática no HTML | Sistema dinâmico via JSON + Admin web |
| Administração | Edição manual do HTML | Painel web com login em uninovare.com.br/admin |
| SEO | Básico | Completo (robots.txt, sitemap, JSON-LD, Open Graph) |
| Navegação | Âncoras internas | Páginas separadas + Portal Acadêmico |
| Deploy | FileZilla manual | Script Python automatizado |

### Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| HTML5 | Estrutura semântica |
| CSS3 | Estilos, layout responsivo |
| JavaScript (Vanilla) | Interatividade no frontend |
| Node.js + Express | Backend do painel admin |
| JSON | Banco de dados dos cursos |
| pm2 | Gerenciador de processos (admin) |
| Nginx | Servidor web + proxy reverso |
| Let's Encrypt | Certificado SSL (HTTPS) |
| Google Fonts | Baloo 2 (títulos) + Open Sans (corpo) |

---

## 2. ESTRUTURA DE ARQUIVOS

### No seu computador (repositório Git)

```
PROJETO SITE UNINOVARE/
├── .gitignore
├── DOCS.md                    ← ESTE ARQUIVO
├── GUIA-PASSO-A-PASSO.md     ← Guia de como o site foi construído
├── deploy.py                  ← Script de deploy automático
│
├── site/                      ← ARQUIVOS DO SITE (vão para o servidor)
│   ├── index.html             ← Página Home
│   ├── quem-somos.html        ← Quem Somos
│   ├── cursos.html            ← Listagem de cursos
│   ├── curso.html             ← Ficha individual do curso
│   ├── solucoes.html          ← Soluções Educacionais
│   ├── contato.html           ← Contato
│   ├── admin.html             ← (legado, não usado mais)
│   ├── robots.txt             ← Regras para robôs de busca
│   ├── sitemap.xml            ← Mapa do site
│   ├── css/
│   │   ├── global.css         ← Estilos globais (todos usam)
│   │   ├── home.css           ← Estilos só da Home
│   │   ├── cursos.css         ← Estilos de listagem/ficha
│   │   ├── quem-somos.css     ← Estilos Quem Somos
│   │   ├── solucoes.css       ← Estilos Soluções
│   │   └── admin.css          ← (legado)
│   ├── js/
│   │   ├── global.js          ← Menu, scroll reveal, form WhatsApp
│   │   ├── carousel.js        ← Carrossel reutilizável
│   │   ├── cursos.js          ← Listagem com filtro (cursos.html)
│   │   ├── curso-detalhe.js   ← Ficha individual (curso.html)
│   │   └── admin.js           ← (legado)
│   ├── data/
│   │   └── cursos.json        ← BANCO DE DADOS DOS CURSOS
│   └── assets/
│       ├── logos/             ← logo-horizontal.jpg, logo-vertical.jpg, logo-circular.jpg
│       ├── banners/           ← banner-npp.png (banner do topo)
│       ├── cursos/            ← Capas dos cursos (aba.jpg, tcc.jpg, etc.)
│       ├── professores/       ← Fotos dos professores (a adicionar)
│       ├── equipe/            ← ceo-milena.jpg
│       └── gallery/           ← turma-01.jpg a turma-12.jpg
│
├── admin-server/              ← BACKEND DO PAINEL ADMIN
│   ├── package.json
│   └── server.js              ← Servidor Express (login, CRUD, upload)
│
└── uninovare-site-working-no-identidade/  ← Site antigo (v1.0, referência)
```

### No servidor VPS (187.77.33.115)

```
/var/www/uninovare/            ← Site público (conteúdo da pasta site/)
/var/www/uninovare-admin/      ← Backend admin (conteúdo de admin-server/)
/var/www/uninovare-backup-*.tar.gz  ← Backups do site anterior
/etc/nginx/sites-available/uninovare  ← Config do Nginx
/etc/letsencrypt/live/uninovare.com.br/  ← Certificados SSL
```

---

## 3. COMO O SITE FOI CONSTRUIDO

### Passo 1 — Fundação (CSS Global + Tipografia)

**Arquivo:** `site/css/global.css`

Criamos o CSS global com:
- **Variáveis CSS** (`:root`) para cores, sombras, border-radius
- **Paleta:** `--primary: #3A7D44` (verde), `--accent: #FFC857` (amarelo), `--sand: #F3E9D2` (fundo), `--ink: #1f2a2e` (texto)
- **Tipografia:** Baloo 2 para títulos, Open Sans para corpo
- **Componentes reutilizáveis:** `.btn`, `.card`, `.pill`, `.section`, `.grid`, `.carousel`, `.gallery`, `.form`
- **Responsivo:** breakpoints em 900px, 740px, 480px
- **Acessibilidade:** skip link, focus states, prefers-reduced-motion

**Se quiser mudar cores:** edite as variáveis no `:root` de `global.css` (linhas 1-20).
**Se quiser mudar fontes:** edite o import do Google Fonts no `<head>` de cada HTML e o `font-family` no `global.css`.

### Passo 2 — Navegação (Header compartilhado)

**Onde:** Cada arquivo HTML contém o header no topo (não é componente, é copiado).

A navegação tem:
- Logo (link para index.html)
- Ícones sociais (Instagram, LinkedIn, Facebook)
- Links: Home, Quem Somos, Nossos Cursos, Soluções Educacionais, Contato
- Botão Portal Acadêmico (link externo para SIAF360)
- Menu hamburguer no mobile

**Se quiser adicionar um link no menu:** edite o `<nav id="menu">` em TODOS os 6 HTMLs.
**Se quiser mudar o link do Portal:** busque `siaf360` nos HTMLs.

### Passo 3 — Página Home (index.html)

**Arquivos:** `site/index.html` + `site/css/home.css`

Seções da Home (na ordem):
1. **Banner** — Imagem full-width no topo (`assets/banners/banner-npp.png`), barra com texto + botão CTA
2. **Hero** — Grid 2 colunas: texto à esquerda, card UNINOVARE à direita com badge "Campina Grande"
3. **Por que escolher** — Grid 4 cards com ícones SVG e diferenciais
4. **Cursos em destaque** — Carrossel horizontal com 7 cursos hardcoded no HTML
5. **Depoimentos** — Grid 2 colunas com 5 depoimentos
6. **Galeria** — Grid de 12 fotos de turmas
7. **Footer** — Logo, links, contato, copyright

**Se quiser trocar o banner:** substitua `assets/banners/banner-npp.png` e edite o texto na `<div class="heroBanner__bar">`.
**Se quiser mudar cursos do carrossel:** edite os `<article>` dentro de `#cursosTrack` no `index.html`.
**Se quiser mudar depoimentos:** edite os `<article>` na seção `#depoimentos`.

### Passo 4 — Página Quem Somos (quem-somos.html)

**Arquivos:** `site/quem-somos.html` + `site/css/quem-somos.css`

Seções:
1. Hero com apresentação institucional
2. Missão, Visão e Valores (3 cards)
3. Equipe (Milena, Lícea, Myrna) — Lícea e Myrna têm placeholder, substituir por fotos reais
4. Parceiros institucionais

**Se quiser adicionar membro à equipe:** copie um `<article class="card card--equipe">` e edite nome/cargo/foto.
**Se quiser mudar Missão/Visão/Valores:** edite o texto diretamente nos cards `.mvv-card`.

### Passo 5 — Sistema de Cursos (cursos.json + cursos.html + curso.html)

**Banco de dados:** `site/data/cursos.json`
**Listagem:** `site/cursos.html` + `site/js/cursos.js`
**Ficha individual:** `site/curso.html` + `site/js/curso-detalhe.js`
**CSS:** `site/css/cursos.css`

Cada curso no JSON tem esta estrutura:
```json
{
  "id": "slug-unico",
  "nome": "Nome do Curso",
  "categoria": "Psicologia|Educação|Saúde|Gestão|Comunicação",
  "nivel": "Especialização|MBA|Mestrado|Doutorado",
  "capa": "assets/cursos/arquivo.jpg",
  "descricao": "Descrição completa",
  "diferencial": "Frase curta",
  "objetivo": "Objetivo do curso",
  "publicoAlvo": "Para quem é",
  "cargaHoraria": "360 h/a",
  "duracao": "15 meses",
  "coordenador": { "nome": "Nome", "fone": "" },
  "professores": [
    { "foto": "", "nome": "", "miniCurriculo": "", "titulacao": "" }
  ],
  "matrizCurricular": "",
  "valor": "",
  "contatoInscricao": "",
  "linkCadastro": "",
  "destaque": true
}
```

**Regra fundamental:** Campos vazios (`""`, `[]`) NÃO aparecem na ficha do curso. Preencha conforme necessário.

**Se quiser adicionar/editar cursos:** Use o painel admin (uninovare.com.br/admin) — é a forma mais fácil.
**Se quiser editar manualmente:** Edite `site/data/cursos.json` e faça deploy.

### Passo 6 — Soluções Educacionais (solucoes.html)

**Arquivos:** `site/solucoes.html` + `site/css/solucoes.css`

Cards de serviços:
- Pós-Graduações Presenciais (link para cursos.html)
- Cursos de Formação e Treinamentos
- Mestrados e Doutorados (Programas Internacionais)
- Tecnólogo Superior EAD (Em breve)
- Graduações EAD (Em breve)

**Se quiser ativar EAD/Graduações:** remova a classe disabled do botão e mude o texto "Em breve".

### Passo 7 — Contato (contato.html)

**Arquivo:** `site/contato.html`

Formulário que envia para WhatsApp (sem backend). O JS está em `global.js` (busca por `#contactForm`).

**Se quiser mudar o número do WhatsApp:** busque `558396865555` em TODOS os arquivos HTML e JS.

### Passo 8 — Painel Admin (admin-server/)

**Arquivo principal:** `admin-server/server.js`

Backend Express.js que:
- Roda na porta 3055
- Login com sessão
- API REST para cursos (GET/POST/DELETE)
- Edita `cursos.json` diretamente no servidor
- Acessível em uninovare.com.br/admin

Detalhes completos na seção 5.

### Passo 9 — SEO

Em cada HTML:
- Meta tags (description, keywords, author, robots)
- Open Graph (Facebook, WhatsApp, LinkedIn)
- Twitter Cards
- JSON-LD (dados estruturados para Google)
- Canonical URL

Arquivos globais: `robots.txt` e `sitemap.xml`

### Passo 10 — Deploy

O deploy envia os arquivos de `site/` para `/var/www/uninovare/` no VPS via SFTP (script `deploy.py`).

---

## 4. ONDE MEXER NO CODIGO

### Guia rápido por tarefa

| Quero... | Arquivo(s) a editar |
|----------|-------------------|
| Mudar cores do site | `site/css/global.css` (variáveis `:root`) |
| Mudar fontes | `site/css/global.css` + `<head>` dos HTMLs |
| Trocar banner da home | `site/assets/banners/` + `site/index.html` (seção heroBanner) |
| Trocar logo | `site/assets/logos/` (manter mesmo nome) |
| Editar texto da home | `site/index.html` |
| Editar Quem Somos | `site/quem-somos.html` |
| Editar Missão/Visão/Valores | `site/quem-somos.html` (seção mvv) |
| Adicionar membro à equipe | `site/quem-somos.html` (copiar card equipe) |
| Adicionar foto de equipe | `site/assets/equipe/` + editar HTML |
| Adicionar/editar curso | **Usar o admin:** uninovare.com.br/admin |
| Editar curso manualmente | `site/data/cursos.json` |
| Mudar cursos do carrossel (home) | `site/index.html` (seção #cursosTrack) |
| Adicionar depoimento | `site/index.html` (seção #depoimentos) |
| Trocar fotos da galeria | `site/assets/gallery/` (manter nomes turma-XX.jpg) |
| Adicionar foto à galeria | `site/assets/gallery/` + editar `index.html` |
| Mudar número WhatsApp | Buscar `558396865555` em todos os arquivos |
| Mudar endereço | Buscar "Cirne Center" nos HTMLs |
| Mudar link Portal Acadêmico | Buscar `siaf360` nos HTMLs |
| Ativar EAD/Graduações | `site/solucoes.html` (remover disabled) |
| Mudar credenciais do admin | `admin-server/server.js` (ADMIN_USER, ADMIN_PASS) |
| Adicionar página nova | Criar HTML, copiar header/footer de outro, add no nav |

### Estrutura CSS (o que cada arquivo faz)

| Arquivo | Escopo | O que contém |
|---------|--------|-------------|
| `global.css` | Todas as páginas | Reset, variáveis, tipografia, botões, cards, pills, grids, carrossel, galeria, formulários, footer, responsivo |
| `home.css` | Só index.html | Banner hero, hero grid, seção "por que escolher", depoimentos, galeria estilo álbum |
| `cursos.css` | cursos.html + curso.html | Filtros, cards de curso, ficha detalhada, professores |
| `quem-somos.css` | quem-somos.html | Missão/Visão/Valores, equipe, parceiros |
| `solucoes.css` | solucoes.html | Cards de serviços, badges "em breve" |

### Estrutura JS (o que cada arquivo faz)

| Arquivo | Escopo | O que faz |
|---------|--------|----------|
| `global.js` | Todas as páginas | Menu mobile, active nav link, scroll reveal, form WhatsApp, ano no footer |
| `carousel.js` | Páginas com carrossel | Fábrica `makeCarousel()` — auto-play, dots, navegação |
| `cursos.js` | cursos.html | Fetch cursos.json, renderiza grid, filtro por categoria |
| `curso-detalhe.js` | curso.html | Fetch cursos.json, renderiza ficha com campos condicionais |

---

## 5. SISTEMA ADMIN

### Acesso

**URL:** https://uninovare.com.br/admin
**Usuário:** admin
**Senha:** uninovare2026

### Como funciona

1. O admin é um servidor Node.js/Express rodando na porta 3055
2. O Nginx faz proxy: `/admin` e `/api` → porta 3055
3. Login cria uma sessão (cookie) que dura 4 horas
4. As operações leem/escrevem diretamente no `/var/www/uninovare/data/cursos.json`
5. Alterações refletem imediatamente no site público

### API Endpoints

| Método | Rota | O que faz |
|--------|------|----------|
| POST | /api/login | Login (body: {usuario, senha}) |
| POST | /api/logout | Logout |
| GET | /api/cursos | Listar todos os cursos |
| POST | /api/cursos | Criar ou atualizar curso |
| DELETE | /api/cursos/:id | Excluir curso |
| POST | /api/upload | Upload de imagem |

### Arquitetura

```
Browser → HTTPS → Nginx (443) → proxy_pass → Express (3055)
                              → static files → /var/www/uninovare/
```

### Mudar credenciais

Edite `admin-server/server.js`:
```javascript
const ADMIN_USER = 'admin';      // Linha 16
const ADMIN_PASS = 'uninovare2026';  // Linha 17
```
Depois faça deploy do admin (enviar server.js e `pm2 restart uninovare-admin`).

### Reiniciar o admin

```bash
ssh root@187.77.33.115
pm2 restart uninovare-admin
pm2 logs uninovare-admin
```

---

## 6. SEO E INDEXACAO

### robots.txt
- Permite indexação de todas as páginas
- Bloqueia `/admin`
- Aponta para sitemap.xml

### sitemap.xml
- 6 páginas públicas com lastmod, changefreq e priority

### Meta Tags (todas as páginas)
- `description` — descrição única por página
- `keywords` — palavras-chave
- `canonical` — URL canônica
- Open Graph (og:title, og:description, og:image, og:url)
- Twitter Cards
- JSON-LD (Organization, EducationalOrganization, LocalBusiness, Course)

### HTML Semântico
- `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`
- ARIA labels, roles, aria-expanded
- `loading="lazy"` em imagens fora do viewport
- `preconnect` para Google Fonts

---

## 7. INFRAESTRUTURA E DEPLOY

### Servidor

| Item | Valor |
|------|-------|
| IP | 187.77.33.115 |
| SO | Ubuntu 24.04 LTS |
| Web Server | Nginx 1.24 |
| SSL | Let's Encrypt (renovação automática) |
| Node.js | v20.20.1 |
| pm2 | Gerenciador de processos |
| SSH | `ssh root@187.77.33.115` |

### Nginx Config

Arquivo: `/etc/nginx/sites-available/uninovare`

```nginx
server {
    server_name uninovare.com.br www.uninovare.com.br;
    root /var/www/uninovare;
    index index.html;

    # Admin panel → Node.js
    location /admin { proxy_pass http://127.0.0.1:3055; ... }
    location /api   { proxy_pass http://127.0.0.1:3055; ... }

    # Site estático
    location / { try_files $uri $uri/ =404; }

    # SSL (Certbot)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/uninovare.com.br/fullchain.pem;
    ...
}
```

### Como fazer deploy do SITE

**Opção 1 — Script automático:**
```bash
python deploy.py
```
(Envia `site/` para `/var/www/uninovare/` via SFTP)

**Opção 2 — Manual via FileZilla:**
- Host: sftp://187.77.33.115
- Usuário: root
- Porta: 22
- Enviar conteúdo de `site/` para `/var/www/uninovare/`

### Como fazer deploy do ADMIN

```bash
# No seu computador:
scp admin-server/server.js root@187.77.33.115:/var/www/uninovare-admin/

# No servidor:
ssh root@187.77.33.115
pm2 restart uninovare-admin
```

### Processos pm2

```bash
pm2 list                     # Ver processos
pm2 restart uninovare-admin  # Reiniciar admin
pm2 logs uninovare-admin     # Ver logs
pm2 save                     # Salvar lista de processos
```

---

## 8. MANUTENCAO E TROUBLESHOOTING

### Checklist mensal

- [ ] Site acessível via HTTPS (https://uninovare.com.br)
- [ ] Certificado SSL válido (`certbot certificates`)
- [ ] Nginx rodando (`systemctl status nginx`)
- [ ] Admin rodando (`pm2 list`)
- [ ] Links do WhatsApp funcionando
- [ ] Banner atualizado

### Trocar o banner

1. Criar imagem (min 1200px largura, JPG ou PNG)
2. Salvar em `site/assets/banners/` como `banner-NOME.png`
3. Editar `site/index.html` — trocar o `src` na tag `<img>` da seção `.heroBanner`
4. Editar o texto na `<div class="heroBanner__bar">`
5. Fazer deploy

### Atualizar fotos da galeria

1. Salvar fotos como `turma-XX.jpg` em `site/assets/gallery/`
2. Fazer deploy (as fotos com mesmo nome são substituídas)

### Adicionar foto da equipe

1. Salvar foto em `site/assets/equipe/` (ex: `licea-araujo.jpg`)
2. Editar `site/quem-somos.html` — trocar o `<div class="equipe__photo-placeholder">` por `<img src="assets/equipe/licea-araujo.jpg">`
3. Fazer deploy

### Site fora do ar

```bash
ssh root@187.77.33.115
systemctl status nginx      # Verificar Nginx
systemctl restart nginx     # Reiniciar
nginx -t                    # Testar config
pm2 list                    # Verificar admin
pm2 restart all             # Reiniciar tudo
```

### SSL expirado

```bash
certbot certificates        # Verificar validade
certbot renew               # Renovar
systemctl reload nginx      # Aplicar
```

### Admin não funciona

```bash
pm2 logs uninovare-admin --lines 30   # Ver erros
pm2 restart uninovare-admin            # Reiniciar
node /var/www/uninovare-admin/server.js  # Testar manual
```

---

## 9. CREDENCIAIS E ACESSOS

| Serviço | Acesso |
|---------|--------|
| **VPS SSH** | `ssh root@187.77.33.115` / senha: (consultar) |
| **Admin do Site** | uninovare.com.br/admin / admin / uninovare2026 |
| **Portal Acadêmico** | app.siaf360.com.br/login/uninovare |
| **GitHub** | github.com/JPauloSantos/uninovare-site (privado) |
| **Hostinger** | hpanel.hostinger.com / jpsisan@gmail.com |
| **Registro.br** | registro.br / MACSO1637 |
| **WhatsApp** | (83) 9.9686-5555 |
| **Telefone** | (83) 3099-5333 |
| **Instagram** | @uninovare |
| **LinkedIn** | /company/uninovare |
| **Endereço** | Shopping Cirne Center, 2o andar, Centro, Campina Grande/PB |
| **Domínio expira** | 15 de agosto de 2027 |
| **SSL expira** | Renovação automática (Let's Encrypt) |

---

## 10. HISTORICO DE VERSOES

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Mar 2026 | Site one-page original |
| 2.0 | 27 Mar 2026 | Reestruturação completa: multi-página, sistema de cursos, admin web, SEO avançado |

### Commits principais

| Commit | Descrição |
|--------|-----------|
| `c4ee029` | feat: reestruturação completa v2.0 (48 arquivos) |
| `e6d0fb4` | fix: bugs de consistência HTML/JS |
| `ff8b5e3` | fix: correções visuais hero + Portal Acadêmico |
| `822b9a2` | fix: banner full-width centralizado |
| `59e7bcb` | fix: banner ponta a ponta sem espaços |
| `e921941` | feat: carrossel full-width |
| `4e6ab38` | fix: cursos em destaque hardcoded no HTML |
| `7ac0ab3` | feat: sistema admin web Node.js/Express |
| `519aae5` | fix: SyntaxError no JS do admin |

---

*Documento atualizado em 27 de março de 2026.*
