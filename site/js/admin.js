/* ══════════════════════════════════════════════════════════════
   UNINOVARE — Painel Administrativo de Cursos
   Gerenciamento client-side com localStorage e import/export JSON
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Constantes ── */
  var STORAGE_KEY = 'uninovare_cursos';
  var DATA_URL    = 'data/cursos.json';

  /* ══════════════════════════════════════════════════════════════
     HELPERS — Storage & Slug
     ══════════════════════════════════════════════════════════════ */

  function getCursos() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Erro ao ler cursos do localStorage:', e);
    }
    return null;
  }

  function saveCursos(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.error('Erro ao salvar cursos no localStorage:', e);
      mostrarToast('Erro ao salvar dados. Verifique o armazenamento do navegador.', 'erro');
    }
  }

  function generateSlug(nome) {
    if (!nome) return '';
    // Remove acentos
    var slug = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /* ══════════════════════════════════════════════════════════════
     TOAST — Mensagens de feedback
     ══════════════════════════════════════════════════════════════ */

  function mostrarToast(mensagem, tipo) {
    tipo = tipo || 'sucesso';
    var existente = document.getElementById('admin-toast');
    if (existente) existente.remove();

    var toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'admin-toast admin-toast--' + tipo;
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    // Forcar reflow para animacao
    toast.offsetHeight; // eslint-disable-line no-unused-expressions
    toast.classList.add('admin-toast--visivel');

    setTimeout(function () {
      toast.classList.remove('admin-toast--visivel');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  /* ══════════════════════════════════════════════════════════════
     INICIALIZACAO
     ══════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    var cursos = getCursos();
    if (cursos) {
      renderLista(cursos);
      inicializarEventos();
    } else {
      // Buscar dados iniciais do servidor
      fetch(DATA_URL)
        .then(function (res) {
          if (!res.ok) throw new Error('Erro ao carregar cursos: ' + res.status);
          return res.json();
        })
        .then(function (dados) {
          if (!Array.isArray(dados)) {
            dados = [];
          }
          saveCursos(dados);
          renderLista(dados);
        })
        .catch(function (err) {
          console.error(err);
          // Iniciar com array vazio se falhar
          saveCursos([]);
          renderLista([]);
        })
        .finally(function () {
          inicializarEventos();
        });
    }
  });

  /* ══════════════════════════════════════════════════════════════
     EVENTOS
     ══════════════════════════════════════════════════════════════ */

  function inicializarEventos() {
    // Novo curso
    var btnNovo = document.getElementById('btn-novo-curso');
    if (btnNovo) {
      btnNovo.addEventListener('click', novoCurso);
    }

    // Formulario
    var form = document.getElementById('curso-form');
    if (form) {
      form.addEventListener('submit', salvarCurso);
    }

    // Cancelar
    var btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', cancelarEdicao);
    }

    // Adicionar professor
    var btnAddProf = document.getElementById('btn-add-professor');
    if (btnAddProf) {
      btnAddProf.addEventListener('click', adicionarProfessor);
    }

    // Exportar JSON
    var btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
      btnExportar.addEventListener('click', exportarJSON);
    }

    // Importar JSON
    var btnImportar = document.getElementById('btn-importar');
    if (btnImportar) {
      btnImportar.addEventListener('click', function () {
        var fileInput = document.getElementById('file-importar');
        if (fileInput) fileInput.click();
      });
    }

    var fileInput = document.getElementById('file-importar');
    if (fileInput) {
      fileInput.addEventListener('change', importarJSON);
    }

    // Live preview (debounced)
    var form2 = document.getElementById('curso-form');
    if (form2) {
      var campos = form2.querySelectorAll('input, textarea, select');
      campos.forEach(function (campo) {
        campo.addEventListener('input', debounce(atualizarPreview, 300));
      });
    }
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var contexto = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(contexto, args);
      }, delay);
    };
  }

  /* ══════════════════════════════════════════════════════════════
     RENDERIZACAO DA LISTA
     ══════════════════════════════════════════════════════════════ */

  function renderLista(cursos) {
    var lista = document.getElementById('admin-tabela');
    if (!lista) return;

    cursos = cursos || getCursos() || [];

    // Atualizar subtitulo com contagem
    var subtitulo = document.getElementById('admin-contagem');
    if (subtitulo) {
      subtitulo.textContent = cursos.length + ' curso' + (cursos.length !== 1 ? 's' : '') + ' cadastrado' + (cursos.length !== 1 ? 's' : '');
    }

    // Estado vazio
    if (cursos.length === 0) {
      lista.innerHTML =
        '<div class="admin-vazio">' +
          '<p>Nenhum curso cadastrado.</p>' +
          '<p>Clique em <strong>"Novo Curso"</strong> para adicionar ou <strong>"Importar JSON"</strong> para carregar dados.</p>' +
        '</div>';
      return;
    }

    // Agrupar por categoria
    var grupos = {};
    cursos.forEach(function (c) {
      var cat = c.categoria || 'Sem Categoria';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(c);
    });

    // Ordenar categorias alfabeticamente
    var categoriasOrdenadas = Object.keys(grupos).sort();

    var html = '';
    categoriasOrdenadas.forEach(function (cat) {
      html += '<div class="admin-grupo">';
      html += '<h3 class="admin-grupo__titulo">' + escapeHTML(cat) +
              ' <span class="admin-grupo__contagem">(' + grupos[cat].length + ')</span></h3>';

      grupos[cat].forEach(function (curso) {
        html += '<div class="admin-item" data-id="' + escapeHTML(curso.id) + '">';
        html += '  <div class="admin-item__info">';
        html += '    <strong class="admin-item__nome">' + escapeHTML(curso.nome) + '</strong>';
        html += '    <div class="admin-item__pills">';
        html += '      <span class="admin-pill admin-pill--cat">' + escapeHTML(curso.categoria || '') + '</span>';
        html += '      <span class="admin-pill admin-pill--nivel">' + escapeHTML(curso.nivel || '') + '</span>';
        if (curso.destaque) {
          html += '    <span class="admin-pill admin-pill--destaque">Destaque</span>';
        }
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="admin-item__acoes">';
        html += '    <button class="admin-btn admin-btn--editar" onclick="window._adminEditarCurso(\'' + escapeHTML(curso.id) + '\')">Editar</button>';
        html += '    <button class="admin-btn admin-btn--excluir" onclick="window._adminExcluirCurso(\'' + escapeHTML(curso.id) + '\')">Excluir</button>';
        html += '  </div>';
        html += '</div>';
      });

      html += '</div>';
    });

    lista.innerHTML = html;
  }

  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  /* ══════════════════════════════════════════════════════════════
     NOVO CURSO
     ══════════════════════════════════════════════════════════════ */

  function novoCurso() {
    var form = document.getElementById('curso-form');
    if (form) form.reset();

    var editingId = document.getElementById('f-editing-id');
    if (editingId) editingId.value = '';

    var container = document.getElementById('professores-container');
    if (container) container.innerHTML = '';

    mostrarFormulario();
    atualizarPreview();
  }

  /* ══════════════════════════════════════════════════════════════
     EDITAR CURSO
     ══════════════════════════════════════════════════════════════ */

  function editarCurso(id) {
    var cursos = getCursos() || [];
    var curso = null;
    for (var i = 0; i < cursos.length; i++) {
      if (cursos[i].id === id) { curso = cursos[i]; break; }
    }
    if (!curso) {
      mostrarToast('Curso não encontrado.', 'erro');
      return;
    }

    // Preencher ID de edicao
    var editingId = document.getElementById('f-editing-id');
    if (editingId) editingId.value = curso.id;

    // Preencher campos simples
    setVal('f-nome', curso.nome);
    setVal('f-categoria', curso.categoria);
    setVal('f-nivel', curso.nivel);
    setVal('f-capa', curso.capa);
    setVal('f-descricao', curso.descricao);
    setVal('f-diferencial', curso.diferencial);
    setVal('f-objetivo', curso.objetivo);
    setVal('f-publico', curso.publicoAlvo);
    setVal('f-carga', curso.cargaHoraria);
    setVal('f-duracao', curso.duracao);
    setVal('f-matriz', curso.matrizCurricular);
    setVal('f-valor', curso.valor);
    setVal('f-contato-inscricao', curso.contatoInscricao);
    setVal('f-link-cadastro', curso.linkCadastro);

    // Coordenador
    var coord = curso.coordenador || {};
    setVal('f-coord-nome', coord.nome);
    setVal('f-coord-fone', coord.fone);

    // Destaque
    var destaqueEl = document.getElementById('f-destaque');
    if (destaqueEl) destaqueEl.checked = !!curso.destaque;

    // Professores
    var container = document.getElementById('professores-container');
    if (container) {
      container.innerHTML = '';
      var profs = curso.professores || [];
      profs.forEach(function (prof) {
        adicionarProfessor(null, prof);
      });
    }

    mostrarFormulario();
    atualizarPreview();
  }

  function setVal(id, valor) {
    var el = document.getElementById(id);
    if (el) el.value = valor || '';
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ══════════════════════════════════════════════════════════════
     EXCLUIR CURSO
     ══════════════════════════════════════════════════════════════ */

  function excluirCurso(id) {
    var cursos = getCursos() || [];
    var curso = null;
    for (var i = 0; i < cursos.length; i++) {
      if (cursos[i].id === id) { curso = cursos[i]; break; }
    }
    if (!curso) {
      mostrarToast('Curso não encontrado.', 'erro');
      return;
    }

    var confirmado = confirm('Tem certeza que deseja excluir o curso "' + curso.nome + '"?');
    if (!confirmado) return;

    var novaLista = cursos.filter(function (c) { return c.id !== id; });
    saveCursos(novaLista);
    renderLista(novaLista);
    mostrarToast('Curso "' + curso.nome + '" excluído com sucesso.');
  }

  // Expor funcoes para onclick inline
  window._adminEditarCurso = editarCurso;
  window._adminExcluirCurso = excluirCurso;

  /* ══════════════════════════════════════════════════════════════
     PROFESSORES — Blocos dinamicos
     ══════════════════════════════════════════════════════════════ */

  function adicionarProfessor(evt, dadosExistentes) {
    var container = document.getElementById('professores-container');
    if (!container) return;

    var dados = dadosExistentes || {};
    var index = container.querySelectorAll('.professor-bloco').length;

    var bloco = document.createElement('div');
    bloco.className = 'professor-bloco';
    bloco.innerHTML =
      '<div class="professor-bloco__header">' +
        '<strong>Professor ' + (index + 1) + '</strong>' +
        '<button type="button" class="admin-btn admin-btn--remover-prof">Remover</button>' +
      '</div>' +
      '<div class="professor-bloco__campos">' +
        '<label>Nome:<input type="text" class="prof-nome" value="' + escapeAttr(dados.nome) + '"></label>' +
        '<label>Foto (URL):<input type="text" class="prof-foto" value="' + escapeAttr(dados.foto) + '"></label>' +
        '<label>Titulação:<input type="text" class="prof-titulacao" value="' + escapeAttr(dados.titulacao) + '"></label>' +
        '<label>Mini Currículo:<textarea class="prof-mini-curriculo" rows="3">' + escapeHTML(dados.miniCurriculo) + '</textarea></label>' +
      '</div>';

    // Botao remover
    var btnRemover = bloco.querySelector('.admin-btn--remover-prof');
    btnRemover.addEventListener('click', function () {
      bloco.remove();
      renumerarProfessores();
    });

    container.appendChild(bloco);
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renumerarProfessores() {
    var container = document.getElementById('professores-container');
    if (!container) return;
    var blocos = container.querySelectorAll('.professor-bloco');
    blocos.forEach(function (bloco, i) {
      var titulo = bloco.querySelector('.professor-bloco__header strong');
      if (titulo) titulo.textContent = 'Professor ' + (i + 1);
    });
  }

  function coletarProfessores() {
    var container = document.getElementById('professores-container');
    if (!container) return [];
    var blocos = container.querySelectorAll('.professor-bloco');
    var profs = [];
    blocos.forEach(function (bloco) {
      var nome = (bloco.querySelector('.prof-nome') || {}).value || '';
      var foto = (bloco.querySelector('.prof-foto') || {}).value || '';
      var titulacao = (bloco.querySelector('.prof-titulacao') || {}).value || '';
      var miniCurriculo = (bloco.querySelector('.prof-mini-curriculo') || {}).value || '';

      profs.push({
        foto: foto.trim(),
        nome: nome.trim(),
        miniCurriculo: miniCurriculo.trim(),
        titulacao: titulacao.trim()
      });
    });
    return profs;
  }

  /* ══════════════════════════════════════════════════════════════
     SALVAR CURSO
     ══════════════════════════════════════════════════════════════ */

  function salvarCurso(evt) {
    evt.preventDefault();

    var nome = getVal('f-nome');
    if (!nome) {
      mostrarToast('O nome do curso é obrigatório.', 'erro');
      return;
    }

    var editingId = getVal('f-editing-id');
    var destaqueEl = document.getElementById('f-destaque');

    var cursoData = {
      id: editingId || generateSlug(nome),
      nome: nome,
      categoria: getVal('f-categoria'),
      nivel: getVal('f-nivel'),
      capa: getVal('f-capa'),
      descricao: getVal('f-descricao'),
      diferencial: getVal('f-diferencial'),
      objetivo: getVal('f-objetivo'),
      publicoAlvo: getVal('f-publico'),
      cargaHoraria: getVal('f-carga'),
      duracao: getVal('f-duracao'),
      coordenador: {
        nome: getVal('f-coord-nome'),
        fone: getVal('f-coord-fone')
      },
      professores: coletarProfessores(),
      matrizCurricular: getVal('f-matriz'),
      valor: getVal('f-valor'),
      contatoInscricao: getVal('f-contato-inscricao'),
      linkCadastro: getVal('f-link-cadastro'),
      destaque: destaqueEl ? destaqueEl.checked : false
    };

    var cursos = getCursos() || [];

    if (editingId) {
      // Atualizar existente
      var encontrado = false;
      for (var i = 0; i < cursos.length; i++) {
        if (cursos[i].id === editingId) {
          cursos[i] = cursoData;
          encontrado = true;
          break;
        }
      }
      if (!encontrado) {
        mostrarToast('Curso não encontrado para atualização.', 'erro');
        return;
      }
      mostrarToast('Curso "' + nome + '" atualizado com sucesso.');
    } else {
      // Verificar slug duplicado
      var slugBase = cursoData.id;
      var slugFinal = slugBase;
      var contador = 2;
      while (cursos.some(function (c) { return c.id === slugFinal; })) {
        slugFinal = slugBase + '-' + contador;
        contador++;
      }
      cursoData.id = slugFinal;

      cursos.push(cursoData);
      mostrarToast('Curso "' + nome + '" criado com sucesso.');
    }

    saveCursos(cursos);
    renderLista(cursos);
    ocultarFormulario();
  }

  /* ══════════════════════════════════════════════════════════════
     CANCELAR
     ══════════════════════════════════════════════════════════════ */

  function cancelarEdicao() {
    ocultarFormulario();
  }

  /* ══════════════════════════════════════════════════════════════
     EXIBIR / OCULTAR FORMULARIO
     ══════════════════════════════════════════════════════════════ */

  function mostrarFormulario() {
    var secao = document.getElementById('admin-form-section');
    if (secao) {
      secao.removeAttribute('hidden');
      secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    var preview = document.getElementById('admin-preview');
    if (preview) preview.removeAttribute('hidden');
  }

  function ocultarFormulario() {
    var secao = document.getElementById('admin-form-section');
    if (secao) secao.setAttribute('hidden', '');
    var preview = document.getElementById('admin-preview');
    if (preview) preview.setAttribute('hidden', '');
  }

  /* ══════════════════════════════════════════════════════════════
     EXPORTAR JSON
     ══════════════════════════════════════════════════════════════ */

  function exportarJSON() {
    var cursos = getCursos();
    if (!cursos || cursos.length === 0) {
      mostrarToast('Nenhum curso para exportar.', 'erro');
      return;
    }

    try {
      var json = JSON.stringify(cursos, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.href = url;
      a.download = 'cursos.json';
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      mostrarToast('Arquivo cursos.json exportado com sucesso. Copie-o para a pasta data/ do site.');
    } catch (e) {
      console.error('Erro ao exportar:', e);
      mostrarToast('Erro ao exportar arquivo JSON.', 'erro');
    }
  }

  /* ══════════════════════════════════════════════════════════════
     IMPORTAR JSON
     ══════════════════════════════════════════════════════════════ */

  function importarJSON(evt) {
    var file = evt.target.files && evt.target.files[0];
    if (!file) return;

    // Resetar input para permitir reimportar mesmo arquivo
    var inputRef = evt.target;

    if (!confirm('Isso substituirá todos os cursos atuais. Continuar?')) {
      inputRef.value = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var dados = JSON.parse(e.target.result);

        if (!Array.isArray(dados)) {
          mostrarToast('O arquivo JSON deve conter um array de cursos.', 'erro');
          inputRef.value = '';
          return;
        }

        // Validacao basica: cada item deve ter ao menos nome
        var invalidos = 0;
        dados.forEach(function (item) {
          if (!item.nome) invalidos++;
          // Gerar ID se nao tiver
          if (!item.id) item.id = generateSlug(item.nome || 'curso-sem-nome');
        });

        if (invalidos > 0) {
          mostrarToast('Atenção: ' + invalidos + ' curso(s) sem nome foram importados mesmo assim.', 'erro');
        }

        saveCursos(dados);
        renderLista(dados);
        ocultarFormulario();
        mostrarToast(dados.length + ' curso(s) importado(s) com sucesso.');
      } catch (err) {
        console.error('Erro ao importar JSON:', err);
        mostrarToast('Arquivo JSON inválido. Verifique o formato.', 'erro');
      }

      inputRef.value = '';
    };

    reader.onerror = function () {
      mostrarToast('Erro ao ler o arquivo.', 'erro');
      inputRef.value = '';
    };

    reader.readAsText(file);
  }

  /* ══════════════════════════════════════════════════════════════
     LIVE PREVIEW
     ══════════════════════════════════════════════════════════════ */

  function atualizarPreview() {
    var preview = document.getElementById('admin-preview');
    if (!preview) return;

    var nome = getVal('f-nome');
    var categoria = getVal('f-categoria');
    var nivel = getVal('f-nivel');
    var capa = getVal('f-capa');
    var descricao = getVal('f-descricao');
    var cargaHoraria = getVal('f-carga');
    var duracao = getVal('f-duracao');
    var valor = getVal('f-valor');
    var destaqueEl = document.getElementById('f-destaque');
    var destaque = destaqueEl ? destaqueEl.checked : false;

    if (!nome && !descricao && !categoria) {
      preview.innerHTML = '<p class="admin-preview__vazio">Preencha os campos para visualizar o curso.</p>';
      return;
    }

    var html = '<div class="admin-preview__card">';

    // Imagem de capa
    if (capa) {
      html += '<div class="admin-preview__capa">';
      html += '  <img src="' + escapeAttr(capa) + '" alt="Capa do curso" onerror="this.style.display=\'none\'">';
      html += '</div>';
    }

    html += '<div class="admin-preview__corpo">';

    // Nome
    if (nome) {
      html += '<h4 class="admin-preview__nome">' + escapeHTML(nome) + '</h4>';
    }

    // Pills
    if (categoria || nivel || destaque) {
      html += '<div class="admin-preview__pills">';
      if (categoria) html += '<span class="admin-pill admin-pill--cat">' + escapeHTML(categoria) + '</span>';
      if (nivel) html += '<span class="admin-pill admin-pill--nivel">' + escapeHTML(nivel) + '</span>';
      if (destaque) html += '<span class="admin-pill admin-pill--destaque">Destaque</span>';
      html += '</div>';
    }

    // Descricao
    if (descricao) {
      html += '<p class="admin-preview__descricao">' + escapeHTML(descricao) + '</p>';
    }

    // Detalhes
    if (cargaHoraria || duracao || valor) {
      html += '<div class="admin-preview__detalhes">';
      if (cargaHoraria) html += '<span>Carga: ' + escapeHTML(cargaHoraria) + '</span>';
      if (duracao) html += '<span>Duração: ' + escapeHTML(duracao) + '</span>';
      if (valor) html += '<span>Valor: ' + escapeHTML(valor) + '</span>';
      html += '</div>';
    }

    html += '</div></div>';

    preview.innerHTML = html;
  }

})();
