// js/d-operadores.js

let operadorEmEdicaoId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const user = await verificarSessao();
    if (user.cargo !== 'admin') {
        window.location.href = 'maquinas.html';
        return;
    }
    carregarTabelaOperadores();
});

// --- LISTAR OPERADORES ---
async function carregarTabelaOperadores() {
    try {
        const response = await fetch('api/admin/operadores_full.php');
        const data = await response.json();

        window.operadoresList = data.operadores;
        window.operadoresStats = data.stats;

        const tbody = document.querySelector('#op-table tbody');
        if (!tbody) return;

        // Atualiza contadores
        const chips = document.querySelectorAll('.filter-chip-row .fchip');
        if (chips.length >= 3) {
            chips[0].innerText = `Todos (${data.stats.total})`;
            chips[1].innerText = `Trabalhando (${data.stats.ativos})`;
            chips[2].innerText = `Offline (${data.stats.offline})`;
        }

        tbody.innerHTML = '';

        data.operadores.forEach(op => {
            const isWorking = op.status_real === 'working';
            const badgeClass = isWorking ? 'badge-green' : 'badge-gray';
            const statusTexto = isWorking ? 'Trabalhando' : 'Offline';

            const hHoje = parseFloat(op.horas_hoje || 0).toFixed(1);
            const fHoje = Math.round(op.fuel_hoje || 0);
            const consumoLh = hHoje > 0 ? (fHoje / hHoje).toFixed(1) : '0.0';

            const tr = `
                <tr data-status="${statusTexto}">
                    <td>
                        <div class="op-row">
                            <div class="op-av ${op.cor_avatar}">${op.iniciais}</div>
                            <div>
                                <div style="font-weight:600">${op.nome}</div>
                                <div style="font-size:11px;color:var(--text-muted)">${op.cargo}${op.cidade ? ' · ' + op.cidade : ''}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge ${badgeClass}">${statusTexto}</span></td>
                    <td><span style="font-weight:600;font-size:12px;">${op.unidade || 'Geral'}</span></td>
                    <td><span class="machine-tag">${op.maquina_nome || '?'}</span></td>
                    <td><strong>${hHoje}h</strong></td>
                    <td>148h</td>
                    <td>${op.horimetro_final || '?'}</td>
                    <td>${fHoje} L</td>
                    <td>${consumoLh} L/h</td>
                    <td>
                        <button class="topbar-btn btn-outline" style="padding:4px 8px; font-size:11px;" 
                            onclick='abrirModalEdicaoOperador(${JSON.stringify(op)})'>
                            Editar
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', tr);
        });

    } catch (e) {
        console.error("Erro ao carregar tabela", e);
    }
}

// --- PREPARAR MODAL PARA EDIÇÃO ---
window.abrirModalEdicaoOperador = function (op) {
    operadorEmEdicaoId = op.id;

    // Abre o modal padrão de operador do shared.js
    openModal('operador');

    // Customiza o título
    document.getElementById('modalTitle').textContent = "Editar Operador";
    document.getElementById('modalSub').textContent = `Alterando dados de: ${op.nome}`;

    // Preenche os campos pelos IDs
    setTimeout(() => {
        const nomeFld    = document.getElementById('op-nome');
        const cargoFld   = document.getElementById('op-cargo');
        const emailFld   = document.getElementById('op-email');
        const telFld     = document.getElementById('op-telefone');
        const cpfFld     = document.getElementById('op-cpf');
        const unidadeFld = document.getElementById('op-unidade');
        const senhaFld   = document.getElementById('op-senha');
        const cepFld     = document.getElementById('op-cep');
        const cidadeFld  = document.getElementById('op-cidade');

        if (nomeFld)    nomeFld.value    = op.nome     || '';
        if (cargoFld)   cargoFld.value   = op.cargo    || '';
        if (emailFld)   emailFld.value   = op.email    || '';
        if (telFld)     telFld.value     = op.telefone || '';
        if (cpfFld)     cpfFld.value     = op.cpf      || '';
        if (unidadeFld) unidadeFld.value = op.unidade  || '';
        if (cepFld)     cepFld.value     = op.cep      || '';
        if (cidadeFld)  cidadeFld.value  = op.cidade   || '';
        if (senhaFld) {
            // Esconde campo senha na edição (não é obrigatório)
            senhaFld.closest('.form-field').style.display = 'none';
        }
    }, 50);
};

// --- SALVAMENTO UNIFICADO (CREATE OU UPDATE) ---
window.saveModal = async function () {
    const modalTitle = document.getElementById('modalTitle').textContent;
    const isEditing  = modalTitle.includes("Editar");

    // Lê pelos IDs
    const nome    = (document.getElementById('op-nome')?.value     || '').trim();
    const cargo   = (document.getElementById('op-cargo')?.value    || '').trim();
    const email   = (document.getElementById('op-email')?.value    || '').trim();
    const telefone= (document.getElementById('op-telefone')?.value || '').trim();
    const cpf     = (document.getElementById('op-cpf')?.value      || '').trim();
    const unidade = (document.getElementById('op-unidade')?.value  || '').trim();
    const senha   = (document.getElementById('op-senha')?.value    || '').trim();
    const cep     = (document.getElementById('op-cep')?.value      || '').trim();
    const cidade  = (document.getElementById('op-cidade')?.value   || '').trim();

    if (!nome || !email) {
        showToast("Nome e E-mail são obrigatórios!", "#DC2626");
        return;
    }

    if (!isEditing && senha.length < 6) {
        showToast("A senha deve ter pelo menos 6 caracteres!", "#DC2626");
        return;
    }

    // Valida CPF se preenchido
    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length > 0 && !validarCPF(cpfDigits)) {
        showToast("CPF inválido! Verifique os dígitos.", "#DC2626");
        document.getElementById('op-cpf')?.focus();
        return;
    }

    const payload = { nome, cargo, email, telefone, cpf, unidade, cep, cidade };
    if (!isEditing) {
        payload.senha = senha;
    }

    const endpoint = isEditing ? 'api/admin/update_usuario.php' : 'api/admin/create_usuario.php';
    if (isEditing) payload.id = operadorEmEdicaoId;

    const btn = document.querySelector('.modal-footer .btn-primary');
    if (btn) { btn.disabled = true; btn.innerText = "Salvando..."; }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
            showToast(isEditing ? "Cadastro atualizado!" : "Operador cadastrado com sucesso!", "#1D9E75");
            closeModal();
            carregarTabelaOperadores();
            operadorEmEdicaoId = null;
        } else {
            showToast(result.message || "Erro ao processar. Verifique se o e-mail já está em uso.", "#DC2626");
        }
    } catch (e) {
        console.error("Erro na requisição", e);
        showToast("Erro de conexão com o servidor.", "#DC2626");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "Salvar"; }
    }
};

window.exportarPDF = function() {
    if (!window.operadoresList || window.operadoresList.length === 0) {
        alert("Sem dados de operadores para exportar.");
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const dataHora = new Date().toLocaleString('pt-BR');
    
    let rowsHtml = '';
    window.operadoresList.forEach(op => {
        const isWorking = op.status_real === 'working';
        const statusTexto = isWorking ? 'Trabalhando' : 'Offline';
        const badgeColor = isWorking ? '#1D9E75' : '#4B5563';
        const badgeBg = isWorking ? '#D1FAE5' : '#F3F4F6';
        
        const hHoje = parseFloat(op.horas_hoje || 0).toFixed(1);
        const fHoje = Math.round(op.fuel_hoje || 0);
        const consumoLh = hHoje > 0 ? (fHoje / hHoje).toFixed(1) : '0.0';
        
        rowsHtml += `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: white; background: #1D9E75;">
                            ${op.iniciais}
                        </div>
                        <div>
                            <div style="font-weight: 600; font-size: 13px; color: #1F2937;">${op.nome}</div>
                            <div style="font-size: 11px; color: #6B7280;">${op.cargo}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: ${badgeColor}; background: ${badgeBg};">
                        ${statusTexto}
                    </span>
                </td>
                <td style="font-size: 12px; color: #4B5563;">${op.unidade || 'Geral'}</td>
                <td style="font-size: 12px; font-weight: 500; color: #1F2937;">${op.maquina_nome || '-'}</td>
                <td style="font-size: 12px; text-align: center;">${hHoje}h</td>
                <td style="font-size: 12px; text-align: center;">${op.horimetro_final || '-'}</td>
                <td style="font-size: 12px; text-align: center;">${fHoje} L</td>
                <td style="font-size: 12px; text-align: center; font-weight: 500;">${consumoLh} L/h</td>
            </tr>
        `;
    });
    
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Operadores — Verda</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                @page {
                    size: auto;
                    margin: 0mm;
                }
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 20mm;
                    color: #1F2937;
                    background-color: #ffffff;
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #E5E7EB;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .brand-dot {
                    width: 14px;
                    height: 14px;
                    background: #1D9E75;
                    border-radius: 2px;
                    transform: rotate(45deg);
                }
                .brand-name {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111827;
                    letter-spacing: -0.5px;
                }
                .report-title {
                    font-size: 22px;
                    font-weight: 700;
                    margin: 0 0 5px 0;
                    color: #111827;
                }
                .report-meta {
                    font-size: 12px;
                    color: #6B7280;
                }
                .kpis {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .kpi-card {
                    flex: 1;
                    padding: 15px;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    background: #F9FAFB;
                }
                .kpi-label {
                    font-size: 11px;
                    color: #6B7280;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    margin-bottom: 5px;
                }
                .kpi-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th {
                    background-color: #F3F4F6;
                    color: #374151;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 12px 10px;
                    text-align: left;
                    border-bottom: 2px solid #E5E7EB;
                }
                td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #F3F4F6;
                }
                tr:last-child td {
                    border-bottom: 2px solid #E5E7EB;
                }
                .footer {
                    position: fixed;
                    bottom: 20mm;
                    left: 20mm;
                    right: 20mm;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: #9CA3AF;
                    border-top: 1px solid #E5E7EB;
                    padding-top: 10px;
                }
                @media print {
                    body {
                        padding: 20mm;
                    }
                    .footer {
                        position: absolute;
                        bottom: 20mm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div>
                    <h1 class="report-title">Relatório de Operadores</h1>
                    <div class="report-meta">Gerado em: ${dataHora}</div>
                </div>
                <div class="brand">
                    <div class="brand-dot"></div>
                    <span class="brand-name">Verda</span>
                </div>
            </div>
            
            <div class="kpis">
                <div class="kpi-card">
                    <div class="kpi-label">Total de Operadores</div>
                    <div class="kpi-value">${window.operadoresStats.total}</div>
                </div>
                <div class="kpi-card" style="border-left: 3px solid #1D9E75;">
                    <div class="kpi-label">Trabalhando</div>
                    <div class="kpi-value">${window.operadoresStats.ativos}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Offline</div>
                    <div class="kpi-value">${window.operadoresStats.offline}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Operador</th>
                        <th>Status</th>
                        <th>Obra/Unidade</th>
                        <th>Máquina Atual</th>
                        <th style="text-align: center;">Horas Hoje</th>
                        <th style="text-align: center;">Últ. Horímetro</th>
                        <th style="text-align: center;">Comb. Hoje</th>
                        <th style="text-align: center;">Média Consumo</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
            
            <div class="footer">
                <span>Relatório Oficial - Verda Gestão de Frota</span>
                <span>Página 1 de 1</span>
            </div>
            
            <script>
                document.fonts.ready.then(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                });
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
