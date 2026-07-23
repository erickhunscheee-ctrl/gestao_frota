//Sidebar, modal, toast e utilitarios compartilhados

function toggleSidebar() {
  const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
}

function initSidebarState() {
  if (localStorage.getItem('sidebar_collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }
}

// Restaura o estado da sidebar o quanto antes
if (document.body) {
  initSidebarState();
}

const SIDEBAR_HTML = `
<aside class="sidebar">
  <div class="sidebar-brand">
    <div class="brand-dot">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L12 11H2L7 2Z" fill="white"/></svg>
    </div>
    <div class="brand-text">
      <span class="brand-name">Verda</span>
      <span class="brand-role">Admin</span>
    </div>
    <button class="sidebar-toggle-btn" onclick="toggleSidebar()" title="Recolher / Expandir Menu">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section-label">Principal</div>

    <a class="nav-item" href="d-dashboard.html" data-page="d-dashboard.html" title="Visão Geral">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      <span class="nav-item-text">Visão Geral</span>
    </a>

    <a class="nav-item" href="d-operadores.html" data-page="d-operadores.html" title="Operadores">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 010 7.75"/></svg>
      <span class="nav-item-text">Operadores</span>
      <span class="nav-badge" id="sidebar-badge-operadores">-</span>
    </a>

    <a class="nav-item" href="d-maquinas.html" data-page="d-maquinas.html" title="Máquinas">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="14" width="8" height="7" rx="1"/><rect x="9" y="9" width="6" height="12" rx="1"/><rect x="16" y="4" width="6" height="17" rx="1"/></svg>
      <span class="nav-item-text">Máquinas</span>
      <span class="nav-badge" id="sidebar-badge-maquinas">-</span>
    </a>

    <div class="nav-section-label">Análise</div>

    <a class="nav-item" href="d-registros.html" data-page="d-registros.html" title="Registros / Dias">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      <span class="nav-item-text">Registros / Dias</span>
    </a>

    <a class="nav-item" href="d-combustivel.html" data-page="d-combustivel.html" title="Combustível">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5M17 13l1.4 5M9 18h6"/></svg>
      <span class="nav-item-text">Combustível</span>
    </a>

    <a class="nav-item" href="d-projecao.html" data-page="d-projecao.html" title="Projeção da Obra">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      <span class="nav-item-text">Projeção da Obra</span>
    </a>

    <div class="nav-section-label">Gestão</div>

    <a class="nav-item" href="d-obras.html" data-page="d-obras.html" title="Obras">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span class="nav-item-text">Obras</span>
      <span class="nav-badge" id="sidebar-badge-obras">-</span>
    </a>
  </nav>

  <div class="sidebar-user">
    <div class="user-avatar" title="Administrador (admin@verda.com)">AD</div>
    <div class="user-info">
      <div class="user-name">Administrador</div>
      <div class="user-role">admin@verda.com</div>
    </div>
  </div>
</aside>`;

/* ── TOPBAR HTML ── */
function TOPBAR_HTML(title, sub, btns = '') {
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  return `
  <div class="topbar">
    <div class="topbar-left">
      <button class="topbar-toggle-btn" onclick="toggleSidebar()" title="Recolher / Expandir Menu">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div class="topbar-titles">
        <span class="topbar-title">${title}</span>
        <span class="topbar-sub">${sub}</span>
      </div>
    </div>
    <div class="topbar-right">
      <div class="date-badge">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        ${today}
      </div>
      ${btns}
    </div>
  </div>`;
}

/* ── MODAL HTML ── */
const MODAL_HTML = `
<div class="modal-overlay" id="modalOverlay" onclick="closeModalOutside(event)">
  <div class="modal-box" id="modalBox">
    <div class="modal-header">
      <div>
        <div class="modal-title" id="modalTitle">Título</div>
        <div class="modal-sub"   id="modalSub">Subtítulo</div>
      </div>
      <button class="modal-close" onclick="closeModal()">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-footer">
      <button class="topbar-btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="topbar-btn btn-primary" onclick="saveModal()">Salvar</button>
    </div>
  </div>
</div>`;

/* ── TOAST HTML ── */
const TOAST_HTML = `
<div class="toast" id="toast">
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
  <span id="toastMsg">Salvo com sucesso!</span>
</div>`;

async function carregarBadgesSidebar() {
  try {
    const res = await fetch('api/admin/sidebar_stats.php');
    if (!res.ok) return;
    const data = await res.json();
    const bOps = document.getElementById('sidebar-badge-operadores');
    const bMaq = document.getElementById('sidebar-badge-maquinas');
    const bObr = document.getElementById('sidebar-badge-obras');
    if (bOps && data.operadores !== undefined) bOps.textContent = data.operadores;
    if (bMaq && data.maquinas !== undefined) bMaq.textContent = data.maquinas;
    if (bObr && data.obras !== undefined) bObr.textContent = data.obras;
  } catch (e) {
    // Silencioso em páginas que não usam sessão admin
  }
}

/* ── INIT: inject sidebar + modal + toast ── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarState();

  // Inject sidebar before the <main>
  const main = document.querySelector('main.main');
  if (main) {
    main.insertAdjacentHTML('beforebegin', SIDEBAR_HTML);
  }

  // Inject modal + toast at end of body
  document.body.insertAdjacentHTML('beforeend', MODAL_HTML + TOAST_HTML);

  // Mark active nav item
  const page = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });

  carregarBadgesSidebar();
});

/* ?? MÁSCARAS E VALIDAÇÕES ?? */
function mascaraTelefone(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    v = v.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
  }
  el.value = v.trim().replace(/-$/, '');
}

function mascaraCPF(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  el.value = v;
  // Valida após digitar 11 dígitos
  const erroEl = document.getElementById('op-cpf-erro');
  if (!erroEl) return;
  const digits = el.value.replace(/\D/g, '');
  if (digits.length === 11) {
    erroEl.style.display = validarCPF(digits) ? 'none' : 'inline-block';
    el.style.borderColor = validarCPF(digits) ? '' : '#EF4444';
  } else {
    erroEl.style.display = 'none';
    el.style.borderColor = '';
  }
}

function validarCPF(cpf) {
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;
  return true;
}

/* ── MODAL FUNCTIONS ── */
function openModal(type, ...args) {
  const f = typeof MODAL_FORMS !== 'undefined' && MODAL_FORMS[type] ? MODAL_FORMS[type](...args) : { title: type, sub: '', html: '' };
  document.getElementById('modalTitle').textContent = f.title;
  document.getElementById('modalSub').textContent = f.sub;
  document.getElementById('modalBody').innerHTML = f.html;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() { const o = document.getElementById('modalOverlay'); if (o) o.classList.remove('open'); }
function closeModalOutside(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }
function saveModal() { closeModal(); showToast('Salvo com sucesso!'); }

const MODAL_FORMS = {
  registro: () => ({
    title: 'Novo Registro de Reporte',
    sub: 'Registrar apontamento de horas e horímetro',
    html: `<div class="form-grid">
      <div class="form-field">
        <label class="form-label">Operador *</label>
        <select class="form-select" id="reg-operador-id">
          <option value="">Carregando operadores...</option>
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">Máquina *</label>
        <select class="form-select" id="reg-maquina-id">
          <option value="">Carregando máquinas...</option>
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">Obra</label>
        <select class="form-select" id="reg-obra-id"><option value="">Carregando obras...</option></select>
      </div>
      <div class="form-field">
        <label class="form-label">Data *</label>
        <input class="form-input" type="date" id="reg-data"/>
      </div>
      <div class="form-field"><label class="form-label">Localização (Obra)</label><input class="form-input" id="reg-localizacao" placeholder="Ex: Obra Norte"/></div>
      <div class="form-field"><label class="form-label">Hora Início *</label><input class="form-input" type="time" id="reg-hora-inicio" value="07:00"/></div>
      <div class="form-field"><label class="form-label">Hora Fim *</label><input class="form-input" type="time" id="reg-hora-fim" value="17:00"/></div>
      <div class="form-field"><label class="form-label">Horímetro Inicial *</label><input class="form-input" type="number" step="0.1" id="reg-horimetro-inicial" placeholder="0.0"/></div>
      <div class="form-field"><label class="form-label">Horímetro Final *</label><input class="form-input" type="number" step="0.1" id="reg-horimetro-final" placeholder="0.0"/></div>
      <div class="form-field"><label class="form-label">Produção (m³)</label><input class="form-input" type="number" id="reg-producao" placeholder="0"/></div>
    </div>`
  }),
  operador: () => ({
    title: 'Novo Operador',
    sub: 'Cadastrar novo operador na plataforma',
    html: `<div class="form-grid">
      <div class="form-field"><label class="form-label">Nome completo</label><input class="form-input" placeholder="Ex: João da Silva"/></div>
      <div class="form-field"><label class="form-label">Cargo / Nível</label><select class="form-select"><option>Operador Sênior</option><option>Operador Pleno</option><option>Operador Júnior</option></select></div>
      <div class="form-field"><label class="form-label">E-mail</label><input class="form-input" type="email" placeholder="joao@empresa.com"/></div>
      <div class="form-field"><label class="form-label">Telefone</label><input class="form-input" placeholder="(51) 9 9999-9999"/></div>
      <div class="form-field"><label class="form-label">CPF</label><input class="form-input" placeholder="000.000.000-00"/></div>
      <div class="form-field"><label class="form-label">Data admissão</label><input class="form-input" type="date"/></div>
      <div class="form-field"><label class="form-label">Máquina padrão</label><select class="form-select"><option>— Nenhuma —</option><option>Escavadeira 320D</option><option>Trator TD14</option><option>Motoniveladora GD825</option><option>Compactador CV213</option><option>Retroescavadeira 416F</option></select></div>
      <div class="form-field"><label class="form-label">Obra vinculada</label><select class="form-select"><option>— Nenhuma —</option><option>OB-001 · Obra Norte</option><option>OB-002 · Pátio Central</option></select></div>
    </div>`
  }),
  maquina: () => ({
    title: 'Cadastrar Máquina',
    sub: 'Adicionar nova máquina à frota',
    html: `<div class="form-grid">
      <div class="form-field full"><label class="form-label">Nome da máquina</label><input class="form-input" placeholder="Ex: Escavadeira 320D"/></div>
      <div class="form-field"><label class="form-label">Código / TAG</label><input class="form-input" placeholder="Ex: EX-320D"/></div>
      <div class="form-field"><label class="form-label">Modelo</label><input class="form-input" placeholder="Ex: Cat 320D"/></div>
      <div class="form-field"><label class="form-label">Ano de fabricação</label><input class="form-input" type="number" placeholder="2020"/></div>
      <div class="form-field"><label class="form-label">Horímetro atual</label><input class="form-input" type="number" placeholder="0"/></div>
      <div class="form-field"><label class="form-label">Consumo médio (L/h)</label><input class="form-input" type="number" step="0.1" placeholder="10.0"/></div>
      <div class="form-field"><label class="form-label">Status</label><select class="form-select"><option>Em uso</option><option>Manutenção</option><option>Inativa</option></select></div>
      <div class="form-field"><label class="form-label">Obra vinculada</label><select class="form-select"><option>— Nenhuma —</option><option>OB-001 · Obra Norte</option><option>OB-002 · Pátio Central</option></select></div>
      <div class="form-field full"><label class="form-label">Observações</label><input class="form-input" placeholder="Informações adicionais..."/></div>
    </div>`
  }),
  obra: () => ({
    title: 'Cadastrar Nova Obra',
    sub: 'Preencha os dados para registrar a obra',
    html: `<div class="form-grid">
      <div class="form-field full"><label class="form-label">Nome da obra</label><input class="form-input" placeholder="Ex: Obra Norte"/></div>
      <div class="form-field"><label class="form-label">Código</label><input class="form-input" placeholder="Ex: OB-001"/></div>
      <div class="form-field"><label class="form-label">Cliente</label><input class="form-input" placeholder="Ex: Construtora A"/></div>
      <div class="form-field"><label class="form-label">Localização</label><input class="form-input" placeholder="Ex: Rua X, Cidade Y"/></div>
      <div class="form-field"><label class="form-label">Status</label><select class="form-select"><option>Em andamento</option><option>Concluída</option><option>Paralisada</option></select></div>
      <div class="form-field"><label class="form-label">Orçamento</label><input class="form-input" type="number" placeholder="0.00"/></div>
      <div class="form-field"><label class="form-label">Data Início</label><input class="form-input" type="date"/></div>
      <div class="form-field"><label class="form-label">Previsão Fim</label><input class="form-input" type="date"/></div>
    </div>`
  }),
  vincular: () => ({
    title: 'Vincular Máquinas e Operadores',
    sub: 'Selecione os recursos para alocar nesta obra',
    html: `<div class="form-grid">
      <div class="form-field full"><label class="form-label">Máquinas Disponíveis</label><select class="form-select" multiple style="height: 100px;"><option>Escavadeira 320D (EX-320D)</option><option>Trator TD14 (TR-14)</option><option>Retroescavadeira 416F (RT-416)</option></select></div>
      <div class="form-field full"><label class="form-label">Operadores Disponíveis</label><select class="form-select" multiple style="height: 100px;"><option>João da Silva (Op. Sênior)</option><option>Maria Oliveira (Op. Pleno)</option><option>Carlos Souza (Op. Júnior)</option></select></div>
    </div>`
  })
};

/* ?? TOAST ?? */
function showToast(msg, color = '') {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  if (color) t.style.background = color;
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); t.style.background = ''; }, 3200);
}

/* ?? TABLE FILTERS ?? */
window.activeFilters = window.activeFilters || {};

function filterTable(el, tableId, status) {
  el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  window.activeFilters[tableId] = window.activeFilters[tableId] || {};
  window.activeFilters[tableId].status = status;

  runTableFiltering(tableId);
}

function searchTable(tableId, q, col) {
  window.activeFilters[tableId] = window.activeFilters[tableId] || {};
  window.activeFilters[tableId].query = q.toLowerCase();
  window.activeFilters[tableId].col = col;

  runTableFiltering(tableId);
}

function runTableFiltering(tableId) {
  const filters = window.activeFilters[tableId] || {};
  const status = filters.status || 'todos';
  const query = filters.query || '';
  const col = filters.col !== undefined ? filters.col : 0;

  document.querySelectorAll('#' + tableId + ' tbody tr').forEach(row => {
    if (row.cells.length < 2) return; // ignora mensagens ou linhas de carregamento

    const rowStatus = row.dataset.status || '';
    const statusMatch = (status === 'todos' || status === 'todas' || rowStatus === status);

    const cell = row.cells[col];
    const cellText = cell ? cell.textContent.toLowerCase() : '';
    const queryMatch = (!query || cellText.includes(query));

    row.style.display = (statusMatch && queryMatch) ? '' : 'none';
  });
}

/* ?? OBRAS FILTERS ?? */
function filterObras(el, status) {
  el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  window.activeFilters.obras = window.activeFilters.obras || {};
  window.activeFilters.obras.status = status;

  runObrasFiltering();
}

function searchObras(q) {
  window.activeFilters.obras = window.activeFilters.obras || {};
  window.activeFilters.obras.query = q.toLowerCase();

  runObrasFiltering();
}

function runObrasFiltering() {
  const filters = window.activeFilters.obras || {};
  const status = filters.status || 'todas';
  const query = filters.query || '';

  document.querySelectorAll('.obra-card').forEach(card => {
    const cardStatus = card.dataset.status || '';
    const statusMatch = (status === 'todas' || cardStatus === status);

    const text = card.textContent.toLowerCase();
    const queryMatch = (!query || text.includes(query));

    const wrap = card.closest('[data-obra-wrap]');
    if (wrap) {
      wrap.style.display = (statusMatch && queryMatch) ? '' : 'none';
    } else {
      card.style.display = (statusMatch && queryMatch) ? '' : 'none';
    }
  });
}

function calcProjection() {
  const meta = parseFloat(document.getElementById('p-meta')?.value) || 4800;
  const done = parseFloat(document.getElementById('p-done')?.value) || 1280;
  const daily = parseFloat(document.getElementById('p-daily')?.value) || 64;
  const price = parseFloat(document.getElementById('p-price')?.value) || 6.5;
  const lh = parseFloat(document.getElementById('p-lh')?.value) || 4.9;

  const remaining = meta - done;
  const daysLeft = Math.ceil(remaining / daily);
  const pct = ((done / meta) * 100).toFixed(1);
  const fuelCost = Math.round(remaining * lh * price);

  const end = new Date();
  end.setDate(end.getDate() + daysLeft);
  const dateStr = end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('r-date', dateStr);
  set('r-days', daysLeft);
  set('r-hours', remaining.toLocaleString('pt-BR') + 'h');
  set('r-pct', pct + '%');
  set('r-cost', 'R$ ' + fuelCost.toLocaleString('pt-BR'));

  showToast('Projeção recalculada!');
}

async function inicializarModalRegistro() {
  const opSelect = document.getElementById('reg-operador-id');
  const maqSelect = document.getElementById('reg-maquina-id');
  const dataInput = document.getElementById('reg-data');
  const obraSelect = document.getElementById('reg-obra-id');

  if (dataInput) {
    dataInput.value = new Date().toISOString().split('T')[0];
  }

  // Carrega Operadores
  try {
    const resOps = await fetch('api/admin/operadores_full.php');
    const dataOps = await resOps.json();
    if (opSelect && dataOps && dataOps.operadores) {
      opSelect.innerHTML = '<option value="">Selecione o operador</option>';
      dataOps.operadores.forEach(op => {
        opSelect.insertAdjacentHTML('beforeend', `<option value="${op.id}">${op.nome} (${op.cargo})</option>`);
      });
    }
  } catch (e) {
    console.error("Erro ao carregar operadores no modal", e);
  }

  // Carrega Máquinas
  try {
    const resMaqs = await fetch('api/maquinas/listar.php');
    const dataMaqs = await resMaqs.json();
    if (maqSelect && dataMaqs) {
      maqSelect.innerHTML = '<option value="">Selecione a máquina</option>';
      dataMaqs.forEach(m => {
        maqSelect.insertAdjacentHTML('beforeend', `<option value="${m.id}" data-horimetro="${m.horimetro_atual}">${m.nome} [${m.codigo_tag}]</option>`);
      });
    }
  } catch (e) {
    console.error("Erro ao carregar máquinas no modal", e);
  }

  // Atualizar horímetro inicial ao selecionar máquina
  try {
    const resObras = await fetch('api/admin/obras/listar.php');
    const dataObras = await resObras.json();
    if (obraSelect && dataObras.obras) {
      obraSelect.innerHTML = '<option value="">Selecione a obra</option>';
      dataObras.obras.filter(o => ['planejada', 'ativa'].includes(o.status)).forEach(o => {
        obraSelect.insertAdjacentHTML('beforeend', `<option value="${o.id}">${o.codigo} - ${o.nome}</option>`);
      });
    }
  } catch (e) {
    if (obraSelect) obraSelect.innerHTML = '<option value="">Obras indisponíveis</option>';
  }

  if (maqSelect) {
    maqSelect.addEventListener('change', () => {
      const selected = maqSelect.options[maqSelect.selectedIndex];
      const horimetroIniInput = document.getElementById('reg-horimetro-inicial');
      if (selected && selected.dataset.horimetro && horimetroIniInput) {
        horimetroIniInput.value = selected.dataset.horimetro;
      }
    });
  }
}
