// js/maquinas.js

let maquinaIdSelecionada = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verifica sessão e atualiza o Header
    const user = await verificarSessao();
    if (user.logged) {
        document.querySelector('.greeting-name').innerText = user.nome;
        const avatar = document.querySelector('.avatar');
        if (avatar) avatar.innerText = user.nome.substring(0, 2).toUpperCase();
    }

    // 2. Carrega a lista de máquinas do banco
    carregarMaquinasAtuais();
});

async function carregarMaquinasAtuais() {
    try {
        const response = await fetch('api/maquinas/listar.php');
        const maquinas = await response.json();

        const container = document.getElementById('machineList');
        if (!container) return;

        container.innerHTML = ''; // Limpa os cards de carregamento

        // 3. Atualiza os KPIs (Contadores do topo)
        const total = maquinas.length;
        const ativas = maquinas.filter(m => parseInt(m.status_id) === 1).length;

        const stats = document.querySelectorAll('.stat-num');
        if (stats.length >= 3) {
            stats[0].innerText = total;
            stats[1].innerText = ativas;
            stats[2].innerText = total - ativas;
        }

        if (total === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:gray;">Nenhuma máquina disponível.</p>';
            return;
        }

        // 4. Renderiza os cards reais
        maquinas.forEach(m => {
            // Define a cor do ícone baseada na classe que veio do banco
            let iconColor = '#DC2626'; // Vermelho (Inativa)
            if (m.status_classe === 'status-active') iconColor = '#1D9E75'; // Verde
            if (m.status_classe === 'status-maint') iconColor = '#D97706'; // Laranja

            const card = `
                <div class="machine-card" 
                     onclick="openModal('${m.nome}', '${m.codigo_tag}', '${m.status_nome}', '${m.modelo}', '${m.ano}', '${m.localizacao || '-'}', ${m.id}, '${m.status_classe}')"
                     data-name="${m.nome.toLowerCase()}">
                    <div class="machine-thumb" style="${m.status_classe === 'status-maint' ? 'background:#FEF3C7;' : ''}">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5">
                            <rect x="2" y="14" width="10" height="6" rx="1"/><rect x="12" y="10" width="8" height="10" rx="1"/>
                            <path d="M6 14V10l4-4h4"/><circle cx="5" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/>
                        </svg>
                    </div>
                    <div class="machine-info">
                        <div class="machine-name">${m.nome}</div>
                        <div class="machine-code">${m.codigo_tag} · ${m.modelo}</div>
                        <span class="status-badge ${m.status_classe}">${m.status_nome}</span>
                    </div>
                    <svg class="machine-arrow" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

    } catch (e) {
        console.error("Erro ao carregar máquinas", e);
        const container = document.getElementById('machineList');
        if (container) container.innerHTML = '<p style="text-align:center; color:red;">Erro de conexão.</p>';
    }
}

// REDEFININDO A FUNÇÃO OPENMODAL
window.openModal = function (name, code, statusNome, model, year, local, id, statusClasse) {
    maquinaIdSelecionada = id;

    document.getElementById('modalName').textContent = name;
    document.getElementById('modalCode').textContent = code;
    document.getElementById('modalModel').textContent = model;
    document.getElementById('modalYear').textContent = year;
    document.getElementById('modalLocal').textContent = local;

    const badge = document.getElementById('modalBadge');
    badge.textContent = statusNome;
    badge.className = 'status-badge ' + statusClasse;

    const btnStart = document.querySelector('.btn-start');

    // Só permite iniciar apontamento se o status for "Ativa" (classe status-active)
    if (statusClasse === 'status-active') {
        if (btnStart) btnStart.style.display = 'flex';
    } else {
        if (btnStart) btnStart.style.display = 'none';
    }

    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.add('open');
}

// REDEFININDO A FUNÇÃO STARTRECORD
window.startRecord = function () {
    if (maquinaIdSelecionada) {
        window.location.href = `registros.html?maquina_id=${maquinaIdSelecionada}`;
    }
}

// Filtro de busca
window.filterCards = function () {
    const q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.machine-card').forEach(card => {
        card.style.display = card.dataset.name.includes(q) ? 'flex' : 'none';
    });
}

window.closeModal = function () {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('open');
}

window.closeModalOutside = function (e) {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay && e.target === modalOverlay) closeModal();
}