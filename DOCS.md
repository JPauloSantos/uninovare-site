# UNINOVARE — Documentacao Tecnica Completa (v2.1)

**Data:** 06 de Abril de 2026
**Dominio:** uninovare.com.br
**Repositorio:** github.com/JPauloSantos/uninovare-site (privado)
**VPS UNINOVARE:** 187.77.33.115 (Hostinger KVM 2)
**VPS ESGP:** 187.77.52.115 (outro VPS, nao mexer)

---

## SUMARIO

1. [Classificacao do Projeto](#1-classificacao-do-projeto)
2. [Mapa do Site](#2-mapa-do-site)
3. [Visao Geral](#3-visao-geral)
4. [Estrutura de Arquivos](#4-estrutura-de-arquivos)
5. [Como o Site foi Construido (Passo a Passo)](#5-como-o-site-foi-construido)
6. [Onde Mexer no Codigo](#6-onde-mexer-no-codigo)
7. [Sistema Admin (Gestao de Cursos)](#7-sistema-admin)
8. [SEO e Indexacao](#8-seo-e-indexacao)
9. [Infraestrutura e Deploy](#9-infraestrutura-e-deploy)
10. [Manutencao e Troubleshooting](#10-manutencao-e-troubleshooting)
11. [Credenciais e Acessos](#11-credenciais-e-acessos)
12. [Historico de Versoes](#12-historico-de-versoes)

---

## 1. CLASSIFICACAO DO PROJETO

### Tipo: Site Institucional com CMS Headless Leve

O projeto UNINOVARE se classifica como:

| Aspecto | Classificacao |
|---------|--------------|
| **Tipo de aplicacao** | Site institucional + Web App administrativo |
| **Arquitetura** | JAMstack simplificado (HTML estatico + API JSON + Admin Node.js) |
| **Frontend** | Site estatico multi-pagina (SSG-like sem build step) |
| **Backend** | Micro-API REST (Node.js/Express) para gestao de conteudo |
| **Banco de dados** | Arquivo JSON flat-file (cursos.json) |
| **CMS** | CMS headless proprio (admin web com login) |
| **Hospedagem** | VPS auto-gerenciado (Nginx + pm2) |
| **Categoria comercial** | Site institucional educacional com catalogo de cursos |

### Por que essa arquitetura?

| Vantagem | Explicacao |
|----------|-----------|
| **Performance** | Paginas HTML estaticas = carregamento instantaneo, sem SSR |
| **Zero dependencias no frontend** | Sem React, Vue, frameworks — HTML/CSS/JS puros |
| **SEO nativo** | HTML semantico renderizado no servidor, indexacao perfeita |
| **Facil manutencao** | Editar HTML diretamente ou usar o admin web |
| **Custo zero** | Sem banco de dados pago, sem hospedagem especial |
| **Seguranca** | Superficie de ataque minima (arquivos estaticos + 1 micro-API) |
| **Autonomia** | Cursos gerenciados pelo admin web sem necessidade de desenvolvedor |

### Comparacao com outras abordagens

| Abordagem | Pros | Contras | UNINOVARE usa? |
|-----------|------|---------|----------------|
| WordPress | CMS completo, plugins | Lento, vulneravel, hosting especifico | Nao |
| React SPA | Dinamico, moderno | SEO ruim, complexidade alta | Nao |
| Next.js | SSR + API | Complexo, build step, Node.js obrigatorio | Nao |
| HTML estatico puro | Rapido, simples | Dificil de manter cursos | Parcialmente |
| **HTML + JSON + Admin API** | **Rapido, SEO, editavel, simples** | **Sem features avancadas** | **Sim** |

---

## 2. MAPA DO SITE

### Mapa Visual

```
uninovare.com.br
|
|-- / (HOME)
|   |-- Banner principal (full-width, arte institucional)
|   |-- Hero (apresentacao + card logo)
|   |-- Por que escolher a UNINOVARE (4 diferenciais)
|   |-- Cursos em Destaque (carrossel 7 cursos)
|   |-- Depoimentos (grid 2 colunas, 5 alunos)
|   |-- Galeria de Turmas (12 fotos)
|   +-- Footer (links, contato, social)
|
|-- /quem-somos.html (QUEM SOMOS)
|   |-- Hero centralizado
|   |-- Missao, Visao e Valores (3 cards, checkmarks)
|   |-- Nossa Equipe (Milena, Licea, Myrna)
|   +-- Parceiros Institucionais (UNICORP, Sapiencia)
|
|-- /cursos.html (NOSSOS CURSOS)
|   |-- Filtro por categoria e busca
|   |-- Grid de cursos (carregado de cursos.json)
|   +-- 26 cursos em 5 categorias
|       |
|       +-- /curso.html?id=SLUG (FICHA DO CURSO)
|           |-- Imagem de capa (arte completa, sem corte)
|           |-- Titulo + categoria + nivel
|           |-- Objetivo (condicional)
|           |-- Descricao
|           |-- Diferencial (condicional)
|           |-- Publico-alvo (condicional)
|           |-- Carga horaria + Duracao
|           |-- Coordenador (condicional)
|           |-- Corpo Docente (condicional, dinamico)
|           |-- Matriz Curricular (condicional)
|           |-- Valor (condicional)
|           |-- Contato inscricao (condicional)
|           |-- Link cadastro (condicional)
|           +-- CTA WhatsApp
|
|-- /solucoes.html (SOLUCOES EDUCACIONAIS)
|   |-- Pos-Graduacoes Presenciais → cursos.html
|   |-- Cursos de Formacao e Treinamentos
|   |-- Mestrados e Doutorados (Internacionais)
|   |-- Tecnologo Superior EAD (em breve)
|   +-- Graduacoes EAD (em breve)
|
|-- /contato.html (CONTATO)
|   |-- Formulario → WhatsApp
|   |-- Informacoes (telefone, endereco, redes)
|   +-- Google Maps
|
|-- /admin (PAINEL ADMINISTRATIVO) [requer login]
|   |-- Login (usuario/senha)
|   |-- Listagem de cursos (busca, filtros)
|   |-- CRUD de cursos (criar, editar, excluir)
|   |-- Upload de imagens (JPG, PNG, WebP)
|   +-- Professores dinamicos
|
|-- /robots.txt (regras para bots)
|-- /sitemap.xml (mapa para buscadores)
|
+-- LINKS EXTERNOS
    |-- wa.me/558396865555 (WhatsApp)
    |-- instagram.com/uninovare
    |-- linkedin.com/company/uninovare
    +-- app.siaf360.com.br/login/uninovare (Portal Academico)
```

### Fluxo de Navegacao

```
                    +------------------+
                    |    VISITANTE     |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
         +----v----+   +----v----+   +-----v-----+
         |  HOME   |   | CURSOS  |   |  CONTATO  |
         +---------+   +----+----+   +-----------+
              |              |              |
              |         +----v----+         |
              |         |  FICHA  |         |
              |         |  CURSO  |         |
              |         +----+----+         |
              |              |              |
              +--------------+--------------+
                             |
                      +------v------+
                      |  WHATSAPP   |
                      |  (matricula)|
                      +-------------+


                    +------------------+
                    | ADMINISTRADOR    |
                    +--------+---------+
                             |
                      +------v------+
                      |   /admin    |
                      |   LOGIN     |
                      +------+------+
                             |
                      +------v------+
                      |   PAINEL    |
                      |   CURSOS    |
                      +------+------+
                        |    |    |
                   +----+ +--+--+ +----+
                   |NOVO| |EDIT | |DEL |
                   +----+ +-----+ +----+
                             |
                      +------v------+
                      | cursos.json |
                      | (atualizado)|
                      +------+------+
                             |
                      +------v------+
                      | SITE PUBLICO|
                      | (atualizado)|
                      +-------------+
```

### Categorias de Cursos (26 total)

| Categoria | Qtd | Cursos |
|-----------|-----|--------|
| **Psicologia** | 8 | ABA, Neuropsicologia, Psicologia Clinica e Hospitalar, TCC, Avaliacao Psicologica, Clinica Psicanalitica, Saude Mental, Neurociencia e Comportamento |
| **Educacao** | 9 | Neuropsicopedagogia, AEE, TDAH, Neurociencia Infantil, Ed. Inclusiva e Tec. Assistiva, TEA e TGD, Neurociencia e Psicomotricidade, Gestao Escolar, Neuroeducacao |
| **Saude** | 3 | Cuidados Paliativos, Oncologia, Gerontologia |
| **Gestao** | 5 | MBA Saude Publica, MBA Projetos Sociais, MBA Gestao Publica, MBA Gestao de Pessoas, MBA Legislacao Trabalhista |
| **Comunicacao** | 1 | MBA Producao de Conteudo para Midias Digitais |

---

## 3. VISAO GERAL

### O que mudou (v1.0 → v2.1)

| Aspecto | v1.0 (anterior) | v2.1 (atual) |
|---------|-----------------|--------------|
| Estrutura | One-page (1 HTML) | Multi-pagina (7 paginas + admin web) |
| Fontes | Baloo 2 + Merriweather | Baloo 2 + Open Sans |
| Cursos | Lista estatica no HTML | 26 cursos dinamicos via JSON + Admin web |
| Administracao | Edicao manual do HTML | Painel web com login, busca, filtros, upload |
| SEO | Basico | Completo (robots, sitemap, JSON-LD, Open Graph) |
| Navegacao | Ancoras internas | Paginas separadas + Portal Academico |
| Banner | Imagem generica | Arte institucional personalizada |
| Artes cursos | Fotos genericas JPG | 7 artes profissionais PNG (1200x675) |
| Valores | Lista simples | Checkmarks verdes em circulo |
| Deploy | FileZilla manual | Script Python automatizado |

### Stack Tecnica

| Camada | Tecnologia | Arquivo(s) |
|--------|-----------|------------|
| Markup | HTML5 semantico | *.html |
| Estilo | CSS3 (variaveis, grid, flexbox) | css/*.css |
| Interatividade | JavaScript Vanilla (ES6) | js/*.js |
| Dados | JSON flat-file | data/cursos.json |
| Admin Backend | Node.js 20 + Express 4 | admin-server/server.js |
| Processo | pm2 | Gerencia o admin |
| Web Server | Nginx 1.24 | /etc/nginx/sites-available/uninovare |
| SSL | Let's Encrypt (Certbot) | Renovacao automatica |
| Versionamento | Git + GitHub | github.com/JPauloSantos/uninovare-site |

---

## 4. ESTRUTURA DE ARQUIVOS

### Computador local (repositorio Git)

```
PROJETO SITE UNINOVARE/
├── .gitignore
├── DOCS.md                         ← ESTE ARQUIVO
├── deploy.py                       ← Script de deploy automatico
├── gerar-pdf.py                    ← Gera PDF da documentacao
├── UNINOVARE-Documentacao-Tecnica-v2.pdf
│
├── site/                           ← SITE PUBLICO (vai para o servidor)
│   ├── index.html                  ← Home
│   ├── quem-somos.html             ← Quem Somos
│   ├── cursos.html                 ← Listagem de cursos
│   ├── curso.html                  ← Ficha individual (?id=slug)
│   ├── solucoes.html               ← Solucoes Educacionais
│   ├── contato.html                ← Contato
│   ├── robots.txt                  ← Regras para bots
│   ├── sitemap.xml                 ← Mapa do site
│   ├── css/
│   │   ├── global.css              ← Estilos globais (TODOS usam)
│   │   ├── home.css                ← So da Home
│   │   ├── cursos.css              ← Listagem + ficha curso
│   │   ├── quem-somos.css          ← So Quem Somos
│   │   └── solucoes.css            ← So Solucoes
│   ├── js/
│   │   ├── global.js               ← Menu, reveal, WhatsApp form
│   │   ├── carousel.js             ← Fabrica de carrossel
│   │   ├── cursos.js               ← Listagem com filtro
│   │   └── curso-detalhe.js        ← Ficha individual
│   ├── data/
│   │   └── cursos.json             ← BANCO DE DADOS (26 cursos)
│   └── assets/
│       ├── logos/                   ← 3 logos (horizontal, vertical, circular)
│       ├── banners/                 ← Banner institucional principal
│       ├── cursos/                  ← 7 artes PNG + JPGs antigos
│       ├── professores/            ← Fotos professores (a adicionar)
│       ├── equipe/                 ← ceo-milena.jpg
│       └── gallery/                ← 12 fotos de turmas
│
└── admin-server/                   ← BACKEND ADMIN
    ├── package.json
    └── server.js                   ← Express: login, CRUD, upload
```

### Servidor VPS (187.77.33.115)

```
/var/www/uninovare/                 ← Site publico
/var/www/uninovare-admin/           ← Backend admin (Node.js)
/var/www/uninovare-backup-*.tar.gz  ← Backups
/etc/nginx/sites-available/uninovare ← Config Nginx
/etc/letsencrypt/live/uninovare.com.br/ ← Certificados SSL
```

---

## 5. COMO O SITE FOI CONSTRUIDO

### Passo 1 — Fundacao (CSS Global)
**Arquivo:** `site/css/global.css`
- Variaveis CSS: cores, sombras, border-radius, container
- Paleta: verde (#3A7D44), amarelo (#FFC857), areia (#F3E9D2)
- Tipografia: Baloo 2 (titulos) + Open Sans (corpo)
- Componentes: .btn, .card, .pill, .section, .grid, .carousel, .gallery, .form
- Responsivo: 900px, 740px, 480px
- Acessibilidade: skip link, ARIA, prefers-reduced-motion

### Passo 2 — Navegacao (Header)
**Onde:** Topo de cada HTML (copiado, nao e componente)
- Logo, icones sociais, menu (Home, Quem Somos, Cursos, Solucoes, Contato)
- Botao Portal Academico (SIAF360)
- Menu hamburger no mobile

### Passo 3 — Home (index.html + home.css)
- Banner full-width ponta a ponta (arte institucional)
- Hero 2 colunas (texto + card UNINOVARE + badge Campina Grande)
- 4 cards de diferenciais
- Carrossel 7 cursos em destaque (hardcoded no HTML)
- 5 depoimentos em grid 2 colunas
- Galeria 12 fotos

### Passo 4 — Quem Somos (quem-somos.html + quem-somos.css)
- Hero centralizado
- Missao/Visao/Valores com checkmarks verdes
- Equipe: Milena (foto), Licea e Myrna (placeholders)
- Parceiros: UNICORP Faculdades, Instituto Sapiencia PB

### Passo 5 — Sistema de Cursos (cursos.json + JS)
- 26 cursos em 5 categorias
- Listagem com filtro por categoria (cursos.html + cursos.js)
- Ficha individual com campos condicionais (curso.html + curso-detalhe.js)
- Imagens mostram arte completa sem corte

### Passo 6 — Solucoes (solucoes.html)
- 5 cards de servicos (pos, formacao, mestrados, EAD em breve)

### Passo 7 — Contato (contato.html)
- Formulario → WhatsApp (sem backend)
- Mapa Google Maps

### Passo 8 — Admin Web (admin-server/server.js)
- Node.js + Express na porta 3055
- Login com sessao, Nginx proxy em /admin
- CRUD de cursos, upload de imagens, busca/filtro
- Edita cursos.json diretamente no servidor

### Passo 9 — SEO
- robots.txt, sitemap.xml
- Meta tags, Open Graph, Twitter Cards, JSON-LD
- HTML5 semantico, ARIA labels

### Passo 10 — Deploy
- Script deploy.py (SFTP via paramiko)
- Backup automatico antes de sobrescrever

---

## 6. ONDE MEXER NO CODIGO

| Quero... | Arquivo(s) |
|----------|-----------|
| Mudar cores | `css/global.css` (variaveis `:root`, linhas 1-20) |
| Mudar fontes | `css/global.css` + `<head>` dos HTMLs |
| Trocar banner da home | `assets/banners/` + `index.html` (secao heroBanner) |
| Trocar logo | `assets/logos/` (manter mesmo nome) |
| Editar texto da home | `index.html` |
| Editar Quem Somos | `quem-somos.html` |
| Editar Missao/Visao/Valores | `quem-somos.html` (secao mvv) |
| Adicionar membro a equipe | `quem-somos.html` (copiar card equipe) |
| Adicionar/editar curso | **Admin web:** uninovare.com.br/admin |
| Editar curso manualmente | `data/cursos.json` |
| Mudar cursos do carrossel | `index.html` (secao #cursosTrack) |
| Adicionar depoimento | `index.html` (secao #depoimentos) |
| Trocar fotos da galeria | `assets/gallery/` (manter nomes turma-XX.jpg) |
| Mudar numero WhatsApp | Buscar `558396865555` em todos os arquivos |
| Mudar endereco | Buscar "Cirne Center" nos HTMLs |
| Mudar link Portal Academico | Buscar `siaf360` nos HTMLs |
| Ativar EAD/Graduacoes | `solucoes.html` (remover disabled) |
| Mudar credenciais admin | `admin-server/server.js` (linhas 16-17) |
| Adicionar pagina nova | Criar HTML, copiar header/footer, add no nav de TODOS |

### Mapa CSS

| Arquivo | Escopo | Conteudo |
|---------|--------|---------|
| `global.css` | Todas as paginas | Reset, variaveis, tipografia, botoes, cards, pills, grids, carrossel, galeria, forms, footer, responsivo, nav portal |
| `home.css` | index.html | Banner full-width, hero grid, diferenciais, depoimentos, galeria album |
| `cursos.css` | cursos.html + curso.html | Filtros, cards curso, ficha detalhada (imagem sem corte), professores |
| `quem-somos.css` | quem-somos.html | MVV (checkmarks), equipe (fotos/placeholders), parceiros |
| `solucoes.css` | solucoes.html | Cards servicos, badges "em breve" |

### Mapa JS

| Arquivo | Escopo | Funcao |
|---------|--------|--------|
| `global.js` | Todas as paginas | Menu mobile, active nav, scroll reveal, form WhatsApp, ano footer |
| `carousel.js` | Paginas com carrossel | Fabrica `makeCarousel()` — autoplay, dots, setas |
| `cursos.js` | cursos.html | Fetch cursos.json, grid, filtro categoria |
| `curso-detalhe.js` | curso.html | Fetch cursos.json, ficha com campos condicionais |

---

## 7. SISTEMA ADMIN

### Acesso
- **URL:** https://uninovare.com.br/admin
- **Usuario:** admin
- **Senha:** uninovare2026

### Funcionalidades
- Login com sessao (4h)
- Listagem agrupada por categoria com thumbnails
- **Busca por nome** (tempo real)
- **Filtro por nivel** (Especializacao, MBA, Mestrado, Doutorado)
- **Filtro por categoria** (Psicologia, Educacao, Saude, Gestao, Comunicacao)
- Criar, editar, excluir cursos
- **Upload de capa** (JPG, PNG, WebP) com preview
- **Remover imagem** de capa
- **Professores dinamicos** (adicionar/remover)
- Campos condicionais (vazios nao aparecem no site)
- Badge "Sem capa" e "Destaque"
- Alteracoes refletem imediatamente no site

### API Endpoints

| Metodo | Rota | Funcao |
|--------|------|--------|
| POST | /api/login | Login |
| POST | /api/logout | Logout |
| GET | /api/cursos | Listar cursos |
| POST | /api/cursos | Criar/atualizar curso |
| DELETE | /api/cursos/:id | Excluir curso |
| POST | /api/upload | Upload de imagem |

### Arquitetura

```
Navegador → HTTPS (443) → Nginx
                            |
                    /admin, /api → proxy_pass → Express (porta 3055)
                    /            → arquivos estaticos (/var/www/uninovare/)
```

---

## 8. SEO E INDEXACAO

| Item | Implementacao |
|------|--------------|
| robots.txt | Permite tudo, bloqueia /admin, aponta sitemap |
| sitemap.xml | 6 paginas publicas com prioridades |
| Meta description | Unica por pagina |
| Meta keywords | Relevantes por pagina |
| Canonical URL | Em todas as paginas |
| Open Graph | og:title, og:description, og:image, og:url |
| Twitter Cards | summary_large_image |
| JSON-LD | Organization, EducationalOrganization, LocalBusiness, Course |
| HTML5 semantico | header, main, section, article, nav, footer |
| ARIA | Labels, roles, aria-expanded |
| Performance | lazy loading, preconnect, gzip |

---

## 9. INFRAESTRUTURA E DEPLOY

### Servidor

| Item | Valor |
|------|-------|
| IP | 187.77.33.115 |
| SO | Ubuntu 24.04 LTS |
| Web Server | Nginx 1.24 |
| SSL | Let's Encrypt (auto) |
| Node.js | v20.20.1 |
| pm2 | Gerenciador processos |

### Deploy do site

```bash
# Automatico (envia site/ para /var/www/uninovare/):
python deploy.py

# Manual via FileZilla:
# Host: sftp://187.77.33.115 | User: root | Porta: 22
```

### Deploy do admin

```bash
scp admin-server/server.js root@187.77.33.115:/var/www/uninovare-admin/
ssh root@187.77.33.115 "pm2 restart uninovare-admin"
```

### Comandos uteis no VPS

```bash
pm2 list                      # Ver processos
pm2 restart uninovare-admin   # Reiniciar admin
pm2 logs uninovare-admin      # Ver logs
systemctl status nginx        # Verificar Nginx
systemctl reload nginx        # Recarregar config
certbot certificates          # Ver SSL
```

---

## 10. MANUTENCAO E TROUBLESHOOTING

### Checklist mensal
- [ ] Site acessivel (https://uninovare.com.br)
- [ ] SSL valido (`certbot certificates`)
- [ ] Nginx rodando (`systemctl status nginx`)
- [ ] Admin rodando (`pm2 list`)
- [ ] WhatsApp funcionando
- [ ] Banner atualizado

### Problemas comuns

| Problema | Solucao |
|----------|---------|
| Site fora do ar | `systemctl restart nginx` |
| Admin nao funciona | `pm2 restart uninovare-admin && pm2 logs uninovare-admin` |
| SSL expirado | `certbot renew && systemctl reload nginx` |
| Imagem nao aparece | Verificar nome do arquivo (case-sensitive) e pasta |
| Curso nao aparece | Verificar cursos.json (JSON valido?) |

---

## 11. CREDENCIAIS E ACESSOS

| Servico | Acesso |
|---------|--------|
| **VPS SSH** | root@187.77.33.115 |
| **Admin Site** | uninovare.com.br/admin / admin / uninovare2026 |
| **Portal Academico** | app.siaf360.com.br/login/uninovare |
| **GitHub** | github.com/JPauloSantos/uninovare-site |
| **Hostinger** | hpanel.hostinger.com / jpsisan@gmail.com |
| **Registro.br** | MACSO1637 |
| **WhatsApp** | (83) 9.9686-5555 |
| **Telefone** | (83) 3099-5333 |
| **Instagram** | @uninovare |
| **LinkedIn** | /company/uninovare |
| **Endereco** | Shopping Cirne Center, 2o andar, Centro, Campina Grande/PB |
| **Dominio expira** | 15 de agosto de 2027 |

---

## 12. HISTORICO DE VERSOES

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0 | Mar 2026 | Site one-page original |
| 2.0 | 27 Mar 2026 | Reestruturacao completa: multi-pagina, sistema de cursos, admin web |
| 2.1 | 06 Abr 2026 | Atualizacoes visuais (banner, artes cursos, checkmarks, centralizacao) |

### Commits (mais recentes primeiro)

| Commit | Descricao |
|--------|-----------|
| `2cb6f60` | fix: imagem do curso nao corta mais |
| `9d9d0ce` | feat: atualizacoes visuais Prof. Milena (banner, artes, checkmarks) |
| `7e34f64` | docs: documentacao + PDF |
| `4ebc7d4` | fix: botao remover imagem no admin |
| `cf5dcf1` | feat: busca/filtro + upload capa no admin |
| `519aae5` | fix: SyntaxError JS do admin |
| `5195528` | fix: admin lista cursos (cookie + thumbnails) |
| `7ac0ab3` | feat: sistema admin web Node.js/Express |
| `e921941` | feat: carrossel full-width |
| `4e6ab38` | fix: cursos em destaque no HTML |
| `822b9a2` | fix: banner full-width centralizado |
| `ff8b5e3` | fix: hero + Portal Academico |
| `e6d0fb4` | fix: bugs HTML/JS |
| `c4ee029` | feat: reestruturacao completa v2.0 |

---

*Documento atualizado em 06 de abril de 2026 — v2.1*
