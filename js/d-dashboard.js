// js/d-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verifica sessão (Admin)
    const user = await verificarSessao();
    if (user.cargo !== 'admin') {
        window.location.href = 'maquinas.html';
        return;
    }

    // 2. Atualiza a data na Topbar
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const dateEl = document.getElementById('display-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('pt-BR', options);

    // 3. Carrega os dados reais
    await carregarDadosDashboard();
});

async function carregarDadosDashboard() {
    try {
        const response = await fetch('api/admin/desktop_dashboard.php');
        const data = await response.json();

        // --- ATUALIZA KPIs ---
        const k = data.kpis || {};
        const precoDiesel = 6.50;

        const elOps = document.getElementById('kpi-ops-ativos');
        const elMaq = document.getElementById('kpi-maq-uso');
        const elHoras = document.getElementById('kpi-horas-hoje');
        const elFuel = document.getElementById('kpi-fuel-hoje');
        const elCusto = document.getElementById('kpi-custo-hoje');

        if (elOps) elOps.innerText = k.ops || 0;
        if (elMaq) elMaq.innerHTML = `${k.maq || 0}<span>/${k.total_maq || 0}</span>`;
        if (elHoras) elHoras.innerHTML = `${parseFloat(k.horas || 0).toFixed(1)}<span>h</span>`;
        if (elFuel) elFuel.innerHTML = `${Math.round(k.litros || 0)}<span>L</span>`;
        
        const custoTotal = (k.litros || 0) * precoDiesel;
        if (elCusto) elCusto.innerHTML = `R$<span> ${custoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>`;

        // --- RENDERIZA GRÁFICOS ---
        Chart.defaults.font.family = "'Montserrat', sans-serif";
        if (data.chart_horas) renderizarGraficoHoras(data.chart_horas);
        if (data.chart_fuel) renderizarGraficoCombustivel(data.chart_fuel);
        if (data.chart_status) renderizarGraficoStatus(data.chart_status || []);

        // --- OPERADORES EM CAMPO (LIVE) ---
        const liveList = document.getElementById('live-ops-list');
        if (liveList) {
            liveList.innerHTML = '';
            if (!data.live_ops || data.live_ops.length === 0) {
                liveList.innerHTML = '<p style="text-align:center; padding:20px; color:gray; font-size:12px;">Ninguém em campo agora.</p>';
            } else {
                data.live_ops.forEach(op => {
                    liveList.insertAdjacentHTML('beforeend', `
                        <div class="op-list-item">
                            <div class="op-av-lg c1">${op.iniciais}</div>
                            <div class="op-info-col">
                                <div class="op-name-sm">${op.nome}</div>
                                <div class="op-machine-sm">${op.maquina} · ${op.unidade}</div>
                            </div>
                            <div class="op-hours-col"><div class="op-h-num">${parseFloat(op.horas).toFixed(1)}h</div></div>
                        </div>
                    `);
                });
            }
        }

        // --- RANKING COMBUSTÍVEL ---
        const fuelList = document.getElementById('fuel-ranking-list');
        if (fuelList) {
            fuelList.innerHTML = '';
            const maxLitros = (data.chart_fuel && data.chart_fuel.length > 0) ? data.chart_fuel[0].litros : 1;

            if (data.chart_fuel) {
                data.chart_fuel.forEach((m, i) => {
                    const pct = (m.litros / (maxLitros || 1)) * 100;
                    fuelList.insertAdjacentHTML('beforeend', `
                        <div class="fuel-row">
                            <div class="fuel-rank">${i + 1}</div>
                            <div class="fuel-name">${m.nome} (${m.codigo_tag})</div>
                            <div class="fuel-bar-wrap"><div class="fuel-bar-fill" style="width:${pct}%; background:#1D9E75"></div></div>
                            <div class="fuel-liters">${Math.round(m.litros)} L</div>
                        </div>
                    `);
                });
            }
        }

        // --- ATUALIZA CONTADORES DE TEXTO DO STATUS ---
        if (data.chart_status) {
            data.chart_status.forEach(s => {
                const el = document.getElementById(`status-count-${s.status}`);
                if (el) el.innerText = s.qtd;
            });
        }

    } catch (e) { console.error("Erro ao carregar Dashboard", e); }
}

function renderizarGraficoHoras(dados) {
    const el = document.getElementById('hoursChart');
    if (!el) return;
    const ctx = el.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.data.split('-')[2] + '/' + d.data.split('-')[1]),
            datasets: [{
                label: 'Horas',
                data: dados.map(d => d.total),
                backgroundColor: '#1D9E75',
                borderRadius: 4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: '#f0f4f2' } }, x: { grid: { display: false } } }
        }
    });
}

function renderizarGraficoCombustivel(dados) {
    const el = document.getElementById('fuelChart');
    if (!el) return;
    const ctx = el.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: dados.map(d => `${d.nome} (${d.codigo_tag})`),
            datasets: [{
                data: dados.map(d => d.litros),
                backgroundColor: ['#1D9E75', '#0F6E56', '#F59E0B', '#3B82F6', '#8B5CF6'],
                borderWidth: 0
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '65%', 
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 15 } } } 
        }
    });
}

function renderizarGraficoStatus(dados) {
    const el = document.getElementById('statusChart');
    if (!el) return;
    const ctx = el.getContext('2d');
    const statusValues = { ativa: 0, manutencao: 0, inativa: 0 };
    dados.forEach(d => statusValues[d.status] = d.qtd);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Em uso', 'Manutenção', 'Inativa'],
            datasets: [{
                data: [statusValues.ativa, statusValues.manutencao, statusValues.inativa],
                backgroundColor: ['#1D9E75', '#F59E0B', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '65%', 
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 15 } } } 
        }
    });
}
