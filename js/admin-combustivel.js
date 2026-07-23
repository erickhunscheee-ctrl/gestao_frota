// js/admin-combustivel.js

document.addEventListener('DOMContentLoaded', async () => {
    await verificarSessao();
    carregarPainelCombustivel();
});

async function carregarPainelCombustivel() {
    try {
        const response = await fetch('api/admin/combustivel_stats.php');
        const data = await response.json();

        // 1. ATUALIZA KPIs
        const kpis = document.querySelectorAll('.kpi-num');
        kpis[0].innerHTML = `${data.kpis.litros}<span>L</span>`;
        kpis[1].innerHTML = `${data.kpis.horas}<span>h</span>`;
        kpis[2].innerHTML = `${data.kpis.media_lh}<span>L/h</span>`;
        kpis[3].innerHTML = `R$<span> </span>${(data.kpis.custo / 1000).toFixed(1)}k`;

        // 2. ATUALIZA O GR�FICO DE BARRAS (�LTIMOS 7 DIAS)
        atualizarGraficoBarras(data.chart);

        // 3. ATUALIZA O RANKING
        const rankingContainer = document.querySelector('.list');
        rankingContainer.innerHTML = ''; // Limpa o est�tico

        data.ranking.forEach((item, index) => {
            const custo = (item.litros * 6.5).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const rankNum = index + 1;
            const rankClass = rankNum <= 3 ? `r${rankNum}` : 'rn';
            
            // Calcula largura da barra de progresso (baseada no 1� lugar)
            const maxLitros = data.ranking[0].litros;
            const barWidth = (item.litros / maxLitros) * 100;

            const card = `
                <div class="rank-card">
                    <div class="rank-top">
                        <div class="rank-num ${rankClass}">${rankNum}�</div>
                        <div class="rank-info">
                            <div class="rank-name">${item.nome}</div>
                            <div class="rank-model">${item.codigo_tag} � ${item.horas.toFixed(1)}h trabalhadas</div>
                        </div>
                        <div class="rank-liters">
                            <div class="rank-l-num">${Math.round(item.litros)}</div>
                            <div class="rank-l-label">litros</div>
                        </div>
                    </div>
                    <div class="rank-bar-wrap"><div class="rank-bar-fill" style="width:${barWidth}%; background: var(--green-main)"></div></div>
                    <div class="rank-footer">
                        <span class="rank-meta">Taxa: <span>${item.taxa_consumo} L/h</span></span>
                        <span class="rank-meta">Custo: <span>${custo}</span></span>
                        <span class="rank-meta">Operador: <span>${item.operador.split(' ')[0]}</span></span>
                    </div>
                </div>`;
            rankingContainer.insertAdjacentHTML('beforeend', card);
        });

    } catch (e) { console.error("Erro ao carregar combustivel", e); }
}

function atualizarGraficoBarras(chartData) {
    const bars = document.querySelectorAll('.bar-col');
    // Encontrar o maior valor para escala
    const maxVal = Math.max(...chartData.map(d => d.litros), 10);

    chartData.forEach((day, i) => {
        if (bars[i]) {
            const height = (day.litros / maxVal) * 80; // M�ximo 80px de altura
            const fill = bars[i].querySelector('.bar.b1');
            if (fill) fill.style.height = `${height}px`;
            
            const label = bars[i].querySelector('.bar-day');
            if (label) label.innerText = day.data.split('-')[2]; // Pega s� o dia
        }
    });
}
