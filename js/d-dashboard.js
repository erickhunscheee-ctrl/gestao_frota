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
    document.getElementById('display-date').innerText = new Date().toLocaleDateString('pt-BR', options);

    // 3. Carrega os dados reais
    await carregarDadosDashboard();
});

async function carregarDadosDashboard() {
    try {
        const response = await fetch('api/admin/desktop_dashboard.php');
        const data = await response.json();

        // --- ATUALIZA KPIs ---
        const k = data.kpis;
        const precoDiesel = 6.50; // Valor base atualizado para 6.50

        document.getElementById('kpi-ops-ativos').innerText = k.ops || 0;
        document.getElementById('kpi-maq-uso').innerHTML = `${k.maq || 0}<span>/5</span>`;
        document.getElementById('kpi-horas-hoje').innerHTML = `${parseFloat(k.horas).toFixed(1)}<span>h</span>`;
        document.getElementById('kpi-fuel-hoje').innerHTML = `${Math.round(k.litros)}<span>L</span>`;
        
        const custoTotal = k.litros * precoDiesel;
        document.getElementById('kpi-custo-hoje').innerHTML = `R$<span> ${custoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>`;

        // --- RENDERIZA GRÁFICOS ---
        Chart.defaults.font.family = "'Montserrat', sans-serif";
        renderizarGraficoHoras(data.chart_horas);
        renderizarGraficoCombustivel(data.chart_fuel);
        renderizarGraficoStatus(data.chart_status || []);

        // --- OPERADORES EM CAMPO (LIVE) ---
        const liveList = document.getElementById('live-ops-list');
        liveList.innerHTML = '';
        if (data.live_ops.length === 0) {
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

        // --- RANKING COMBUSTÍVEL ---
        const fuelList = document.getElementById('fuel-ranking-list');
        fuelList.innerHTML = '';
        const maxLitros = data.chart_fuel.length > 0 ? data.chart_fuel[0].litros : 1;

        data.chart_fuel.forEach((m, i) => {
            const pct = (m.litros / maxLitros) * 100;
            fuelList.insertAdjacentHTML('beforeend', `
                <div class="fuel-row">
                    <div class="fuel-rank">${i + 1}</div>
                    <div class="fuel-name">${m.nome} (${m.codigo_tag})</div>
                    <div class="fuel-bar-wrap"><div class="fuel-bar-fill" style="width:${pct}%; background:#1D9E75"></div></div>
                    <div class="fuel-liters">${Math.round(m.litros)} L</div>
                </div>
            `);
        });

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
    const ctx = document.getElementById('hoursChart').getContext('2d');
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
    const ctx = document.getElementById('fuelChart').getContext('2d');
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
    const ctx = document.getElementById('statusChart').getContext('2d');
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
            cutout: '70%', 
            plugins: { legend: { display: false } } 
        }
    });
}

window.saveModal = async function () {
    const modalTitle = document.getElementById('modalTitle')?.textContent || '';
    if (modalTitle.includes("Registro") || modalTitle.includes("Apontamento")) {
        const usuario_id = document.getElementById('reg-operador-id')?.value;
        const maquina_id = document.getElementById('reg-maquina-id')?.value;
        const obra_id = document.getElementById('reg-obra-id')?.value || '';
        const data = document.getElementById('reg-data')?.value;
        const localizacao = document.getElementById('reg-localizacao')?.value;
        const hora_inicio = document.getElementById('reg-hora-inicio')?.value;
        const hora_fim = document.getElementById('reg-hora-fim')?.value;
        const horimetro_inicial = document.getElementById('reg-horimetro-inicial')?.value;
        const horimetro_final = document.getElementById('reg-horimetro-final')?.value;
        const producao_m3 = document.getElementById('reg-producao')?.value || 0;

        if (!usuario_id || !maquina_id || !obra_id || !data || !hora_inicio || !hora_fim || !horimetro_inicial || !horimetro_final) {
            showToast("Preencha todos os campos obrigatórios (*)", "#DC2626");
            return;
        }

        const hIni = parseFloat(horimetro_inicial);
        const hFim = parseFloat(horimetro_final);

        if (hFim < hIni) {
            showToast("Horímetro final não pode ser menor que o inicial!", "#DC2626");
            return;
        }

        const payload = {
            usuario_id: parseInt(usuario_id),
            maquina_id: parseInt(maquina_id),
            obra_id: obra_id ? parseInt(obra_id) : null,
            data,
            localizacao,
            hora_inicio,
            hora_fim,
            horimetro_inicial: hIni,
            horimetro_final: hFim,
            producao_m3: parseInt(producao_m3),
            status: 'concluido'
        };

        const btn = document.querySelector('.modal-footer .btn-primary');
        if (btn) { btn.disabled = true; btn.innerText = "Salvando..."; }

        try {
            const response = await fetch('api/admin/create_registro.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resData = await response.json().catch(() => ({}));
            if (response.ok) {
                showToast("Registro inserido com sucesso!", "#1D9E75");
                closeModal();
                if (typeof carregarDadosDashboard === 'function') {
                    carregarDadosDashboard();
                }
            } else {
                showToast(resData.message || "Erro ao salvar registro", "#DC2626");
            }
        } catch (e) {
            console.error(e);
            showToast("Erro de conexão", "#DC2626");
        } finally {
            if (btn) { btn.disabled = false; btn.innerText = "Salvar"; }
        }
    }
};
