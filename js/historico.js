// js/historico.js

// Configura��es iniciais
const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
let dataFoco = new Date(); // Armazena o m�s que o usu�rio est� visualizando

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verifica se o usu�rio est� logado
    const user = await verificarSessao();
    if (document.querySelector('.avatar')) {
        document.querySelector('.avatar').innerText = user.nome.substring(0, 2).toUpperCase();
    }

    // 2. Carrega os dados do m�s atual ao iniciar
    carregarDadosHistorico();
});

/**
 * Fun��o chamada pelos bot�es de seta no HTML
 * @param {number} direcao - (1 para pr�ximo m�s, -1 para m�s anterior)
 */
window.changeMonth = function (direcao) {
    dataFoco.setMonth(dataFoco.getMonth() + direcao);
    carregarDadosHistorico();
}

/**
 * Busca dados no Back-end e atualiza toda a interface
 */
async function carregarDadosHistorico() {
    const mes = dataFoco.getMonth() + 1; // PHP espera 1-12
    const ano = dataFoco.getFullYear();

    // Atualiza o texto do seletor (Ex: Abril 2026)
    document.getElementById('monthLabel').textContent = `${nomesMeses[dataFoco.getMonth()]} ${ano}`;
    console.log(mes);
    try {
        const response = await fetch(`api/registros/historico_full.php?mes=${mes}&ano=${ano}`);
        const data = await response.json();

        // 1. Atualiza os 4 Cards de Resumo (KPIs)
        const statsCards = document.querySelectorAll('.sum-num');
        if (statsCards.length >= 4) {
            statsCards[0].innerHTML = `${parseFloat(data.stats.horas_totais || 0).toFixed(1)}<span>h</span>`;
            statsCards[1].innerText = data.stats.total_apontamentos || 0;
            statsCards[2].innerText = data.stats.maquinas_usadas || 0;
            statsCards[3].innerText = data.stats.dias_trabalhados || 0;
        }

        // 2. Atualiza o gr�fico de barras (Horas por semana)
        atualizarGraficoSemanas(data.logs);

        // 3. Renderiza a Linha do Tempo
        renderizarLinhaDoTempo(data.logs);

    } catch (e) {
        console.error("Erro ao carregar hist�rico:", e);
    }
}

/**
 * Calcula e ajusta a altura das barras do gr�fico baseado nas horas semanais
 */
function atualizarGraficoSemanas(logs) {
    const barContainer = document.getElementById('barsChart');
    if (!barContainer) return;

    // Inicializa 4 semanas com 0 horas
    let horasSemanas = [0, 0, 0, 0];

    logs.forEach(log => {
        const dia = new Date(log.data).getDate();
        const horas = parseFloat(log.horimetro_final) - parseFloat(log.horimetro_inicial);

        if (dia <= 7) horasSemanas[0] += horas;
        else if (dia <= 14) horasSemanas[1] += horas;
        else if (dia <= 21) horasSemanas[2] += horas;
        else horasSemanas[3] += horas;
    });

    // Define a escala (m�ximo de horas para 100% de altura, m�nimo 40h para n�o sumir)
    const maxHoras = Math.max(...horasSemanas, 40);
    const bars = barContainer.querySelectorAll('.bar');

    horasSemanas.forEach((total, i) => {
        if (bars[i]) {
            const porcentagem = (total / maxHoras) * 100;
            // Define altura m�nima de 5% para a barra ser vis�vel
            bars[i].style.height = `${Math.max(porcentagem, 5)}%`;
            // Remove a classe 'dim' se houver horas, adiciona 'current' se for a �ltima semana
            bars[i].classList.toggle('dim', total === 0);
        }
    });
}

function renderizarLinhaDoTempo(logs) {
    const container = document.querySelector('.timeline');
    if (!container) return;

    container.innerHTML = '';

    if (!logs || logs.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#6b7270;">Nenhum registro encontrado.</p>';
        return;
    }

    // 1. Agrupar registros por data
    const gruposPorData = {};
    logs.forEach(log => {
        if (!gruposPorData[log.data]) gruposPorData[log.data] = [];
        gruposPorData[log.data].push(log);
    });

    // 2. Ordenar as datas para garantir que o mais recente apareça primeiro
    const datasOrdenadas = Object.keys(gruposPorData).sort((a, b) => new Date(b) - new Date(a));

    // 3. Itera sobre cada data
    datasOrdenadas.forEach(dataStr => {
        // CORREÇÃO DO INVALID DATE: Quebramos a string "2026-04-20" em partes
        const partes = dataStr.split('-');
        // Criamos o objeto data usando: Ano, Mês (0-11), Dia
        const dataObj = new Date(partes[0], partes[1] - 1, partes[2]);

        const labelData = formatarDataLabel(dataObj);

        let htmlGrupo = `
            <div class="timeline-group">
                <div class="tl-date-label">${labelData}</div>
                <div class="tl-items">
        `;

        gruposPorData[dataStr].forEach(log => {
            const hIni = parseFloat(log.horimetro_inicial || 0);
            const hFim = parseFloat(log.horimetro_final || 0);
            const totalHoras = (hFim - hIni).toFixed(1);

            htmlGrupo += `
                <div class="tl-item">
                    <div class="tl-icon">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1D9E75" stroke-width="1.5">
                            <rect x="2" y="14" width="10" height="6" rx="1"/><rect x="12" y="10" width="8" height="10" rx="1"/>
                            <path d="M6 14V10l4-4h4"/><circle cx="5" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/>
                        </svg>
                    </div>
                    <div class="tl-info">
                        <div class="tl-machine">${log.maquina_nome || 'Máquina'}</div>
                        <div class="tl-meta">${log.codigo_tag || '--'} · ${log.hora_inicio.substring(0, 5)} – ${log.hora_fim.substring(0, 5)}</div>
                    </div>
                    <div class="tl-hours">
                        <div class="tl-h-num">${totalHoras}h</div>
                        <div class="tl-h-label">trabalhadas</div>
                    </div>
                </div>
            `;
        });

        htmlGrupo += `</div></div>`;
        container.insertAdjacentHTML('beforeend', htmlGrupo);
    });
}

/**
 * Formata a data para exibir "Hoje", "Ontem" ou "15 abr"
 */
function formatarDataLabel(data) {
    if (isNaN(data.getTime())) return "Data Indisponível";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataCompara = new Date(data);
    dataCompara.setHours(0, 0, 0, 0);

    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    const formatar = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

    if (dataCompara.getTime() === hoje.getTime()) return "Hoje, " + formatar(data);
    if (dataCompara.getTime() === ontem.getTime()) return "Ontem, " + formatar(data);
    
    return formatar(data);
}