// js/registros.js

// 1. Instância única do serviço de sincronização
const sync = new SyncService('api/registros/create.php');

document.addEventListener('DOMContentLoaded', async () => {
    // 2. Verifica sessão e atualiza header
    const user = await verificarSessao();
    if (user.logged) {
        const avatar = document.querySelector('.avatar');
        if (avatar) avatar.innerText = user.iniciais || user.nome.substring(0, 2).toUpperCase();
    }

    // 3. Inicializa os dados da tela
    await carregarMaquinasSelect();
    atualizarInterfaceRegistros();

    // 4. Configura listener para preenchimento do horímetro inicial buscando do banco
    const select = document.getElementById('selectMaquina');
    if (select) {
        select.addEventListener('change', async () => {
            const selectedOption = select.options[select.selectedIndex];
            if (!selectedOption || !selectedOption.value) {
                const inputIni = document.getElementById('inputHorimetroInicial');
                if (inputIni) inputIni.value = '';
                return;
            }

            const inputIni = document.getElementById('inputHorimetroInicial');

            if (navigator.onLine) {
                try {
                    const res = await fetch(`api/maquinas/obter.php?id=${selectedOption.value}`);
                    if (res.ok) {
                        const maqData = await res.json();
                        if (maqData && maqData.horimetro_atual !== undefined) {
                            selectedOption.dataset.horimetro = maqData.horimetro_atual;
                            if (inputIni) {
                                inputIni.value = maqData.horimetro_atual;
                            }
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Erro ao buscar horímetro atualizado", e);
                }
            }

            const horimetro = selectedOption.dataset.horimetro;
            if (inputIni) {
                inputIni.value = horimetro || '';
            }
        });
    }

    // 5. Verifica se o operador veio redirecionado da tela de máquinas
    verificarRedirecionamento();

    // 6. Tenta sincronizar registros feitos offline anteriormente
    sync.sincronizar();
    carregarObrasSelect();
});

// Detecta volta da internet
window.addEventListener('online', () => {
    sync.sincronizar();
    setTimeout(atualizarInterfaceRegistros, 2000);
});

// --- FUNÇÕES DE INTERFACE (TOAST / LOADING) ---

function showToast(msg, color = '#085041') {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    if (!t || !msgEl) return;

    t.style.display = 'flex';
    t.style.background = color;
    msgEl.innerText = msg;

    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');

    if (color !== '#1D9E75') { // Se não for verde (sucesso), some sozinho
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => { t.style.display = 'none'; }, 300);
        }, 3500);
    }
}

function showLoading(msg = 'Processando...') {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    if (!t || !msgEl) return;

    t.style.display = 'flex';
    t.style.background = '#085041';
    msgEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite;">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            ${msg}
        </div>`;
    t.classList.add('show');
}

function hideLoading() {
    const t = document.getElementById('toast');
    if (t) {
        t.classList.remove('show');
        setTimeout(() => { t.style.display = 'none'; }, 300);
    }
}

// --- LÓGICA DE DADOS ---

async function carregarMaquinasSelect() {
    try {
        const response = await fetch('api/maquinas/listar.php');
        const maquinas = await response.json();
        const select = document.querySelector('.form-select');

        if (select) {
            select.innerHTML = '<option value="">Selecione uma máquina</option>';
            maquinas.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = `${m.nome} (${m.codigo_tag})`;
                option.dataset.horimetro = m.horimetro_atual;
                select.appendChild(option);
            });
        }
    } catch (e) { console.error("Erro ao carregar máquinas", e); }
}

async function carregarObrasSelect() {
    const select = document.getElementById('selectObra');
    if (!select) return;
    try {
        const response = await fetch('api/obras/listar_disponiveis.php');
        const obrasDisponiveis = await response.json();
        if (!response.ok) throw new Error(obrasDisponiveis.message || 'Erro ao carregar obras');
        select.innerHTML = '<option value="">Selecione uma obra</option>';
        obrasDisponiveis.forEach(obra => {
            const option = document.createElement('option');
            option.value = obra.id;
            option.textContent = `${obra.codigo} - ${obra.nome}`;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = '<option value="">Nenhuma obra disponível</option>';
        console.error(error);
    }
}

async function atualizarInterfaceRegistros() {
    try {
        const response = await fetch('api/registros/listar_pessoais.php');
        const dados = await response.json();
        const lista = document.getElementById('recordList');

        if (!lista) return;
        lista.innerHTML = '';

        // ATUALIZA OS KPIs (Topo da tela)
        const stats = document.querySelectorAll('.stat-num');
        if (stats.length >= 3) {
            const totalHoras = dados.reduce((acc, curr) => {
                const horas = parseFloat(curr.horas_calc);
                return acc + (isNaN(horas) ? 0 : horas);
            }, 0);

            const pendentes = dados.filter(r => r.status === 'pendente').length;

            stats[0].innerText = dados.length;
            stats[1].innerText = pendentes;
            stats[2].innerText = totalHoras.toFixed(1) + 'h';
        }

        if (dados.length === 0) {
            lista.innerHTML = '<p style="text-align:center; padding:20px; color:gray;">Nenhum registro encontrado.</p>';
            return;
        }

        dados.forEach(reg => {
            let statusClass = reg.status === 'pendente' ? 'badge-pending' : (reg.status === 'revisao' ? 'badge-review' : 'badge-done');
            let cardClass = reg.status === 'pendente' ? 'pending' : (reg.status === 'revisao' ? 'review' : '');

            const card = `
                <div class="record-card ${cardClass}">
                    <div class="record-top">
                        <div>
                            <div class="record-machine">${reg.maquina_nome}</div>
                            <div class="record-code">${reg.codigo_tag} · Obra Norte</div>
                        </div>
                        <span class="status-badge ${statusClass}">${reg.status.toUpperCase()}</span>
                    </div>
                    <div class="record-meta">
                        <div class="meta-item">${formatarData(reg.data)}</div>
                        <div class="meta-item">${reg.hora_inicio.substring(0, 5)} - ${reg.hora_fim.substring(0, 5)}</div>
                    </div>
                    <div class="record-divider"></div>
                    <div class="record-hours">
                        <div class="hours-item">
                            <div class="hours-label">Horas</div>
                            <div class="hours-value">${parseFloat(reg.horas_calc || 0).toFixed(1)}<span>h</span></div>
                        </div>
                        <div class="hours-item">
                            <div class="hours-label">Início</div>
                            <div class="hours-value">${reg.horimetro_inicial}</div>
                        </div>
                        <div class="hours-item">
                            <div class="hours-label">Fim</div>
                            <div class="hours-value">${reg.horimetro_final}</div>
                        </div>
                    </div>
                </div>
            `;
            lista.insertAdjacentHTML('beforeend', card);
        });
    } catch (e) { console.error("Erro ao listar registros", e); }
}

function verificarRedirecionamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const maquinaIdUrl = urlParams.get('maquina_id');

    if (maquinaIdUrl) {
        const select = document.querySelector('.form-select');
        if (select) {
            select.value = maquinaIdUrl;
            // Dispara evento change para atualizar o horímetro inicial
            select.dispatchEvent(new Event('change'));
            openModal();
        }
    }
}

async function salvarNovoRegistro() {
    const btn = document.querySelector('.btn-submit');
    const inputMaq = document.getElementById('selectMaquina');
    const inputObra = document.getElementById('selectObra');
    const inputData = document.getElementById('inputData');
    const inputHoraIni = document.getElementById('inputHoraInicio');
    const inputHoraFim = document.getElementById('inputHoraFim');
    const inputHIni = document.getElementById('inputHorimetroInicial');
    const inputHFim = document.getElementById('inputHorimetroFinal');

    const dados = {
        maquina_id: inputMaq ? inputMaq.value : '',
        obra_id: inputObra ? inputObra.value : '',
        data: inputData ? inputData.value : '',
        hora_inicio: inputHoraIni ? inputHoraIni.value : '',
        hora_fim: inputHoraFim ? inputHoraFim.value : '',
        horimetro_inicial: inputHIni ? inputHIni.value : '',
        horimetro_final: inputHFim ? inputHFim.value : '',
        producao_m3: 0
    };

    // Validações de campos obrigatórios
    if (!dados.maquina_id) {
        showToast("Selecione a máquina", "#DC2626");
        return;
    }
    if (!dados.obra_id) {
        showToast("Selecione a obra", "#DC2626");
        return;
    }
    if (!dados.data) {
        showToast("Informe a data do apontamento", "#DC2626");
        return;
    }
    if (!dados.hora_inicio || !dados.hora_fim) {
        showToast("Informe a hora de início e fim", "#DC2626");
        return;
    }
    if (dados.horimetro_inicial === "" || dados.horimetro_final === "") {
        showToast("Informe os horímetros inicial e final", "#DC2626");
        return;
    }

    const hIni = parseFloat(dados.horimetro_inicial);
    const hFim = parseFloat(dados.horimetro_final);

    if (isNaN(hIni) || hIni < 0) {
        showToast("O horímetro inicial deve ser maior ou igual a zero", "#DC2626");
        return;
    }
    if (isNaN(hFim) || hFim < 0) {
        showToast("O horímetro final deve ser maior ou igual a zero", "#DC2626");
        return;
    }
    if (hFim < hIni) {
        showToast("O horímetro final não pode ser menor que o inicial", "#DC2626");
        return;
    }

    // Validação de horário
    if (dados.hora_fim <= dados.hora_inicio) {
        showToast("A hora fim deve ser posterior à hora início", "#DC2626");
        return;
    }

    // Validação contra o horímetro atual da máquina cadastrado
    const selectedOption = inputMaq.options[inputMaq.selectedIndex];
    const horimetroAtual = selectedOption ? parseFloat(selectedOption.dataset.horimetro) : 0;
    if (!isNaN(horimetroAtual) && hIni < horimetroAtual) {
        showToast(`O horímetro inicial (${hIni}) não pode ser menor que o atual da máquina (${horimetroAtual})`, "#DC2626");
        return;
    }

    btn.disabled = true;
    showLoading("Enviando apontamento...");

    try {
        const res = await sync.salvarRegistro(dados);

        if (res.mode === 'online') {
            showToast("Registro salvou com sucesso!", "#1D9E75");
        } else {
            showToast("Modo Offline: Registro salvo no aparelho", "#D97706");
        }

        // Atualiza os campos do modal para o próximo apontamento
        if (selectedOption) {
            selectedOption.dataset.horimetro = hFim;
        }
        if (inputHIni) {
            inputHIni.value = hFim;
        }
        if (inputHFim) {
            inputHFim.value = '';
        }

        setTimeout(() => {
            closeModal();
            atualizarInterfaceRegistros();
        }, 1500);

    } catch (error) {
        hideLoading();
        showToast("Erro ao processar. Verifique os dados.", "#DC2626");
    } finally {
        btn.disabled = false;
    }
}

function formatarData(dataSql) {
    const d = new Date(dataSql);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString('pt-BR');
}
