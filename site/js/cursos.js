/* ══════════════════════════════════════════════════════════════
   UNINOVARE — Cursos (Listagem & Filtros)
   Popula #cursos-grid com dados de data/cursos.json
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Referências DOM ── */
  var grid      = document.getElementById('cursos-grid');
  var contagem  = document.getElementById('cursos-contagem');
  var vazio     = document.getElementById('cursos-vazio');
  var filtros   = document.getElementById('filtros');

  /* ── Estado ── */
  var todosCursos    = [];
  var filtroAtivo    = 'todos';

  /* ── WhatsApp ── */
  var WHATSAPP_NUM = '558396865555';

  /* ══════════════════════════════════════════════════════════════
     INICIALIZAÇÃO
     ══════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    carregarCursos();
  });

  /* ══════════════════════════════════════════════════════════════
     FETCH & SORT
     ══════════════════════════════════════════════════════════════ */

  function carregarCursos() {
    fetch('data/cursos.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Erro ao carregar cursos: ' + res.status);
        return res.json();
      })
      .then(function (dados) {
        todosCursos = ordenar(dados);
        lerFiltroURL();
        aplicarFiltro();
        registrarEventos();
      })
      .catch(function (err) {
        console.error(err);
        if (grid) {
          grid.innerHTML =
            '<p class="cursos-erro" role="alert">Não foi possível carregar os cursos. Tente novamente mais tarde.</p>';
        }
      });
  }

  /** Destaque primeiro, depois ordem alfabética por nome */
  function ordenar(cursos) {
    return cursos.slice().sort(function (a, b) {
      if (a.destaque && !b.destaque) return -1;
      if (!a.destaque && b.destaque) return 1;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }

  /* ══════════════════════════════════════════════════════════════
     FILTRO
     ══════════════════════════════════════════════════════════════ */

  /** Lê ?categoria= da URL e define filtroAtivo */
  function lerFiltroURL() {
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('categoria');
    if (cat) {
      filtroAtivo = cat;
      ativarBotaoFiltro(cat);
    }
  }

  /** Registra cliques nos botões de filtro */
  function registrarEventos() {
    if (!filtros) return;

    filtros.addEventListener('click', function (e) {
      var btn = e.target.closest('.filtro-btn');
      if (!btn) return;

      var cat = btn.getAttribute('data-categoria') || 'todos';
      if (cat === filtroAtivo) return;

      filtroAtivo = cat;
      ativarBotaoFiltro(cat);
      aplicarFiltro();
    });
  }

  /** Marca o botão correto como ativo */
  function ativarBotaoFiltro(categoria) {
    if (!filtros) return;
    var botoes = filtros.querySelectorAll('.filtro-btn');
    botoes.forEach(function (btn) {
      var cat = btn.getAttribute('data-categoria') || '';
      if (cat.toLowerCase() === categoria.toLowerCase() ||
          (categoria === 'todos' && cat === 'todos')) {
        btn.classList.add('filtro-btn--active');
      } else {
        btn.classList.remove('filtro-btn--active');
      }
    });
  }

  /** Filtra cursos e re-renderiza o grid */
  function aplicarFiltro() {
    var filtrados;

    if (filtroAtivo === 'todos') {
      filtrados = todosCursos;
    } else {
      filtrados = todosCursos.filter(function (c) {
        return c.categoria.toLowerCase() === filtroAtivo.toLowerCase();
      });
    }

    atualizarContagem(filtrados.length);
    renderizarGrid(filtrados);
  }

  /** Atualiza texto de contagem */
  function atualizarContagem(n) {
    if (!contagem) return;
    if (n === 0) {
      contagem.textContent = '';
    } else if (n === 1) {
      contagem.textContent = '1 curso encontrado';
    } else {
      contagem.textContent = n + ' cursos encontrados';
    }
  }

  /* ══════════════════════════════════════════════════════════════
     RENDERIZAÇÃO
     ══════════════════════════════════════════════════════════════ */

  /** Renderiza cards com animação de fade */
  function renderizarGrid(cursos) {
    if (!grid) return;

    // Fade out
    grid.style.opacity = '0';
    grid.style.transition = 'opacity .25s ease';

    setTimeout(function () {
      grid.innerHTML = '';

      if (cursos.length === 0) {
        grid.setAttribute('hidden', '');
        if (vazio) vazio.removeAttribute('hidden');
      } else {
        grid.removeAttribute('hidden');
        if (vazio) vazio.setAttribute('hidden', '');

        cursos.forEach(function (curso) {
          grid.appendChild(criarCard(curso));
        });
      }

      // Fade in
      requestAnimationFrame(function () {
        grid.style.opacity = '1';
      });
    }, 250);
  }

  /** Cria um card de curso */
  function criarCard(curso) {
    var card = document.createElement('article');
    card.className = 'cursoCard';
    card.setAttribute('role', 'listitem');

    // ── Imagem ou placeholder ──
    var visualHTML;
    if (curso.capa) {
      visualHTML =
        '<div class="cursoCard__img">' +
          '<img src="' + escapeAttr(curso.capa) + '"' +
          ' alt="' + escapeAttr(curso.nome) + '"' +
          ' loading="lazy" decoding="async">' +
        '</div>';
    } else {
      var iniciais = obterIniciais(curso.nome);
      var cor = corPlaceholder(curso.categoria);
      visualHTML =
        '<div class="cursoCard__img cursoCard__placeholder" style="background:' + cor + '">' +
          '<span aria-hidden="true">' + escapeHTML(iniciais) + '</span>' +
        '</div>';
    }

    // ── Descrição truncada ──
    var desc = curso.descricao || '';
    if (desc.length > 120) {
      desc = desc.substring(0, 117).replace(/\s+\S*$/, '') + '...';
    }

    // ── WhatsApp link ──
    var msgWA = encodeURIComponent('Olá, quero informações sobre ' + curso.nome);
    var linkWA = 'https://wa.me/' + WHATSAPP_NUM + '?text=' + msgWA;

    // ── Montar HTML ──
    card.innerHTML =
      visualHTML +
      '<div class="cursoCard__body">' +
        '<div class="cursoCard__pills">' +
          '<span class="pill pill--nivel">' + escapeHTML(curso.nivel || 'Especialização') + '</span>' +
          '<span class="pill pill--categoria">' + escapeHTML(curso.categoria) + '</span>' +
        '</div>' +
        '<h3 class="cursoCard__titulo">' + escapeHTML(curso.nome) + '</h3>' +
        '<p class="cursoCard__desc">' + escapeHTML(desc) + '</p>' +
        '<div class="cursoCard__acoes">' +
          '<a href="curso.html?id=' + escapeAttr(curso.id) + '" class="btn btn--ghost">Ver detalhes</a>' +
          '<a href="' + linkWA + '" target="_blank" rel="noopener noreferrer" class="btn btn--primary">Quero infos</a>' +
        '</div>' +
      '</div>';

    return card;
  }

  /* ══════════════════════════════════════════════════════════════
     UTILITÁRIOS
     ══════════════════════════════════════════════════════════════ */

  /** Extrai iniciais do nome do curso (até 2 letras) */
  function obterIniciais(nome) {
    var partes = nome.split(/\s+/).filter(function (p) {
      return p.length > 2;
    });
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return (nome[0] || '?').toUpperCase();
  }

  /** Gera cor consistente por categoria */
  function corPlaceholder(categoria) {
    var cores = {
      'Psicologia':   '#7B68EE',
      'Educação':     '#2196F3',
      'Saúde':        '#26A69A',
      'Gestão':       '#FF7043',
      'Comunicação':  '#AB47BC'
    };
    return cores[categoria] || '#3A7D44';
  }

  /** Escapa HTML para prevenir XSS */
  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /** Escapa atributos HTML */
  function escapeAttr(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

})();
