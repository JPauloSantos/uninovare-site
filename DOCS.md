# UNINOVARE — Documentacao Tecnica do Projeto (v2.0)

**Data:** Março de 2026
**Domínio:** uninovare.com.br
**Repositório:** GitHub (privado)
**Servidor:** Hostinger VPS KVM 2 — 187.77.33.115

---

## 1. Visão Geral

O site da UNINOVARE é um site institucional multi-página para a empresa de treinamento, cursos e consultoria sediada em Campina Grande/PB. A versão 2.0 representa uma reestruturação completa do site original (one-page) para um site multi-página com sistema de gestão de cursos.

### 1.1 O que mudou (v1.0 → v2.0)

| Aspecto | v1.0 (anterior) | v2.0 (atual) |
|---------|-----------------|--------------|
| Estrutura | One-page (index.html único) | Multi-página (6 páginas + admin) |
| Fontes | Baloo 2 + Merriweather | Baloo 2 + Open Sans |
| Cursos | Lista estática no HTML | Sistema dinâmico via JSON |
| Administração | Edição manual do HTML | Painel admin com formulário |
| SEO | Básico (meta description) | Completo (robots.txt, sitemap, JSON-LD, Open Graph) |
| Navegação | Âncoras internas | Páginas separadas com nav compartilhada |
| Depoimentos | Carrossel | Grid 2 colunas |
| Galeria | Grid simples | Formato álbum |

---

## 2. Estrutura de Arquivos

```
site/
├── index.html              ← Página principal (Home)
├── quem-somos.html         ← Institucional, Missão/Visão/Valores, Equipe
├── cursos.html             ← Listagem de cursos por categoria
├── curso.html              ← Ficha individual do curso (?id=slug)
├── solucoes.html           ← Soluções Educacionais
├── contato.html            ← Formulário + informações de contato
├── admin.html              ← Painel de cadastro de cursos (não indexado)
├── robots.txt              ← Regras para robôs de indexação
├── sitemap.xml             ← Mapa do site para mecanismos de busca
├── data/
│   └── cursos.json         ← Banco de dados dos cursos
├── css/
│   ├── global.css          ← Estilos globais, reset, tipografia, componentes
│   ├── home.css            ← Estilos específicos da home
│   ├── cursos.css          ← Estilos de listagem e ficha do curso
│   ├── quem-somos.css      ← Estilos da página institucional
│   ├── solucoes.css        ← Estilos da página de soluções
│   └── admin.css           ← Estilos do painel administrativo
├── js/
│   ├── global.js           ← Menu, scroll reveal, formulário WhatsApp
│   ├── carousel.js         ← Fábrica de carrossel reutilizável
│   ├── cursos.js           ← Renderização da listagem de cursos
│   ├── curso-detalhe.js    ← Renderização da ficha individual
│   └── admin.js            ← Lógica do painel administrativo
└── assets/
    ├── logos/              ← Logotipos (horizontal, vertical, circular)
    ├── banners/            ← Banners promocionais
    ├── cursos/             ← Capas dos cursos
    ├── professores/        ← Fotos dos professores (a adicionar)
    ├── equipe/             ← Fotos da equipe
    └── gallery/            ← Fotos de turmas e eventos
```

---

## 3. Páginas do Site

### 3.1 Home (index.html)
- Banner hero com chamada para pós-graduações
- Seção hero com apresentação da UNINOVARE
- "Por que escolher a UNINOVARE?" — 4 diferenciais
- Cursos em destaque (carrossel dinâmico via cursos.json)
- Depoimentos de alunos (grid 2 colunas)
- Galeria de turmas e eventos (formato álbum)

### 3.2 Quem Somos (quem-somos.html)
- Apresentação institucional
- Missão, Visão e Valores
- Equipe: Milena Araújo (Diretora), Lícea Araújo (Assistente), Myrna Soares (Consultora)
- Parceiros institucionais

### 3.3 Nossos Cursos (cursos.html)
- Listagem de todos os cursos com filtro por categoria
- Categorias: Psicologia, Educação, Saúde, Gestão, Comunicação
- Dados carregados dinamicamente de `data/cursos.json`
- Link para ficha individual de cada curso

### 3.4 Ficha do Curso (curso.html?id=slug)
- Detalhes completos do curso
- **Campos condicionais**: só aparecem quando preenchidos
- Campos: objetivo, descrição, diferencial, público-alvo, carga horária, duração, coordenador, professores, matriz curricular, valor, contato de inscrição, link de cadastro
- CTA para inscrição via WhatsApp

### 3.5 Soluções Educacionais (solucoes.html)
- Pós-Graduações Presenciais
- Cursos de Formação e Treinamentos (Educação, Psicologia, Administração)
- Mestrados e Doutorados (Programas Internacionais)
- Tecnólogo Superior EAD (em breve)
- Graduações EAD (em breve)

### 3.6 Contato (contato.html)
- Formulário que envia para WhatsApp (sem backend)
- Informações: WhatsApp, telefone, endereço, redes sociais
- Mapa do Google Maps

### 3.7 Painel Admin (admin.html)
- Não indexado por mecanismos de busca
- CRUD completo de cursos
- Adição dinâmica de professores (botão "+Adicionar")
- Importar/exportar JSON
- Preview ao vivo do curso
- Dados salvos em localStorage + exportação para servidor

---

## 4. Sistema de Cursos

### 4.1 Estrutura de Dados (cursos.json)

Cada curso possui os seguintes campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | Sim | Slug único (auto-gerado) |
| nome | string | Sim | Nome completo do curso |
| categoria | string | Sim | Psicologia, Educação, Saúde, Gestão, Comunicação |
| nivel | string | Sim | Especialização, MBA, Mestrado, Doutorado |
| capa | string | Não | Caminho da imagem de capa |
| descricao | string | Não | Descrição completa |
| diferencial | string | Não | Frase de diferencial |
| objetivo | string | Não | Objetivo do curso |
| publicoAlvo | string | Não | Público-alvo |
| cargaHoraria | string | Não | Ex: "360 h/a" |
| duracao | string | Não | Ex: "15 meses" |
| coordenador | object | Não | { nome, fone } |
| professores | array | Não | [{ foto, nome, miniCurriculo, titulacao }] |
| matrizCurricular | string | Não | Grade curricular |
| valor | string | Não | Valor do investimento |
| contatoInscricao | string | Não | Contato para matrícula |
| linkCadastro | string | Não | URL do formulário de inscrição |
| destaque | boolean | Não | Aparece no carrossel da home |

### 4.2 Campos Condicionais

**Regra fundamental**: campos não preenchidos (vazio, null, undefined, array vazio) **não aparecem** na ficha do curso. Isso permite cadastrar cursos parcialmente e ir completando as informações ao longo do tempo.

### 4.3 Fluxo de Atualização de Cursos

1. Acessar `admin.html`
2. Cadastrar/editar cursos no formulário
3. Clicar "Exportar JSON" para baixar `cursos.json`
4. Enviar o arquivo para `data/cursos.json` no servidor via FileZilla
5. O site atualiza automaticamente (sem necessidade de editar HTML)

---

## 5. SEO e Indexação

### 5.1 robots.txt
- Permite indexação de todas as páginas públicas
- Bloqueia `admin.html`
- Aponta para o sitemap.xml
- Configurações específicas para Googlebot, Bingbot e YandexBot

### 5.2 sitemap.xml
- Lista todas as 6 páginas públicas
- Inclui lastmod, changefreq e priority
- Formato XML padrão do protocolo Sitemaps

### 5.3 Meta Tags (em todas as páginas)
- `<meta name="description">` — descrição única por página
- `<meta name="keywords">` — palavras-chave relevantes
- `<meta name="author">` — UNINOVARE
- `<meta name="robots">` — index,follow (noindex no admin)
- `<link rel="canonical">` — URL canônica

### 5.4 Open Graph (Facebook, LinkedIn, WhatsApp)
- `og:title`, `og:description`, `og:image`, `og:url`
- `og:type` — website
- `og:locale` — pt_BR
- `og:site_name` — UNINOVARE

### 5.5 Twitter Cards
- `twitter:card` — summary_large_image
- `twitter:title`, `twitter:description`, `twitter:image`

### 5.6 Dados Estruturados (JSON-LD)
- **Organization** — dados da empresa, endereço, contato, redes sociais
- **EducationalOrganization** — catálogo de cursos
- **LocalBusiness** — informações de contato e localização (página de contato)
- **Course** — dados individuais de cada curso (página de detalhe)

### 5.7 Boas Práticas Adicionais
- HTML5 semântico (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`)
- Atributos `alt` em todas as imagens
- `loading="lazy"` para imagens fora do viewport
- `preconnect` para Google Fonts
- Acessibilidade: ARIA labels, skip links, roles, aria-expanded

---

## 6. Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| HTML5 | Estrutura semântica das páginas |
| CSS3 | Estilos, layout responsivo, animações |
| JavaScript (Vanilla) | Interatividade, renderização dinâmica, admin |
| JSON | Armazenamento de dados dos cursos |
| localStorage | Persistência no painel admin |
| Google Fonts | Baloo 2 (títulos) + Open Sans (corpo) |
| Nginx | Servidor web no VPS |
| Let's Encrypt | Certificado SSL |

### 6.1 Sem Dependências Externas
O site não usa frameworks, bibliotecas ou dependências externas além do Google Fonts. Isso garante:
- Carregamento rápido
- Zero vulnerabilidades de terceiros
- Facilidade de manutenção
- Funciona offline (exceto fontes)

---

## 7. Paleta de Cores

| Variável | Cor | Uso |
|----------|-----|-----|
| --primary | #3A7D44 | Botões, links, destaques |
| --accent | #FFC857 | Acentos, badges |
| --secondary | #567C8D | Elementos secundários |
| --sand | #F3E9D2 | Fundo geral |
| --ink | #1f2a2e | Texto principal |

---

## 8. Infraestrutura

| Item | Valor |
|------|-------|
| Domínio | uninovare.com.br |
| Servidor | Hostinger VPS KVM 2 — 187.77.33.115 |
| SO | Ubuntu 24.04 LTS |
| Web Server | Nginx 1.24 |
| SSL | Let's Encrypt (renovação automática) |
| Arquivos no VPS | /var/www/uninovare/ |
| DNS | Registro.br (conta MACSO1637) |
| Hostinger | jpsisan@gmail.com |

---

## 9. Deploy

### 9.1 Via FileZilla (SFTP)
```
Host: sftp://187.77.33.115
Usuário: root
Porta: 22
```

1. Conecte no FileZilla
2. Navegue até `/var/www/uninovare/` no servidor
3. Envie o conteúdo da pasta `site/`
4. O site atualiza imediatamente

### 9.2 Via SSH (alternativa)
```bash
ssh root@187.77.33.115
cd /var/www/uninovare
# Fazer backup primeiro
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/uninovare/
```

---

## 10. Contatos e Contas

| Serviço | Acesso |
|---------|--------|
| WhatsApp UNINOVARE | (83) 9.9686-5555 |
| Telefone | (83) 3099-5333 |
| Instagram | @uninovare |
| LinkedIn | /company/uninovare |
| Endereço | Shopping Cirne Center, 2º andar, Centro, Campina Grande/PB |

---

## 11. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Março 2026 | Site one-page original (HTML/CSS/JS estático) |
| 2.0 | Março 2026 | Reestruturação completa: multi-página, sistema de cursos, painel admin, SEO avançado |

---

*Documento gerado em março de 2026. Manter atualizado a cada mudança significativa.*
