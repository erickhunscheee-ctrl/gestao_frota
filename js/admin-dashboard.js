// js/admin-desktop.js

// Variáveis para armazenar as instâncias dos gráficos (para podermos destruir/recriar)
let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Proteção e Dados do Usuário
    const user = await verificarSessao();
    if (user.cargo !== 'admin') window.location.href = 'maquinas.html';
    
    document.querySelector('.user-name').innerText = user.nome;
    document.querySelector('.user-avatar').innerText = user.nome.substring(0,2).toUpperCase();

    // 2. Inicia na aba Dashboard
    carregarViewDashboard();
});

// --- CONTROLE DE NAVEGAÇÃO (ABAS) ---
window.showView = function(name) {
    // Esconde todas e mostra a selecionada
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById('view-' + name).classList.add('active');
    event.currentTarget.classList.add('active');

    // Títulos dinâmicos
    const titles = {
        dashboard: ['Dashboard', 'Visão geral da frota'],
        operadores: ['Operadores', 'Gerenciar operadores da frota'],
        maquinas: ['Máquinas', 'Gerenciar frota de máquinas'],
        registros: ['Registros / Dias', 'Consultar apontamentos por período'],
        combustivel: ['Combustível', 'Análise de consumo'],
        projecao: ['Projeção da Obra', 'Estimativa de conclusão']
    };
    document.getElementById('topbarTitle').textContent = titles[name][0];
    document.getElementById('topbarSub').textContent = titles[name][1];

    // Carrega os dados específicos da aba
    if (name === 'dashboard') carregarViewDashboard();
    if (name === 'operadores') carregarViewOperadores();
    if (name === 'maquinas') carregarViewMaquinas();
    if (name === 'registros') carregarViewRegistros();
    if (name === 'combustivel') carregarViewCombustivel();
};

// --- FUNÇÕES DE CARREGAMENTO POR ABA ---

async function carregarViewDashboard() {
    const res = await fetch('api/admin/desktop_dashboard.php');
    const data = await response.json();

    // KPIs
    const kpis = document.querySelectorAll('.kpi-value');
    kpis[0].innerText = data.kpis.ops;
    kpis[1].innerHTML = `${data.kpis.maq}<span>/5</span>`;
    kpis[2].innerHTML = `${data.kpis.horas}<span>h</span>`;
    kpis[3].innerHTML = `${data.kpis.litros}<span>L</span>`;
    kpis[4].innerHTML = `R$<span> ${(data.kpis.custo / 1000).toFixed(1)}k</span>`;

    // Gráfico de Horas (Barra)
    renderChart('hoursChart', 'bar', {
        labels: data.chart_horas.map(d => d.data.split('-')[2]+'/'+d.data.split('-')[1]),
        datasets: [{ label: 'Horas', data: data.chart_horas.map(d => d.total), backgroundColor: '#1D9E75' }]
    });

    // Gráfico de Combustível (Doughnut)
    renderChart('fuelChart', 'doughnut', {
        labels: data.chart_fuel.map(d => d.nome),
        datasets: [{ data: data.chart_fuel.map(d => d.litros), backgroundColor: ['#1D9E75','#0F6E56','#F59E0B','#3B82F6','#8B5CF6'] }]
    });
    
    // Lista Operadores Live
    const liveList = document.querySelector('.card-body-sm');
    liveList.innerHTML = data.live_ops.map(op => `
        <div class="op-list-item">
            <div class="op-av-lg c1">${op.iniciais}</div>
            <div class="op-info-col">
                <div class="op-name-sm">${op.nome}</div>
                <div class="op-machine-sm">${op.maquina}</div>
            </div>
            <div class="op-hours-col"><div class="op-h-num">${parseFloat(op.horas).toFixed(1)}h</div></div>
        </div>
    `).join('');
}

async function carregarViewOperadores() {
    const res = await fetch('api/admin/operadores_full.php');
    const data = await res.json();
    const tbody = document.querySelector('#op-table tbody');
    tbody.innerHTML = data.operadores.map(op => `
        <tr>
            <td><div class="op-row"><div class="op-av c1">${op.iniciais}</div>${op.nome}</div></td>
            <td><span class="badge ${op.status_real === 'working' ? 'badge-green' : 'badge-gray'}">${op.status_real}</span></td>
            <td><span class="machine-tag">${op.maquina_nome || '?'}</span></td>
            <td>${op.unidade}</td>
            <td>${parseFloat(op.horas_hoje || 0).toFixed(1)}h</td>
            <td>${Math.round(op.fuel_hoje || 0)} L</td>
            <td>${op.horimetro_final || '?'}</td>
        </tr>
    `).join('');
}

// --- UTILITÁRIOS ---

function renderChart(id, type, data) {
    if (charts[id]) charts[id].destroy(); // Destrói se já existir para evitar bugs
    const ctx = document.getElementById(id).getContext('2d');
    charts[id] = new Chart(ctx, {
        type: type,
        data: data,
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Funções do Modal (vão enviar dados para as APIs que criamos em Maquina.php e Usuario.php)
window.openModal = function(type) {
    // Sua lógica de preencher o modalForm (pode manter a do seu HTML original aqui)
    document.getElementById('modalOverlay').classList.add('open');
};

window.closeModal = function() {
    document.getElementById('modalOverlay').classList.remove('open');
};

window.saveModal = async function() {
    // Aqui faremos o POST para api/usuarios/create.php ou api/maquinas/create.php
    alert("Funcionalidade de salvamento será integrada na próxima etapa!");
    closeModal();
};