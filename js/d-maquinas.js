// js/d-maquinas.js

let maquinaEmEdicaoId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verifica sessão (Admin)
    const user = await verificarSessao();
    if (user.cargo !== 'admin') {
        window.location.href = 'maquinas.html';
        return;
    }

    // 2. Carrega a lista de máquinas
    carregarTabelaMaquinas();
});

// --- BUSCAR E LISTAR MÁQUINAS ---
async function carregarTabelaMaquinas() {
    try {
        const response = await fetch('api/admin/maquinas_painel.php');
        const data = await response.json();

        const tbody = document.querySelector('#mq-table tbody');
        if (!tbody) return;

        // Atualiza os contadores nos chips de filtro baseados na API
        const chips = document.querySelectorAll('.filter-chip-row .fchip');
        if (chips.length >= 4) {
            chips[0].innerText = `Todas (${data.stats.total})`;
            chips[1].innerText = `Em uso (${data.stats.em_uso})`;
            chips[2].innerText = `Manutenção (${data.stats.manutencao})`;
            chips[3].innerText = `Inativa (${data.stats.inativa})`;
        }

        tbody.innerHTML = '';

        if (data.maquinas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:40px;">Nenhuma máquina cadastrada.</td></tr>';
            return;
        }

        data.maquinas.forEach(m => {
            // O Banco agora já traz hHoje e fHoje calculados
            const hHoje = parseFloat(m.horas_hoje || 0).toFixed(1);
            const fHoje = Math.round(m.fuel_hoje || 0);

            // Prepara o objeto para a função de edição (escapando aspas)
            const machineJson = JSON.stringify(m).replace(/'/g, "&apos;");

            const tr = `
                <tr data-status="${m.status_nome}">
                    <td><strong>${m.nome}</strong></td>
                    <td><span class="machine-tag">${m.codigo_tag}</span></td>
                    <td>${m.modelo}</td>
                    <td>${m.ano}</td>
                    <td><span class="badge ${m.status_classe}">${m.status_nome}</span></td>
                    <td><span style="font-weight:600;font-size:12px;">${m.localizacao || '—'}</span></td>
                    <td>
                        ${m.operador_nome ? `
                        <div class="op-row">
                            <div class="op-av c1" style="width:24px;height:24px;font-size:9px">${m.operador_iniciais}</div> 
                            ${m.operador_nome}
                        </div>` : '—'}
                    </td>
                    <td>${m.horimetro_atual}h</td>
                    <td><strong>${hHoje}h</strong></td>
                    <td>${m.taxa_consumo} L/h</td>
                    <td>${fHoje} L</td>
                    <td>
                        <button class="topbar-btn btn-outline" style="padding:4px 8px; font-size:11px;" 
                            onclick='abrirModalEdicaoMaquina(${machineJson})'>
                            Editar
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', tr);
        });

    } catch (e) {
        console.error("Erro ao carregar máquinas", e);
        document.querySelector('#mq-table tbody').innerHTML = '<tr><td colspan="12" style="text-align:center; color:red; padding:40px;">Erro ao conectar com o servidor.</td></tr>';
    }
}

// --- PREPARAR MODAL PARA EDIÇÃO ---
window.abrirModalEdicaoMaquina = function (maquina) {
    maquinaEmEdicaoId = maquina.id;

    // Abre o modal padrão de máquina do shared.js
    openModal('maquina');

    // Customiza o título
    document.getElementById('modalTitle').textContent = "Editar Máquina";
    document.getElementById('modalSub').textContent = `Alterando dados da TAG: ${maquina.codigo_tag}`;

    // Preenche os campos (Aguardamos o shared.js injetar o HTML no modalBody)
    setTimeout(() => {
        const modal = document.getElementById('modalBody');
        const inputs = modal.querySelectorAll('.form-input, .form-select');

        if (inputs.length > 0) {
            inputs[0].value = maquina.nome;
            inputs[1].value = maquina.codigo_tag;
            inputs[2].value = maquina.modelo;
            inputs[3].value = maquina.ano;
            inputs[4].value = maquina.horimetro_atual;
            inputs[5].value = maquina.taxa_consumo;
            inputs[6].value = maquina.status_id; // Agora seleciona pelo ID (1, 2, 3...)
            inputs[7].value = maquina.obra_id || ''; // Se tiver obra_id vinculado
            inputs[8].value = maquina.observacoes || '';
        }
    }, 100);
};

// --- LÓGICA DE SALVAMENTO UNIFICADA (CREATE OU UPDATE) ---
window.saveModal = async function () {
    const modalTitle = document.getElementById('modalTitle').textContent;
    const modalBody = document.getElementById('modalBody');
    const inputs = modalBody.querySelectorAll('.form-input, .form-select');

    // Mapeia os dados do formulário enviando IDs inteiros para o banco
    const payload = {
        nome: inputs[0].value,
        codigo_tag: inputs[1].value,
        modelo: inputs[2].value,
        ano: parseInt(inputs[3].value),
        horimetro_atual: parseFloat(inputs[4].value),
        taxa_consumo: parseFloat(inputs[5].value),
        status_id: parseInt(inputs[6].value),   // Enviando ID como Integer
        categoria_id: 1,                           // Padrão 'pesada' (ID 1) para V1
        unidade: inputs[7].value,             // ID da Obra
        observacoes: inputs[8].value
    };

    if (!payload.nome || !payload.codigo_tag) {
        showToast("Nome e TAG são obrigatórios!", "#DC2626");
        return;
    }

    const btnSalvar = document.querySelector('.modal-footer .btn-primary');
    const originalBtnText = btnSalvar.innerText;
    btnSalvar.disabled = true;
    btnSalvar.innerText = "Salvando...";

    const isEditing = modalTitle.includes("Editar");
    const endpoint = isEditing ? 'api/admin/update_maquina.php' : 'api/admin/create_maquina.php';

    if (isEditing) payload.id = maquinaEmEdicaoId;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showToast(isEditing ? "Alterações salvas!" : "Máquina cadastrada!");
            closeModal();
            carregarTabelaMaquinas();
            maquinaEmEdicaoId = null;
        } else {
            alert(result.message || "Erro no processamento.");
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        alert("Erro de conexão com o servidor.");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerText = originalBtnText;
    }
};