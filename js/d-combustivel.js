// js/d-combustivel.js

let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
    const user = await verificarSessao();
    if (user.cargo !== 'admin') window.location.href = 'maquinas.html';

    document.getElementById('display-date').innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> ${new Date().toLocaleDateString('pt-BR')}`;

    carregarDadosCombustivel();
});

async function carregarDadosCombustivel() {
    try {
        const response = await fetch('api/admin/combustivel_stats.php');
        const data = await response.json();

        // 1. ATUALIZA KPIs
        const k = data.kpis;
        document.getElementById('kpi-total-litros').innerHTML = `${k.litros}<span>L</span>`;
        document.getElementById('kpi-media-lh').innerHTML = `${k.media_lh}<span>L/h</span>`;
        document.getElementById('kpi-custo-total').innerHTML = `R$<span> ${Math.round(k.custo).toLocaleString('pt-BR')}</span>`;
        document.getElementById('kpi-projecao').innerHTML = `R$<span> ${Math.round(k.custo * 22 / 1).toLocaleString('pt-BR')}</span>`;

        // 2. RENDERIZA GRÁFICOS
        Chart.defaults.font.family = "'Montserrat', sans-serif";
        renderizarGraficoLinha(data.chart);
        renderizarGraficoBarras(data.ranking);

        // 3. RENDERIZA LISTA DETALHADA
        renderizarListaMaquinas(data.ranking);

    } catch (e) { console.error("Erro ao carregar dados de combustível", e); }
}

function renderizarGraficoLinha(dados) {
    const ctx = document.getElementById('fuelDailyChart').getContext('2d');
    if (charts['daily']) charts['daily'].destroy();

    charts['daily'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dados.map(d => d.data.split('-')[2]),
            datasets: [{
                label: 'Litros',
                data: dados.map(d => d.litros),
                borderColor: '#1D9E75',
                backgroundColor: 'rgba(29,158,117,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function renderizarGraficoBarras(ranking) {
    const ctx = document.getElementById('fuelMachineChart').getContext('2d');
    if (charts['bar']) charts['bar'].destroy();

    charts['bar'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranking.map(r => `${r.nome} (${r.codigo_tag})`),
            datasets: [{
                label: 'Consumo Hoje (L)',
                data: ranking.map(r => r.litros),
                backgroundColor: '#1D9E75',
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function renderizarListaMaquinas(ranking) {
    const container = document.getElementById('fuel-detail-list');
    container.innerHTML = '';

    if (ranking.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:gray;">Nenhum consumo registrado hoje.</p>';
        return;
    }

    const maxLitros = ranking[0].litros || 1;

    ranking.forEach((m, i) => {
        const pct = (m.litros / maxLitros) * 100;
        const custo = (m.litros * 6.5).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const row = `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
                <div style="width:20px;font-size:12px;font-weight:700;color:var(--text-muted);text-align:center;">${i+1}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;">${m.nome} — ${m.codigo_tag}</div>
                    <div style="font-size:11px;color:var(--text-muted);">Operador: ${m.operador} · ${parseFloat(m.horas).toFixed(1)}h trabalhadas</div>
                </div>
                <div style="width:200px;">
                    <div class="fuel-bar-wrap"><div class="fuel-bar-fill" style="width:${pct}%;background:var(--green-main)"></div></div>
                </div>
                <div style="width:60px;text-align:right;font-size:13px;font-weight:700;">${Math.round(m.litros)} L</div>
                <div style="width:70px;text-align:right;font-size:11px;color:var(--text-muted);">${m.taxa_consumo} L/h</div>
                <div style="width:80px;text-align:right;font-size:13px;font-weight:600;color:var(--green-dark);">${custo}</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', row);
    });
}

window.setChipPeriodo = function(el, tipo) {
    el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    // V2: Implementar filtros de período na API
    showToast("Filtrando período: " + tipo);
    carregarDadosCombustivel();
};
