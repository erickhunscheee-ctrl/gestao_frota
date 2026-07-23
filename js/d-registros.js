// js/d-registros.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = await verificarSessao();
    if (user.cargo !== 'admin') {
        window.location.href = 'maquinas.html';
        return;
    }

    // Define datas padrão (Início do mês até hoje)
    const hoje = new Date().toISOString().split('T')[0];
    const primeiroDia = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    document.getElementById('filter-date-start').value = primeiroDia;
    document.getElementById('filter-date-end').value = hoje;

    carregarTabelaRegistros();
});

async function carregarTabelaRegistros() {
    const start = document.getElementById('filter-date-start').value;
    const end = document.getElementById('filter-date-end').value;

    try {
        // Usamos a API que retorna todos os registros
        const response = await fetch(`api/admin/listar_todos.php?start=${start}&end=${end}`);
        const dados = await response.json();

        const tbody = document.querySelector('#reg-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        let totalHorasPeriodo = 0;
        let totalLitrosPeriodo = 0;
        let pendentes = 0;

        if (dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:40px;">Nenhum registro encontrado neste período.</td></tr>';
        }

        dados.forEach(reg => {
            const hCalc = parseFloat(reg.horimetro_final) - parseFloat(reg.horimetro_inicial);
            const litros = hCalc * parseFloat(reg.taxa_consumo || 0);

            totalHorasPeriodo += hCalc;
            totalLitrosPeriodo += litros;
            if (reg.status !== 'concluido') pendentes++;

            const tr = `
                <tr data-status="${reg.status}">
                    <td>${formatarData(reg.data)}</td>
                    <td>
                        <div class="op-row">
                            <div class="op-av c1" style="width:22px;height:22px;font-size:9px">${reg.usuario_nome.substring(0, 2).toUpperCase()}</div>
                            ${reg.usuario_nome}
                        </div>
                    </td>
                    <td><span style="color:var(--green-main);font-weight:600;font-size:12px;">${reg.unidade || 'OB-001'}</span></td>
                    <td><span class="machine-tag">${reg.codigo_tag}</span></td>
                    <td>${reg.localizacao || '-'}</td>
                    <td>${reg.hora_inicio.substring(0, 5)}</td>
                    <td>${reg.hora_fim.substring(0, 5)}</td>
                    <td><strong>${hCalc.toFixed(1)}h</strong></td>
                    <td>${reg.horimetro_inicial}</td>
                    <td>${reg.horimetro_final}</td>
                    <td>${Math.round(litros)} L</td>
                    <td><span class="badge ${reg.status === 'concluido' ? 'badge-green' : 'badge-amber'}">${reg.status}</span></td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', tr);
        });

        // Atualiza KPIs
        document.getElementById('kpi-total-horas').innerHTML = `${totalHorasPeriodo.toFixed(1)}<span>h</span>`;
        document.getElementById('kpi-total-registros').innerText = dados.length;
        document.getElementById('kpi-total-pendentes').innerText = pendentes;
        document.getElementById('kpi-total-combustivel').innerHTML = `${Math.round(totalLitrosPeriodo)}<span>L</span>`;
        document.getElementById('total-results-count').innerText = dados.length;

    } catch (e) {
        console.error("Erro ao carregar registros", e);
    }
}

// Filtro de pesquisa rápida nas colunas da tabela
window.filtrarTabelaRegistros = function () {
    const searchObra = document.getElementById('search-obra').value.toLowerCase();
    const searchMaq = document.getElementById('search-maquina').value.toLowerCase();
    const searchOp = document.getElementById('search-operador').value.toLowerCase();

    const rows = document.querySelectorAll('#reg-table tbody tr');

    rows.forEach(row => {
        const textObra = row.cells[2].textContent.toLowerCase();
        const textMaq = row.cells[3].textContent.toLowerCase();
        const textOp = row.cells[1].textContent.toLowerCase();

        const matches = textObra.includes(searchObra) &&
            textMaq.includes(searchMaq) &&
            textOp.includes(searchOp);

        row.style.display = matches ? '' : 'none';
    });
};

window.setChipPeriodo = function (el, tipo) {
    el.closest('.filter-chip-row').querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    const hoje = new Date();
    let start = new Date();

    if (tipo === 'hoje') {
        start = hoje;
    } else if (tipo === 'semana') {
        start.setDate(hoje.getDate() - 7);
    } else if (tipo === 'mes') {
        start = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    document.getElementById('filter-date-start').value = start.toISOString().split('T')[0];
    document.getElementById('filter-date-end').value = hoje.toISOString().split('T')[0];

    carregarTabelaRegistros();
};

function formatarData(dataSql) {
    const d = new Date(dataSql);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString('pt-BR');
}

window.exportarCSV = function () {
    const rows = document.querySelectorAll('#reg-table tbody tr');
    let csvContent = "\uFEFF"; // BOM para UTF-8 (Excel abrir corretamente)

    // Cabeçalhos
    csvContent += "Data;Operador;Obra;Máquina;Local;Início;Fim;Horas;Horímetro Inicial;Horímetro Final;Combustível;Status\n";

    let count = 0;
    rows.forEach(row => {
        // Ignorar se a linha estiver oculta ou se for de mensagem (ex: erro/vazio com colspan)
        if (row.style.display === 'none' || row.cells.length < 12) return;

        const data = row.cells[0].textContent.trim();
        // Remove avatar/iniciais do texto do operador
        const operador = row.cells[1].textContent.trim().replace(/^[A-Z]{2}\s+/, '');
        const obra = row.cells[2].textContent.trim();
        const maquina = row.cells[3].textContent.trim();
        const local = row.cells[4].textContent.trim();
        const inicio = row.cells[5].textContent.trim();
        const fim = row.cells[6].textContent.trim();
        const horas = row.cells[7].textContent.trim();
        const horimetroIni = row.cells[8].textContent.trim();
        const horimetroFim = row.cells[9].textContent.trim();
        const combustivel = row.cells[10].textContent.trim();
        const status = row.cells[11].textContent.trim();

        csvContent += `"${data}";"${operador}";"${obra}";"${maquina}";"${local}";"${inicio}";"${fim}";"${horas}";"${horimetroIni}";"${horimetroFim}";"${combustivel}";"${status}"\n`;
        count++;
    });

    if (count === 0) {
        alert("Nenhum registro visível para exportar.");
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    const start = document.getElementById('filter-date-start').value;
    const end = document.getElementById('filter-date-end').value;
    link.setAttribute("download", `relatorio_registros_${start}_a_${end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};