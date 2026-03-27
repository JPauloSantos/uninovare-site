/* ══════════════════════════════════════════════════════════════
   UNINOVARE — Curso Detalhe JS
   Reads ?id= param, fetches cursos.json, renders full course view
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const cursoId = params.get('id');

  if (!cursoId) {
    showError('Nenhum curso foi especificado.');
    return;
  }

  fetch('data/cursos.json')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao carregar dados dos cursos.');
      return res.json();
    })
    .then(cursos => {
      const curso = cursos.find(c => c.id === cursoId);
      if (!curso) {
        showError('Curso não encontrado.');
        return;
      }
      renderCurso(curso);
    })
    .catch(() => {
      showError('Não foi possível carregar os dados do curso.');
    });
});

/* ── Error State ── */
function showError(msg) {
  const detalhe = document.getElementById('curso-detalhe');
  if (detalhe) {
    detalhe.innerHTML =
      '<div class="card" style="text-align:center;padding:48px 24px;">' +
        '<p style="font-size:1.125rem;margin-bottom:16px;">' + escapeHtml(msg) + '</p>' +
        '<a href="cursos.html" class="btn btn--primary">Ver todos os cursos</a>' +
      '</div>';
  }
  const titulo = document.getElementById('curso-titulo');
  if (titulo) titulo.textContent = 'Curso não encontrado';
  const breadcrumb = document.getElementById('breadcrumb-curso');
  if (breadcrumb) breadcrumb.textContent = 'Não encontrado';
}

/* ── Main Render ── */
function renderCurso(c) {
  // 1. Page title
  document.title = c.nome + ' \u2014 UNINOVARE';

  // 2. Breadcrumb
  const breadcrumb = document.getElementById('breadcrumb-curso');
  if (breadcrumb) breadcrumb.textContent = c.nome;

  // 3. Course header
  renderHeader(c);

  // 4. Course details (conditional)
  renderDetalhe(c);

  // 5. WhatsApp CTA
  updateWhatsApp(c);

  // 6. JSON-LD
  updateJsonLd(c);
}

/* ── Header ── */
function renderHeader(c) {
  // Cover image
  var capaWrap = document.getElementById('curso-capa-wrap');
  if (capaWrap) {
    if (hasValue(c.capa)) {
      capaWrap.innerHTML =
        '<img src="' + escapeAttr(c.capa) + '" alt="Capa do curso ' + escapeAttr(c.nome) + '" class="curso-header__img" loading="eager">';
    } else {
      capaWrap.innerHTML =
        '<div class="curso-header__placeholder" aria-hidden="true">' +
          '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>' +
            '<line x1="4" y1="22" x2="4" y2="15"/>' +
          '</svg>' +
        '</div>';
    }
  }

  // Title
  var titulo = document.getElementById('curso-titulo');
  if (titulo) titulo.textContent = c.nome;

  // Pills
  var pills = document.getElementById('curso-pills');
  if (pills) {
    pills.innerHTML =
      '<span class="pill">' + escapeHtml(c.nivel) + '</span>' +
      '<span class="pill pill--outline">' + escapeHtml(c.categoria) + '</span>';
  }
}

/* ── Detail Sections (Conditional) ── */
function renderDetalhe(c) {
  var el = document.getElementById('curso-detalhe');
  if (!el) return;

  var html = '';

  // a. Objetivo
  if (hasValue(c.objetivo)) {
    html += section('Objetivo do Curso', '<p>' + escapeHtml(c.objetivo) + '</p>');
  }

  // b. Descrição
  if (hasValue(c.descricao)) {
    html += section('Sobre o Curso', '<p>' + escapeHtml(c.descricao) + '</p>');
  }

  // c. Diferencial
  if (hasValue(c.diferencial)) {
    html += section('Diferencial', '<p>' + escapeHtml(c.diferencial) + '</p>');
  }

  // d. Público-Alvo
  if (hasValue(c.publicoAlvo)) {
    html += section('Público-Alvo', '<p>' + escapeHtml(c.publicoAlvo) + '</p>');
  }

  // e. Informações do Curso
  var infoCards = '';
  if (hasValue(c.cargaHoraria)) {
    infoCards += infoCard('Carga Horária', c.cargaHoraria);
  }
  if (hasValue(c.duracao)) {
    infoCards += infoCard('Duração', c.duracao);
  }
  infoCards += infoCard('Nível', c.nivel);
  infoCards += infoCard('Categoria', c.categoria);

  html += section('Informações do Curso', '<div class="grid grid--4">' + infoCards + '</div>');

  // f. Coordenação
  if (c.coordenador && hasValue(c.coordenador.nome)) {
    var coordHtml = '<p><strong>' + escapeHtml(c.coordenador.nome) + '</strong></p>';
    if (hasValue(c.coordenador.fone)) {
      coordHtml += '<p>Telefone: ' + escapeHtml(c.coordenador.fone) + '</p>';
    }
    html += section('Coordenação', '<div class="card" style="padding:24px;">' + coordHtml + '</div>');
  }

  // g. Corpo Docente
  if (Array.isArray(c.professores) && c.professores.length > 0) {
    var profsHtml = '<div class="grid grid--3">';
    c.professores.forEach(function (p) {
      profsHtml += '<div class="card" style="padding:24px;text-align:center;">';
      if (hasValue(p.foto)) {
        profsHtml +=
          '<img src="' + escapeAttr(p.foto) + '" alt="' + escapeAttr(p.nome) + '" ' +
          'class="curso-prof__foto" loading="lazy" width="120" height="120">';
      } else {
        profsHtml +=
          '<div class="curso-prof__avatar" aria-hidden="true">' +
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
              '<circle cx="12" cy="7" r="4"/>' +
            '</svg>' +
          '</div>';
      }
      profsHtml += '<h4 class="curso-prof__nome">' + escapeHtml(p.nome) + '</h4>';
      if (hasValue(p.titulacao)) {
        profsHtml += '<span class="pill pill--sm">' + escapeHtml(p.titulacao) + '</span>';
      }
      if (hasValue(p.miniCurriculo)) {
        profsHtml += '<p class="fine" style="margin-top:8px;">' + escapeHtml(p.miniCurriculo) + '</p>';
      }
      profsHtml += '</div>';
    });
    profsHtml += '</div>';
    html += section('Corpo Docente', profsHtml);
  }

  // h. Matriz Curricular
  if (hasValue(c.matrizCurricular)) {
    html += section('Matriz Curricular', '<div class="card" style="padding:24px;">' + escapeHtml(c.matrizCurricular) + '</div>');
  }

  // i. Investimento
  if (hasValue(c.valor)) {
    html += section('Investimento',
      '<div class="card" style="padding:24px;text-align:center;">' +
        '<p style="font-size:1.5rem;font-weight:700;color:var(--cor-primaria,#0057A8);">' + escapeHtml(c.valor) + '</p>' +
      '</div>'
    );
  }

  // j. Contato de Inscrição
  if (hasValue(c.contatoInscricao)) {
    html += section('Contato de Inscrição', '<p>' + escapeHtml(c.contatoInscricao) + '</p>');
  }

  // k. Link de Cadastro
  if (hasValue(c.linkCadastro)) {
    html += section('Cadastro',
      '<div style="text-align:center;">' +
        '<a href="' + escapeAttr(c.linkCadastro) + '" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--lg">' +
          'Fazer minha inscrição' +
        '</a>' +
      '</div>'
    );
  }

  el.innerHTML = html;
}

/* ── WhatsApp CTA ── */
function updateWhatsApp(c) {
  var btn = document.getElementById('curso-whatsapp-btn');
  if (!btn) return;
  var msg = 'Olá! Vim pelo site da UNINOVARE e gostaria de saber mais sobre o curso: ' + c.nome + '.';
  btn.href = 'https://wa.me/558396865555?text=' + encodeURIComponent(msg);
}

/* ── JSON-LD ── */
function updateJsonLd(c) {
  var script = document.getElementById('curso-jsonld');
  if (!script) return;

  var schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': c.nome,
    'description': c.descricao || '',
    'provider': {
      '@type': 'EducationalOrganization',
      'name': 'UNINOVARE',
      'url': 'https://www.uninovare.com.br'
    }
  };

  if (hasValue(c.categoria)) {
    schema.courseCategory = c.categoria;
  }
  if (hasValue(c.nivel)) {
    schema.educationalLevel = c.nivel;
  }
  if (hasValue(c.cargaHoraria)) {
    schema.timeRequired = c.cargaHoraria;
  }
  if (hasValue(c.capa)) {
    schema.image = 'https://www.uninovare.com.br/' + c.capa;
  }
  if (hasValue(c.valor)) {
    schema.offers = {
      '@type': 'Offer',
      'price': c.valor,
      'priceCurrency': 'BRL',
      'availability': 'https://schema.org/InStock'
    };
  }

  script.textContent = JSON.stringify(schema, null, 2);
}

/* ── Helpers ── */

function hasValue(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string' && v.trim() === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function section(title, content) {
  return (
    '<div class="curso-section">' +
      '<h2 class="curso-section__titulo">' + escapeHtml(title) + '</h2>' +
      content +
    '</div>'
  );
}

function infoCard(label, value) {
  return (
    '<div class="card" style="padding:20px;text-align:center;">' +
      '<p class="fine" style="margin-bottom:4px;">' + escapeHtml(label) + '</p>' +
      '<p style="font-size:1.125rem;font-weight:600;">' + escapeHtml(value) + '</p>' +
    '</div>'
  );
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}
