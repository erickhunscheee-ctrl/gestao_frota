/* ═══════════════════════════════════════════════════
   VERDA ADMIN — shared.js
   Sidebar, modal, toast e utilitários compartilhados
═══════════════════════════════════════════════════ */

/* ── SIDEBAR HTML ── */
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
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section-label">Principal</div>

    <a class="nav-item" href="d-dashboard.html" data-page="d-dashboard.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      Visão Geral
    </a>

    <a class="nav-item" href="d-operadores.html" data-page="d-operadores.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
      Operadores
      <span class="nav-badge">8</span>
    </a>

    <a class="nav-item" href="d-maquinas.html" data-page="d-maquinas.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="14" width="8" height="7" rx="1"/><rect x="9" y="9" width="6" height="12" rx="1"/><rect x="16" y="4" width="6" height="17" rx="1"/></svg>
      Máquinas
      <span class="nav-badge">5</span>
    </a>

    <div class="nav-section-label">Análise</div>

    <a class="nav-item" href="d-registros.html" data-page="d-registros.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      Registros / Dias
    </a>

    <a class="nav-item" href="d-combustivel.html" data-page="d-combustivel.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5M17 13l1.4 5M9 18h6"/></svg>
      Combustível
    </a>

    <a class="nav-item" href="d-projecao.html" data-page="d-projecao.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      Projeção da Obra
    </a>

    <div class="nav-section-label">Gestão</div>

    <a class="nav-item" href="d-obras.html" data-page="d-obras.html">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      Obras
      <span class="nav-badge">3</span>
    </a>
  </nav>

  <div class="sidebar-user">
    <div class="user-avatar">AD</div>
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
      <span class="topbar-title">${title}</span>
      <span class="topbar-sub">${sub}</span>
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

/* ── INIT: inject sidebar + modal + toast ── */
document.addEventListener('DOMContentLoaded', () => {
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
});

/* ── MODAL FUNCTIONS ── */
function openModal(type, ...args) {
    const f = MODAL_FORMS[type] ? MODAL_FORMS[type](...args) : { title: type, sub: '', html: '' };
    document.getElementById('modalTitle').textContent = f.title;
    document.getElementById('modalSub').textContent = f.sub;
    document.getElementById('modalBody').innerHTML = f.html;
    document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
function closeModalOutside(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }
function saveModal() { closeModal(); showToast('Salvo com sucesso!'); }

/* ── MODAL FORMS (shared entre páginas) ── */
const MODAL_FORMS = {
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
      <div class="form-field"><label class="form-label">Código</label><input class="form-input" placeholder="Ex: OB-003"/></div>
      <div class="form-field"><label class="form-label">Cliente / Contratante</label><input class="form-input" placeholder="Ex: Prefeitura de Lajeado"/></div>
      <div class="form-field full"><label class="form-label">Endereço completo</label><input class="form-input" placeholder="Rua, número, bairro"/></div>
      <div class="form-field"><label class="form-label">Cidade</label><input class="form-input" placeholder="Lajeado"/></div>
      <div class="form-field"><label class="form-label">Estado</label><select class="form-select"><option>RS</option><option>SC</option><option>PR</option><option>SP</option></select></div>
      <div class="form-field"><label class="form-label">Latitude</label><input class="form-input" type="number" step="0.0001" placeholder="-29.4674"/></div>
      <div class="form-field"><label class="form-label">Longitude</label><input class="form-input" type="number" step="0.0001" placeholder="-51.9618"/></div>
      <div class="form-field"><label class="form-label">Data de início</label><input class="form-input" type="date"/></div>
      <div class="form-field"><label class="form-label">Prazo de conclusão</label><input class="form-input" type="date"/></div>
      <div class="form-field"><label class="form-label">Meta de horas</label><input class="form-input" type="number" placeholder="4800"/></div>
      <div class="form-field"><label class="form-label">Orçamento total (R$)</label><input class="form-input" type="number" placeholder="350000"/></div>
      <div class="form-field full"><label class="form-label">Descrição / Escopo</label><textarea class="form-textarea form-input" style="height:72px;" placeholder="Descreva o escopo da obra..."></textarea></div>
    </div>`
    }),

    vincular: (obraId, obraNome) => ({
        title: `Vincular recursos — ${obraNome}`,
        sub: `${obraId} · Selecione operadores e máquinas`,
        html: `
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Selecione os operadores e máquinas que serão alocados nesta obra.</p>
    <div style="margin-bottom:18px;">
      <div style="font-size:12px;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">Operadores</div>
      <div class="check-list">
        <label class="check-item"><input type="checkbox" checked/><span class="check-item-name">João Silva</span><span class="check-item-meta">Sênior · Escavadeira 320D</span></label>
        <label class="check-item"><input type="checkbox" checked/><span class="check-item-name">Marcos Rocha</span><span class="check-item-meta">Pleno · Trator TD14</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Lucas Alves</span><span class="check-item-meta">Pleno · Motoniveladora</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Pedro Costa</span><span class="check-item-meta">Pleno · Compactador</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Rafael Lima</span><span class="check-item-meta">Pleno · Retroescavadeira</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Carlos Souza</span><span class="check-item-meta">Júnior · Sem máquina</span></label>
      </div>
    </div>
    <div>
      <div style="font-size:12px;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">Máquinas</div>
      <div class="check-list">
        <label class="check-item"><input type="checkbox" checked/><span class="check-item-name">Escavadeira 320D</span><span class="check-item-meta">EX-320D · Cat 320D · 2019</span></label>
        <label class="check-item"><input type="checkbox" checked/><span class="check-item-name">Trator TD14</span><span class="check-item-meta">TR-014 · John Deere · 2021</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Motoniveladora GD825</span><span class="check-item-meta">MN-825 · Komatsu · 2020</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Compactador CV213</span><span class="check-item-meta">CP-213 · Dynapac · 2018 · ⚠️ Em manutenção</span></label>
        <label class="check-item"><input type="checkbox"/><span class="check-item-name">Retroescavadeira 416F</span><span class="check-item-meta">RE-416F · Cat · 2017</span></label>
      </div>
    </div>`
    }),
};

/* ── TOAST ── */
function showToast(msg, color = '') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    if (color) t.style.background = color;
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); t.style.background = ''; }, 3200);
}

/* ── TABLE FILTERS ── */
function filterTable(el, tableId, status) {
    el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('#' + tableId + ' tbody tr').forEach(row => {
        row.style.display = (status === 'todos' || row.dataset.status === status) ? '' : 'none';
    });
}

function searchTable(tableId, q, col) {
    q = q.toLowerCase();
    document.querySelectorAll('#' + tableId + ' tbody tr').forEach(row => {
        const cell = row.cells[col];
        row.style.display = cell && cell.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

/* ── OBRAS FILTERS ── */
function filterObras(el, status) {
    el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.obra-card').forEach(card => {
        card.closest('[data-obra-wrap]').style.display =
            (status === 'todas' || card.dataset.status === status) ? '' : 'none';
    });
}

function searchObras(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.obra-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.closest('[data-obra-wrap]').style.display = text.includes(q) ? '' : 'none';
    });
}

/* ── PROJECTION CALC ── */
function calcProjection() {
    const meta = parseFloat(document.getElementById('p-meta')?.value) || 4800;
    const done = parseFloat(document.getElementById('p-done')?.value) || 1280;
    const daily = parseFloat(document.getElementById('p-daily')?.value) || 64;
    const price = parseFloat(document.getElementById('p-price')?.value) || 4.5;
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