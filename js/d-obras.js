let obras = [];
let obraModalAtual = null;
let tipoModalObra = null;
let filtroStatusObra = 'todas';
let buscaObra = '';
const abrirModalCompartilhado = window.openModal;

const statusObra = {
  planejada: { label: 'Planejada', color: '#93C5FD', bg: 'linear-gradient(135deg,#1a4a6e,#1E3A5F)' },
  ativa: { label: 'Em andamento', color: '#9FE1CB', bg: 'var(--green-dark)' },
  pausada: { label: 'Pausada', color: '#FCD34D', bg: 'linear-gradient(135deg,#78350F,#92400E)' },
  finalizada: { label: 'Finalizada', color: '#D1D5DB', bg: 'linear-gradient(135deg,#374151,#1F2937)' },
  cancelada: { label: 'Cancelada', color: '#FCA5A5', bg: 'linear-gradient(135deg,#7F1D1D,#991B1B)' }
};

document.addEventListener('DOMContentLoaded', async () => {
  const user = await verificarSessao();
  if (!user.logged || user.cargo !== 'admin') {
    location.href = user.logged ? 'maquinas.html' : 'login.html';
    return;
  }
  const badge = document.getElementById('obras-date');
  if (badge) badge.lastChild.textContent = ' ' + new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date());
  await carregarObras();
});

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  let data;
  try { data = await response.json(); }
  catch { data = { message: 'O servidor retornou uma resposta inválida.' }; }
  if (!response.ok) throw new Error(data.message || 'Não foi possível concluir a operação.');
  return data;
}

async function carregarObras() {
  const grid = document.getElementById('obras-grid');
  grid.innerHTML = mensagemGrid('Carregando obras...');
  try {
    const data = await requestJson('api/admin/obras/listar.php');
    obras = data.obras || [];
    atualizarKpis(data.stats || {});
    renderizarObras();
    renderizarGrafico();
  } catch (error) {
    grid.innerHTML = mensagemGrid(`<strong style="color:#DC2626">Módulo de obras ainda não ativado</strong><br>${escapeHtml(error.message)}`);
  }
}

function atualizarKpis(s) {
  setText('kpi-obras-ativas', Number(s.ativas || 0));
  setText('kpi-obras-finalizadas', Number(s.finalizadas || 0));
  setText('kpi-obras-horas', `${formatNumber(s.horas)}h`);
  setText('kpi-obras-custo', formatMoney(s.custo));
  setText('kpi-obras-operadores', Number(s.operadores || 0));
}

function renderizarObras() {
  const filtradas = obras.filter(o => {
    const statusOk = filtroStatusObra === 'todas' || o.status === filtroStatusObra;
    return statusOk && `${o.codigo} ${o.nome} ${o.cidade || ''} ${o.cliente || ''}`.toLowerCase().includes(buscaObra);
  });
  document.getElementById('obras-grid').innerHTML = filtradas.length
    ? filtradas.map(cardObra).join('')
    : mensagemGrid('Nenhuma obra encontrada.');
}

function cardObra(o) {
  const visual = statusObra[o.status] || statusObra.planejada;
  const horas = Number(o.horas_realizadas || 0);
  const meta = Number(o.meta_horas || 0);
  const progresso = meta > 0 ? Math.min(100, horas / meta * 100) : 0;
  const combustivel = Number(o.custo_combustivel || 0);
  const maoObra = Number(o.custo_mao_obra || 0);
  const operadores = (o.operadores || []).slice(0, 6);
  const maquinas = (o.maquinas || []).slice(0, 3);
  return `<div data-obra-wrap><div class="obra-card" data-status="${o.status}">
    <div class="obra-header" style="background:${visual.bg}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div><div class="obra-badge-code" style="color:${visual.color}">${escapeHtml(o.codigo)}</div>
          <div class="obra-title-name">${escapeHtml(o.nome)}</div>
          <div class="obra-location">${pinIcon()} ${escapeHtml(localObra(o))}</div></div>
        <span class="obra-status-badge" style="color:${visual.color};border-color:${visual.color}55;background:${visual.color}18">${visual.label}</span>
      </div>
      <div class="obra-dates-grid">
        ${dateBox('Início', o.data_inicio)}${dateBox('Prazo', o.prazo)}${dateBox('Progresso', `${progresso.toFixed(1)}%`, true)}
      </div>
    </div>
    <div class="obra-body">
      <div class="obra-progress-bar"><div class="obra-progress-fill" style="width:${progresso}%;background:var(--green-main)"></div></div>
      <div class="obra-progress-labels"><span>${formatNumber(horas)}h realizadas</span><span>Meta: ${formatNumber(meta)}h</span></div>
      <div class="obra-cost-grid">${costBox('Combustível', combustivel, '#F59E0B')}${costBox('Mão de obra', maoObra, '#3B82F6')}${costBox('Total', combustivel + maoObra, '#1D9E75')}</div>
      <div class="obra-links-grid">
        <div><div class="obra-link-col-title">Operadores (${o.total_operadores || 0})</div><div class="obra-avatars">
          ${operadores.length ? operadores.map(avatarOperador).join('') : vazioVinculo()}</div></div>
        <div><div class="obra-link-col-title">Máquinas (${o.total_maquinas || 0})</div><div class="obra-tags">
          ${maquinas.length ? maquinas.map(m => `<span class="machine-tag">${escapeHtml(m.codigo_tag)}</span>`).join('') : vazioVinculo()}</div></div>
      </div>
      <div class="obra-btn-row">
        <button class="topbar-btn btn-outline" onclick="openModal('obra',${o.id})">Editar</button>
        <button class="topbar-btn btn-outline" onclick="openModal('vincular',${o.id})">Gerenciar vínculos</button>
        <button class="topbar-btn btn-primary" onclick="openDetail(${o.id})">Ver detalhes</button>
      </div>
    </div></div></div>`;
}

function dateBox(label, content, raw = false) {
  return `<div class="obra-date-item"><div class="obra-date-label">${label}</div><div class="obra-date-value">${raw ? content : formatDate(content)}</div></div>`;
}
function costBox(label, valueNumber, color) {
  return `<div class="obra-cost-item" style="background:${color}0D;border-color:${color}33"><div class="obra-cost-label">${label}</div><div class="obra-cost-value" style="color:${color}">${formatMoney(valueNumber)}</div></div>`;
}
function avatarOperador(op) {
  return `<div class="obra-av ${escapeHtml(op.cor_avatar || '')}" title="${escapeHtml(op.nome)}">${escapeHtml(op.iniciais || iniciais(op.nome))}</div>`;
}

window.filterObrasPage = (el, status) => {
  el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
  el.classList.add('active'); filtroStatusObra = status; renderizarObras();
};
window.searchObrasPage = query => { buscaObra = query.trim().toLowerCase(); renderizarObras(); };

window.openModal = function (type, ...args) {
  if (type === 'obra') return abrirModalObra(args[0]);
  if (type === 'vincular') return abrirModalVinculos(args[0]);
  return abrirModalCompartilhado(type, ...args);
};

function exibirModal(title, sub, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalSub').textContent = sub;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}

function abrirModalObra(id = null) {
  tipoModalObra = 'obra';
  obraModalAtual = id ? obras.find(o => Number(o.id) === Number(id)) : null;
  const o = obraModalAtual || {};
  exibirModal(o.id ? 'Editar obra' : 'Cadastrar nova obra', 'Informações gerais, prazo e localização', `
    <div class="form-grid">
      ${field('Nome da obra *', 'obra-nome', o.nome, 'text', true)}${field('Código *', 'obra-codigo', o.codigo)}
      ${selectField('Status', 'obra-status', o.status || 'planejada')}${field('Cliente / Contratante', 'obra-cliente', o.cliente, 'text', true)}
      ${field('Data de início', 'obra-inicio', o.data_inicio, 'date')}${field('Prazo de conclusão', 'obra-prazo', o.prazo, 'date')}
      ${field('Meta de horas', 'obra-meta', o.meta_horas, 'number')}${field('Orçamento (R$)', 'obra-orcamento', o.orcamento, 'number')}
      ${field('Endereço', 'obra-endereco', o.endereco, 'text', true)}${field('Cidade', 'obra-cidade', o.cidade)}
      ${field('Estado', 'obra-estado', o.estado || 'RS')}${field('Latitude', 'obra-latitude', o.latitude, 'number')}
      ${field('Longitude', 'obra-longitude', o.longitude, 'number')}
      <div class="form-field full"><label class="form-label">Descrição / Escopo</label><textarea class="form-input form-textarea" id="obra-descricao" style="height:72px">${escapeHtml(o.descricao || '')}</textarea></div>
    </div>`);
}

async function abrirModalVinculos(id = null) {
  tipoModalObra = 'vincular';
  obraModalAtual = id ? obras.find(o => Number(o.id) === Number(id)) : null;
  exibirModal('Vincular recursos', 'Associe operadores e máquinas a uma obra', `
    <div class="form-field" style="margin-bottom:16px"><label class="form-label">Obra *</label>
      <select class="form-select" id="vinculo-obra" onchange="carregarRecursosObra(this.value)"><option value="">Selecione a obra</option>
        ${obras.map(o => `<option value="${o.id}" ${obraModalAtual?.id == o.id ? 'selected' : ''}>${escapeHtml(o.codigo)} - ${escapeHtml(o.nome)}</option>`).join('')}
      </select></div><div id="recursos-obra">${mensagemRecursos('Selecione uma obra.')}</div>`);
  if (obraModalAtual) await carregarRecursosObra(obraModalAtual.id);
}

window.carregarRecursosObra = async obraId => {
  const container = document.getElementById('recursos-obra');
  if (!obraId) { obraModalAtual = null; container.innerHTML = mensagemRecursos('Selecione uma obra.'); return; }
  obraModalAtual = obras.find(o => Number(o.id) === Number(obraId));
  container.innerHTML = mensagemRecursos('Carregando recursos...');
  try {
    const data = await requestJson(`api/admin/obras/recursos.php?obra_id=${encodeURIComponent(obraId)}`);
    const ops = new Set((data.selecionados.operadores || []).map(Number));
    const maqs = new Set((data.selecionados.maquinas || []).map(Number));
    container.innerHTML = checkSection('Operadores', 'vinculo-operador', data.operadores, ops, i => i.nome, i => i.cargo || 'Operador') +
      checkSection('Máquinas', 'vinculo-maquina', data.maquinas, maqs, i => i.nome, i => `${i.codigo_tag}${i.modelo ? ' · ' + i.modelo : ''}`);
  } catch (error) { container.innerHTML = mensagemRecursos(error.message, '#DC2626'); }
};

function checkSection(title, className, items, selected, name, meta) {
  return `<div style="margin-bottom:18px"><div class="obra-link-col-title" style="margin-bottom:8px">${title}</div><div class="check-list">
    ${items.length ? items.map(i => `<label class="check-item"><input class="${className}" type="checkbox" value="${i.id}" ${selected.has(Number(i.id)) ? 'checked' : ''}/><span class="check-item-name">${escapeHtml(name(i))}</span><span class="check-item-meta">${escapeHtml(meta(i))}</span></label>`).join('') : mensagemRecursos('Nenhum recurso cadastrado.')}</div></div>`;
}

window.saveModal = async function () {
  const button = document.querySelector('#modalOverlay .btn-primary'); button.disabled = true;
  try {
    if (tipoModalObra === 'obra') await salvarObra();
    else if (tipoModalObra === 'vincular') await salvarVinculos();
    else return;
    closeModal(); await carregarObras();
  } catch (error) { showToast(error.message, '#DC2626'); }
  finally { button.disabled = false; }
};

async function salvarObra() {
  const payload = {
    id: obraModalAtual?.id || null, nome: value('obra-nome'), codigo: value('obra-codigo'), status: value('obra-status'),
    cliente: value('obra-cliente'), data_inicio: value('obra-inicio'), prazo: value('obra-prazo'), meta_horas: value('obra-meta'),
    orcamento: value('obra-orcamento'), endereco: value('obra-endereco'), cidade: value('obra-cidade'), estado: value('obra-estado').toUpperCase(),
    latitude: value('obra-latitude'), longitude: value('obra-longitude'), descricao: value('obra-descricao')
  };
  if (!payload.nome || !payload.codigo) throw new Error('Informe o código e o nome da obra.');
  const result = await requestJson('api/admin/obras/salvar.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  showToast(result.message);
}

async function salvarVinculos() {
  const obraId = Number(document.getElementById('vinculo-obra')?.value || 0);
  if (!obraId) throw new Error('Selecione uma obra.');
  const marcados = cls => [...document.querySelectorAll(`.${cls}:checked`)].map(el => Number(el.value));
  const result = await requestJson('api/admin/obras/vincular.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({obra_id:obraId, operadores:marcados('vinculo-operador'), maquinas:marcados('vinculo-maquina')}) });
  showToast(result.message);
}

window.openDetail = id => {
  const o = obras.find(item => Number(item.id) === Number(id)); if (!o) return;
  const visual = statusObra[o.status] || statusObra.planejada;
  const horas = Number(o.horas_realizadas || 0), meta = Number(o.meta_horas || 0), progresso = meta ? Math.min(100, horas / meta * 100) : 0;
  const rowsOps = (o.operadores || []).map(op => `<tr><td>${escapeHtml(op.nome)}</td><td>${escapeHtml(op.funcao || op.cargo || 'Operador')}</td></tr>`).join('');
  const rowsMaq = (o.maquinas || []).map(m => `<tr><td><span class="machine-tag">${escapeHtml(m.codigo_tag)}</span></td><td>${escapeHtml(m.nome)}</td><td>${formatNumber(m.taxa_consumo)} L/h</td></tr>`).join('');
  document.getElementById('detailPanel').innerHTML = `<div style="position:relative;background:${visual.bg};padding:28px"><button class="detail-close" onclick="closeDetail()">×</button><div class="obra-badge-code" style="color:${visual.color}">${escapeHtml(o.codigo)}</div><div style="font-size:22px;font-weight:800;color:#fff">${escapeHtml(o.nome)}</div><div style="font-size:12px;color:rgba(255,255,255,.65);margin-top:4px">${escapeHtml(localObra(o))}</div></div>
    <div class="detail-body"><div class="detail-section-title">Informações gerais</div><div class="detail-info-grid">${infoDetail('Cliente',o.cliente||'Não informado')}${infoDetail('Status',visual.label)}${infoDetail('Início',formatDate(o.data_inicio))}${infoDetail('Prazo',formatDate(o.prazo))}${infoDetail('Progresso',`${progresso.toFixed(1)}% (${formatNumber(horas)}h / ${formatNumber(meta)}h)`)}${infoDetail('Orçamento',formatMoney(o.orcamento))}</div>
    <div class="detail-section-title">Operadores vinculados</div><table class="detail-table"><thead><tr><th>Operador</th><th>Função</th></tr></thead><tbody>${rowsOps||'<tr><td colspan="2">Nenhum operador vinculado.</td></tr>'}</tbody></table>
    <div class="detail-section-title">Máquinas vinculadas</div><table class="detail-table"><thead><tr><th>Código</th><th>Máquina</th><th>Consumo</th></tr></thead><tbody>${rowsMaq||'<tr><td colspan="3">Nenhuma máquina vinculada.</td></tr>'}</tbody></table>
    <div style="display:flex;gap:10px;margin-top:20px"><button class="topbar-btn btn-outline" style="flex:1;justify-content:center" onclick="closeDetail();openModal('obra',${o.id})">Editar obra</button><button class="topbar-btn btn-primary" style="flex:1;justify-content:center" onclick="closeDetail();openModal('vincular',${o.id})">Gerenciar vínculos</button></div></div>`;
  document.getElementById('detailOverlay').classList.add('open');
};

function renderizarGrafico() {
  const canvas = document.getElementById('obrasChart'); if (!canvas || typeof Chart === 'undefined') return;
  Chart.getChart(canvas)?.destroy();
  new Chart(canvas, { type:'bar', data:{ labels:obras.map(o=>`${o.codigo} · ${o.nome}`), datasets:[
    {label:'Combustível (R$)',data:obras.map(o=>Number(o.custo_combustivel||0)),backgroundColor:'#1D9E75',borderRadius:4},
    {label:'Mão de obra (R$)',data:obras.map(o=>Number(o.custo_mao_obra||0)),backgroundColor:'rgba(29,158,117,.25)',borderRadius:4}
  ]}, options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{x:{grid:{display:false}},y:{beginAtZero:true}}} });
}

function field(label,id,text='',type='text',full=false) { return `<div class="form-field ${full?'full':''}"><label class="form-label">${label}</label><input class="form-input" id="${id}" type="${type}" ${type==='number'?'step="0.01"':''} value="${escapeHtml(text??'')}"/></div>`; }
function selectField(label,id,selected) { const ops=[['planejada','Planejada'],['ativa','Em andamento'],['pausada','Pausada'],['finalizada','Finalizada'],['cancelada','Cancelada']]; return `<div class="form-field"><label class="form-label">${label}</label><select class="form-select" id="${id}">${ops.map(([v,l])=>`<option value="${v}" ${v===selected?'selected':''}>${l}</option>`).join('')}</select></div>`; }
function infoDetail(label,content) { return `<div class="detail-info-item"><div class="dii-label">${label}</div><div class="dii-value">${escapeHtml(content)}</div></div>`; }
function mensagemGrid(text) { return `<div class="card" style="grid-column:1/-1;padding:28px;text-align:center;color:var(--text-muted)">${text}</div>`; }
function mensagemRecursos(text,color='var(--text-muted)') { return `<div style="padding:14px;text-align:center;color:${color}">${escapeHtml(text)}</div>`; }
function vazioVinculo() { return '<span style="font-size:11px;color:var(--text-muted)">Nenhum vínculo</span>'; }
function pinIcon() { return '<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'; }
function localObra(o) { return [o.endereco,o.cidade,o.estado].filter(Boolean).join(' · ') || 'Localização não informada'; }
function formatDate(date) { if (!date) return '—'; const [y,m,d]=String(date).slice(0,10).split('-'); return `${d}/${m}/${y}`; }
function formatMoney(n) { return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function formatNumber(n) { return Number(n||0).toLocaleString('pt-BR',{maximumFractionDigits:1}); }
function iniciais(nome='') { return nome.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase(); }
function value(id) { return document.getElementById(id)?.value?.trim() || ''; }
function setText(id,content) { const el=document.getElementById(id); if(el) el.textContent=content; }
function escapeHtml(text) { return String(text??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
