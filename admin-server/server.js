const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3055;

// Caminhos
const CURSOS_PATH = '/var/www/uninovare/data/cursos.json';
const UPLOADS_DIR = '/var/www/uninovare/assets';

// Credenciais (trocar em produção)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'uninovare2026';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 4 * 60 * 60 * 1000 } // 4 horas
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  // Permitir rotas de login e API de login sem autenticação
  if (req.path.endsWith('/login') || req.path === '/api/login') return next();
  if (req.headers.accept && req.headers.accept.includes('json')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.redirect('/admin/login');
}

app.use(requireAuth);

// Upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = req.body.tipo || 'cursos'; // cursos, professores, equipe
    const dir = path.join(UPLOADS_DIR, tipo);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = file.originalname
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);
    cb(ok ? null : new Error('Apenas imagens JPG, PNG ou WebP'), ok);
  }
});

// ── ROTAS ──

// Login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Credenciais inválidas' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// Listar cursos
app.get('/api/cursos', (req, res) => {
  try {
    const data = fs.readFileSync(CURSOS_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json([]);
  }
});

// Salvar curso (criar ou atualizar)
app.post('/api/cursos', (req, res) => {
  try {
    const cursos = JSON.parse(fs.readFileSync(CURSOS_PATH, 'utf8'));
    const curso = req.body;

    if (!curso.nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    if (!curso.id) {
      curso.id = generateSlug(curso.nome);
      // Evitar duplicatas
      let slug = curso.id;
      let n = 2;
      while (cursos.some(c => c.id === slug)) { slug = curso.id + '-' + n; n++; }
      curso.id = slug;
    }

    const idx = cursos.findIndex(c => c.id === curso.id);
    if (idx >= 0) {
      cursos[idx] = curso;
    } else {
      cursos.push(curso);
    }

    fs.writeFileSync(CURSOS_PATH, JSON.stringify(cursos, null, 2), 'utf8');
    res.json({ ok: true, curso });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Excluir curso
app.delete('/api/cursos/:id', (req, res) => {
  try {
    let cursos = JSON.parse(fs.readFileSync(CURSOS_PATH, 'utf8'));
    const antes = cursos.length;
    cursos = cursos.filter(c => c.id !== req.params.id);
    if (cursos.length === antes) return res.status(404).json({ error: 'Curso não encontrado' });
    fs.writeFileSync(CURSOS_PATH, JSON.stringify(cursos, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Upload de imagem
app.post('/api/upload', upload.single('imagem'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const tipo = req.body.tipo || 'cursos';
  const relativePath = 'assets/' + tipo + '/' + req.file.filename;
  res.json({ ok: true, path: relativePath });
});

// Slug helper
function generateSlug(nome) {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── PÁGINAS HTML ──

// Rotas com e sem prefixo /admin (Nginx faz proxy de /admin → /)
app.get(['/login', '/admin/login'], (req, res) => {
  if (req.session && req.session.authenticated) return res.redirect('/admin');
  res.send(loginPage());
});

app.get(['/', '/admin'], (req, res) => {
  res.send(adminPage());
});

// ── HTML TEMPLATES ──

function loginPage() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Login — Admin UNINOVARE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root{--primary:#3A7D44;--sand:#F3E9D2;--ink:#1f2a2e;--radius:16px}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Open Sans",sans-serif;background:var(--sand);min-height:100vh;display:grid;place-items:center}
    .login{background:#fff;padding:48px 40px;border-radius:var(--radius);box-shadow:0 16px 40px rgba(31,42,46,.12);width:min(400px,90vw);text-align:center}
    .login h1{font-family:"Baloo 2",sans-serif;font-size:1.8rem;color:var(--ink);margin-bottom:8px}
    .login p{color:rgba(31,42,46,.6);margin-bottom:24px;font-size:.9rem}
    .field{text-align:left;margin-bottom:16px}
    .field label{display:block;font-weight:700;font-size:.85rem;margin-bottom:6px;color:var(--ink)}
    .field input{width:100%;padding:12px 14px;border:1px solid rgba(31,42,46,.15);border-radius:12px;font-size:1rem;font-family:inherit}
    .field input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(58,125,68,.12)}
    .btn{width:100%;padding:14px;border:0;border-radius:999px;background:var(--primary);color:#fff;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:1rem;cursor:pointer;margin-top:8px}
    .btn:hover{filter:brightness(1.06)}
    .erro{color:#e74c3c;font-size:.85rem;margin-top:12px;display:none}
    .back{margin-top:16px;font-size:.85rem}
    .back a{color:var(--primary)}
  </style>
</head>
<body>
  <div class="login">
    <h1>UNINOVARE</h1>
    <p>Painel Administrativo</p>
    <form id="loginForm">
      <div class="field">
        <label>Usuário</label>
        <input type="text" id="usuario" required autofocus>
      </div>
      <div class="field">
        <label>Senha</label>
        <input type="password" id="senha" required>
      </div>
      <button class="btn" type="submit">Entrar</button>
      <p class="erro" id="erro">Usuário ou senha inválidos.</p>
    </form>
    <p class="back"><a href="https://uninovare.com.br">← Voltar ao site</a></p>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async(e)=>{
      e.preventDefault();
      document.getElementById('erro').style.display='none';
      const r = await fetch('/api/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({usuario:document.getElementById('usuario').value,senha:document.getElementById('senha').value})
      });
      if(r.ok){window.location='/admin'}
      else{document.getElementById('erro').style.display='block'}
    });
  </script>
</body>
</html>`;
}

function adminPage() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin — UNINOVARE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root{--primary:#3A7D44;--primary-dark:#2d6335;--accent:#FFC857;--sand:#F3E9D2;--ink:#1f2a2e;--ink-soft:rgba(31,42,46,.7);--border:rgba(31,42,46,.1);--radius:16px;--shadow:0 8px 24px rgba(31,42,46,.08)}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Open Sans",sans-serif;background:var(--sand);color:var(--ink);min-height:100vh}
    h1,h2,h3{font-family:"Baloo 2",sans-serif}
    .topbar{background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);padding:14px 0;position:sticky;top:0;z-index:50}
    .topbar__inner{max-width:1140px;margin:0 auto;padding:0 5vw;display:flex;align-items:center;justify-content:space-between}
    .topbar h1{font-size:1.2rem;color:var(--ink)}
    .topbar__actions{display:flex;gap:10px;align-items:center}
    .container{max-width:1140px;margin:0 auto;padding:24px 5vw}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:999px;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:.88rem;border:1px solid transparent;cursor:pointer;text-decoration:none;transition:transform .15s,filter .15s}
    .btn:hover{transform:translateY(-1px)}
    .btn--primary{background:var(--primary);color:#fff}
    .btn--ghost{background:rgba(255,255,255,.7);border-color:var(--border);color:var(--ink)}
    .btn--danger{background:#e74c3c;color:#fff}
    .btn--sm{padding:6px 14px;font-size:.8rem}
    .btn--accent{background:var(--accent);color:var(--ink)}

    /* Lista */
    .grupo{margin-bottom:28px}
    .grupo__titulo{font-size:1.1rem;border-bottom:2px solid rgba(58,125,68,.15);padding-bottom:8px;margin-bottom:12px;color:var(--primary-dark)}
    .item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;transition:box-shadow .2s}
    .item:hover{box-shadow:var(--shadow)}
    .item__info{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1}
    .item__nome{font-family:"Baloo 2",sans-serif;font-weight:700;font-size:.95rem}
    .pill{padding:3px 10px;border-radius:999px;font-size:.72rem;font-weight:700;border:1px solid var(--border);background:rgba(255,255,255,.7);font-family:"Baloo 2",sans-serif}
    .pill--cat{background:rgba(58,125,68,.08);color:var(--primary-dark)}
    .pill--destaque{background:rgba(255,200,87,.3);border-color:rgba(255,200,87,.5);color:var(--ink)}
    .item__actions{display:flex;gap:6px;flex-shrink:0}
    .vazio{text-align:center;padding:48px;color:var(--ink-soft);border:2px dashed var(--border);border-radius:var(--radius)}
    .contagem{color:var(--ink-soft);font-size:.85rem;margin-bottom:16px}

    /* Modal/Form */
    .overlay{display:none;position:fixed;inset:0;background:rgba(31,42,46,.5);z-index:100;overflow-y:auto;padding:24px}
    .overlay.aberto{display:flex;justify-content:center;align-items:flex-start}
    .modal{background:#fff;border-radius:var(--radius);width:min(720px,100%);margin:40px auto;padding:32px;box-shadow:0 24px 56px rgba(31,42,46,.2)}
    .modal h2{margin-bottom:20px}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .form-full{grid-column:span 2}
    .field{margin-bottom:0}
    .field label{display:block;font-weight:700;font-size:.82rem;margin-bottom:4px;color:var(--ink)}
    .field input,.field textarea,.field select{width:100%;padding:10px 12px;border:1px solid rgba(31,42,46,.14);border-radius:10px;font-family:inherit;font-size:.92rem}
    .field input:focus,.field textarea:focus,.field select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(58,125,68,.1)}
    .field-check{display:flex;align-items:center;gap:8px}
    .field-check input{width:auto}
    .sep{grid-column:span 2;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:.95rem;color:var(--primary);border-bottom:1px solid var(--border);padding:12px 0 6px;margin-top:8px}
    .prof-block{grid-column:span 2;border:1px solid var(--border);border-radius:12px;padding:14px;background:rgba(243,233,210,.3);position:relative}
    .prof-block .form-grid{gap:10px}
    .prof-remove{position:absolute;top:8px;right:8px;background:#e74c3c;color:#fff;border:0;border-radius:8px;padding:4px 10px;font-size:.75rem;cursor:pointer;font-family:"Baloo 2",sans-serif;font-weight:700}
    .modal__actions{display:flex;gap:10px;margin-top:20px;justify-content:flex-end}

    /* Toast */
    .toast{position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:12px;background:var(--primary);color:#fff;font-family:"Baloo 2",sans-serif;font-weight:700;box-shadow:0 12px 32px rgba(31,42,46,.2);z-index:200;animation:slideUp .3s}
    .toast--erro{background:#e74c3c}
    @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}

    @media(max-width:600px){
      .form-grid{grid-template-columns:1fr}
      .form-full,.sep,.prof-block{grid-column:span 1}
      .item{flex-direction:column;align-items:flex-start;gap:10px}
      .item__actions{width:100%}
    }
  </style>
</head>
<body>

  <div class="topbar">
    <div class="topbar__inner">
      <h1>Admin — UNINOVARE</h1>
      <div class="topbar__actions">
        <button class="btn btn--primary" onclick="novoCurso()">+ Novo Curso</button>
        <a class="btn btn--ghost" href="https://uninovare.com.br" target="_blank">Ver Site</a>
        <button class="btn btn--ghost" onclick="logout()">Sair</button>
      </div>
    </div>
  </div>

  <div class="container">
    <p class="contagem" id="contagem"></p>
    <div id="lista"></div>
  </div>

  <!-- Modal de edição -->
  <div class="overlay" id="overlay">
    <div class="modal">
      <h2 id="modalTitulo">Novo Curso</h2>
      <form id="cursoForm" class="form-grid">
        <input type="hidden" id="f-id">

        <div class="sep">Informações Básicas</div>
        <div class="field"><label>Nome do Curso *</label><input id="f-nome" required></div>
        <div class="field"><label>Categoria</label>
          <select id="f-categoria">
            <option value="Psicologia">Psicologia</option>
            <option value="Educação">Educação</option>
            <option value="Saúde">Saúde</option>
            <option value="Gestão">Gestão</option>
            <option value="Comunicação">Comunicação</option>
          </select>
        </div>
        <div class="field"><label>Nível</label>
          <select id="f-nivel">
            <option value="Especialização">Especialização</option>
            <option value="MBA">MBA</option>
            <option value="Mestrado">Mestrado</option>
            <option value="Doutorado">Doutorado</option>
          </select>
        </div>
        <div class="field"><label>Capa (caminho)</label><input id="f-capa" placeholder="assets/cursos/nome.jpg"></div>
        <div class="field-check form-full"><input type="checkbox" id="f-destaque"><label for="f-destaque">Curso em destaque (aparece na home)</label></div>

        <div class="sep">Detalhes do Curso</div>
        <div class="field form-full"><label>Objetivo</label><textarea id="f-objetivo" rows="2"></textarea></div>
        <div class="field form-full"><label>Descrição</label><textarea id="f-descricao" rows="3"></textarea></div>
        <div class="field form-full"><label>Diferencial</label><input id="f-diferencial"></div>
        <div class="field form-full"><label>Público-Alvo</label><textarea id="f-publico" rows="2"></textarea></div>
        <div class="field"><label>Carga Horária</label><input id="f-carga" placeholder="360 h/a"></div>
        <div class="field"><label>Duração</label><input id="f-duracao" placeholder="15 meses"></div>

        <div class="sep">Coordenação</div>
        <div class="field"><label>Coordenador(a)</label><input id="f-coord-nome"></div>
        <div class="field"><label>Fone Coordenador(a)</label><input id="f-coord-fone"></div>

        <div class="sep">Corpo Docente</div>
        <div id="professores" class="form-full"></div>
        <div class="form-full"><button type="button" class="btn btn--ghost btn--sm" onclick="addProfessor()">+ Adicionar Professor</button></div>

        <div class="sep">Financeiro e Inscrição</div>
        <div class="field form-full"><label>Matriz Curricular</label><textarea id="f-matriz" rows="3"></textarea></div>
        <div class="field"><label>Valor</label><input id="f-valor" placeholder="R$ 249,00/mês"></div>
        <div class="field"><label>Contato de Inscrição</label><input id="f-contato"></div>
        <div class="field form-full"><label>Link de Cadastro (forms)</label><input id="f-link" type="url" placeholder="https://forms.google.com/..."></div>

        <div class="modal__actions form-full">
          <button type="button" class="btn btn--ghost" onclick="fecharModal()">Cancelar</button>
          <button type="submit" class="btn btn--primary">Salvar Curso</button>
        </div>
      </form>
    </div>
  </div>

<script>
const API = '';
let cursos = [];

// ── Init ──
carregarCursos();

async function carregarCursos() {
  const r = await fetch(API + '/api/cursos');
  cursos = await r.json();
  renderLista();
}

function renderLista() {
  const el = document.getElementById('lista');
  const cont = document.getElementById('contagem');
  cont.textContent = cursos.length + ' curso(s) cadastrado(s)';

  if (cursos.length === 0) {
    el.innerHTML = '<div class="vazio"><p>Nenhum curso cadastrado.</p><p>Clique em <strong>+ Novo Curso</strong> para começar.</p></div>';
    return;
  }

  const grupos = {};
  cursos.forEach(c => {
    const cat = c.categoria || 'Sem Categoria';
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(c);
  });

  let html = '';
  Object.keys(grupos).sort().forEach(cat => {
    html += '<div class="grupo">';
    html += '<h3 class="grupo__titulo">' + esc(cat) + ' (' + grupos[cat].length + ')</h3>';
    grupos[cat].forEach(c => {
      html += '<div class="item">';
      html += '  <div class="item__info">';
      html += '    <span class="item__nome">' + esc(c.nome) + '</span>';
      html += '    <span class="pill pill--cat">' + esc(c.nivel || '') + '</span>';
      if (c.destaque) html += '<span class="pill pill--destaque">Destaque</span>';
      html += '  </div>';
      html += '  <div class="item__actions">';
      html += '    <button class="btn btn--ghost btn--sm" onclick="editarCurso(\'' + esc(c.id) + '\')">Editar</button>';
      html += '    <button class="btn btn--danger btn--sm" onclick="excluirCurso(\'' + esc(c.id) + '\')">Excluir</button>';
      html += '  </div>';
      html += '</div>';
    });
    html += '</div>';
  });
  el.innerHTML = html;
}

// ── CRUD ──
function novoCurso() {
  document.getElementById('cursoForm').reset();
  document.getElementById('f-id').value = '';
  document.getElementById('professores').innerHTML = '';
  document.getElementById('modalTitulo').textContent = 'Novo Curso';
  abrirModal();
}

function editarCurso(id) {
  const c = cursos.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modalTitulo').textContent = 'Editar: ' + c.nome;
  document.getElementById('f-id').value = c.id;
  document.getElementById('f-nome').value = c.nome || '';
  document.getElementById('f-categoria').value = c.categoria || 'Psicologia';
  document.getElementById('f-nivel').value = c.nivel || 'Especialização';
  document.getElementById('f-capa').value = c.capa || '';
  document.getElementById('f-destaque').checked = !!c.destaque;
  document.getElementById('f-objetivo').value = c.objetivo || '';
  document.getElementById('f-descricao').value = c.descricao || '';
  document.getElementById('f-diferencial').value = c.diferencial || '';
  document.getElementById('f-publico').value = c.publicoAlvo || '';
  document.getElementById('f-carga').value = c.cargaHoraria || '';
  document.getElementById('f-duracao').value = c.duracao || '';
  document.getElementById('f-coord-nome').value = (c.coordenador || {}).nome || '';
  document.getElementById('f-coord-fone').value = (c.coordenador || {}).fone || '';
  document.getElementById('f-matriz').value = c.matrizCurricular || '';
  document.getElementById('f-valor').value = c.valor || '';
  document.getElementById('f-contato').value = c.contatoInscricao || '';
  document.getElementById('f-link').value = c.linkCadastro || '';

  const profsEl = document.getElementById('professores');
  profsEl.innerHTML = '';
  (c.professores || []).forEach(p => addProfessor(p));

  abrirModal();
}

document.getElementById('cursoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const curso = {
    id: document.getElementById('f-id').value || '',
    nome: document.getElementById('f-nome').value,
    categoria: document.getElementById('f-categoria').value,
    nivel: document.getElementById('f-nivel').value,
    capa: document.getElementById('f-capa').value,
    destaque: document.getElementById('f-destaque').checked,
    objetivo: document.getElementById('f-objetivo').value,
    descricao: document.getElementById('f-descricao').value,
    diferencial: document.getElementById('f-diferencial').value,
    publicoAlvo: document.getElementById('f-publico').value,
    cargaHoraria: document.getElementById('f-carga').value,
    duracao: document.getElementById('f-duracao').value,
    coordenador: {
      nome: document.getElementById('f-coord-nome').value,
      fone: document.getElementById('f-coord-fone').value
    },
    professores: coletarProfessores(),
    matrizCurricular: document.getElementById('f-matriz').value,
    valor: document.getElementById('f-valor').value,
    contatoInscricao: document.getElementById('f-contato').value,
    linkCadastro: document.getElementById('f-link').value
  };

  const r = await fetch(API + '/api/cursos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(curso)
  });

  if (r.ok) {
    toast('Curso salvo com sucesso!');
    fecharModal();
    carregarCursos();
  } else {
    const err = await r.json();
    toast(err.error || 'Erro ao salvar', true);
  }
});

async function excluirCurso(id) {
  const c = cursos.find(x => x.id === id);
  if (!confirm('Excluir "' + (c ? c.nome : id) + '"?')) return;
  const r = await fetch(API + '/api/cursos/' + id, { method: 'DELETE' });
  if (r.ok) { toast('Curso excluído.'); carregarCursos(); }
  else toast('Erro ao excluir.', true);
}

// ── Professores ──
function addProfessor(dados) {
  const d = dados || {};
  const el = document.getElementById('professores');
  const n = el.querySelectorAll('.prof-block').length + 1;
  const div = document.createElement('div');
  div.className = 'prof-block';
  div.innerHTML =
    '<button type="button" class="prof-remove" onclick="this.parentElement.remove()">X</button>' +
    '<strong style="font-family:Baloo 2,sans-serif;font-size:.85rem">Professor ' + n + '</strong>' +
    '<div class="form-grid" style="margin-top:8px">' +
    '  <div class="field"><label>Nome</label><input class="pf-nome" value="' + esc(d.nome) + '"></div>' +
    '  <div class="field"><label>Titulação</label><input class="pf-tit" value="' + esc(d.titulacao) + '"></div>' +
    '  <div class="field"><label>Foto (caminho)</label><input class="pf-foto" value="' + esc(d.foto) + '"></div>' +
    '  <div class="field"><label>Mini Currículo</label><textarea class="pf-bio" rows="2">' + esc(d.miniCurriculo) + '</textarea></div>' +
    '</div>';
  el.appendChild(div);
}

function coletarProfessores() {
  return Array.from(document.querySelectorAll('.prof-block')).map(b => ({
    nome: (b.querySelector('.pf-nome') || {}).value || '',
    titulacao: (b.querySelector('.pf-tit') || {}).value || '',
    foto: (b.querySelector('.pf-foto') || {}).value || '',
    miniCurriculo: (b.querySelector('.pf-bio') || {}).value || ''
  })).filter(p => p.nome.trim());
}

// ── UI ──
function abrirModal() { document.getElementById('overlay').classList.add('aberto'); }
function fecharModal() { document.getElementById('overlay').classList.remove('aberto'); }
document.getElementById('overlay').addEventListener('click', e => { if (e.target === e.currentTarget) fecharModal(); });

async function logout() {
  await fetch(API + '/api/logout', { method: 'POST' });
  window.location = '/admin/login';
}

function toast(msg, erro) {
  const t = document.createElement('div');
  t.className = 'toast' + (erro ? ' toast--erro' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
</script>
</body>
</html>`;
}

// ── START ──
app.listen(PORT, '127.0.0.1', () => {
  console.log('Admin UNINOVARE rodando em http://127.0.0.1:' + PORT);
});
