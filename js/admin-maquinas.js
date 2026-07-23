// js/admin-maquinas.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verifica sessão (Garante que é admin)
    const user = await verificarSessao();
    
    // 2. Só tenta preencher nome/avatar se os elementos existirem (escudo contra o erro anterior)
    const elGreeting = document.querySelector('.greeting-name');
    if (elGreeting && user.logged) elGreeting.innerText = user.nome;

    // 3. Carrega os dados reais do banco
    carregarPainelMaquinas();
});

async function carregarPainelMaquinas() {
    try {
        const response = await fetch('api/admin/maquinas_painel.php');
        const data = await response.json();

        // --- ATUALIZA OS CONTADORES DO TOPO ---
        document.getElementById('stat-uso').innerText   = data.stats.em_uso;
        document.getElementById('stat-maint').innerText = data.stats.manutencao;
        document.getElementById('stat-off').innerText   = data.stats.inativa;

        // Atualiza os números nos chips de filtro
        const chips = document.querySelectorAll('.filter-chip');
        chips[0].innerText = `Todas (${data.stats.total})`;
        chips[1].innerText = `Em uso (${data.stats.em_uso})`;
        chips[2].innerText = `Manutenção (${data.stats.manutencao})`;
        chips[3].innerText = `Inativa (${data.stats.inativa})`;

        // --- RENDERIZA A LISTA DE CARDS ---
        const container = document.getElementById('machineList');
        container.innerHTML = ''; // Limpa o "Carregando..."

        data.maquinas.forEach(m => {
            const statusVal = m.status.toLowerCase();
            let statusClass = 'inactive';
            let badgeClass = 'badge-off';
            let thumbColor = 'red';
            let statusTexto = 'Inativa';

            if (statusVal === 'ativa') {
                statusClass = 'active-m';
                badgeClass = 'badge-active';
                thumbColor = 'green';
                statusTexto = 'Em uso';
            } else if (statusVal === 'manutencao') {
                statusClass = 'maint';
                badgeClass = 'badge-maint';
                thumbColor = 'amber';
                statusTexto = 'Manutenção';
            }

            const hHoje = parseFloat(m.horas_hoje || 0).toFixed(1);
            const fHoje = Math.round(m.fuel_hoje || 0);

            const card = `
                <div class="mq-card ${statusClass}" data-status="${statusClass}" data-name="${m.nome.toLowerCase()}"
                     onclick="openModal('${m.nome}','${m.codigo_tag}','${thumbColor}','${statusVal}','${m.operador_nome || '—'}','${m.desde ? m.desde.substring(0,5) : '—'}','${hHoje}','${m.horimetro_atual}','${fHoje}','${m.taxa_consumo}','${m.modelo}','${m.ano}','${m.localizacao}')">
                    <div class="mq-top">
                        <div class="mq-thumb ${thumbColor}">
                             <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M2 14h10v6H2v-6zM12 10h8v10h-8V10zM6 14V10l4-4h4"/></svg>
                        </div>
                        <div class="mq-name-wrap">
                            <div class="mq-name">${m.nome}</div>
                            <div class="mq-code">${m.codigo_tag} · ${m.modelo} · ${m.ano}</div>
                        </div>
                        <span class="status-badge ${badgeClass}">${statusTexto}</span>
                    </div>
                    <div class="mq-metrics">
                        <div class="metric"><div class="metric-label">Horas hoje</div><div class="metric-value">${hHoje}h</div></div>
                        <div class="metric"><div class="metric-label">Horímetro</div><div class="metric-value">${m.horimetro_atual}</div></div>
                        <div class="metric"><div class="metric-label">Consumo</div><div class="metric-value">${m.taxa_consumo} L/h</div></div>
                    </div>
                    ${m.operador_nome ? `
                        <div class="mq-operator-row">
                            <div class="op-mini-avatar">${m.operador_iniciais}</div>
                            <div class="op-mini-name">${m.operador_nome}</div>
                            <div class="op-mini-since">desde ${m.desde.substring(0,5)}</div>
                        </div>` : ''}
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });

    } catch (e) { console.error("Erro ao carregar máquinas", e); }
}

// --- FUNÇÕES DE INTERFACE (Expostas para o HTML) ---

window.openModal = function(name, code, thumbColor, status, operator, since, hours, horimeter, fuel, consump, model, year, local) {
    document.getElementById('mName').textContent = name;
    document.getElementById('mCode').textContent = `${code} · ${model} · ${year}`;
    document.getElementById('mHours').innerHTML = hours + '<span>h</span>';
    document.getElementById('mHorimeter').textContent = horimeter;
    document.getElementById('mConsump').innerHTML = consump + '<span> L/h</span>';
    document.getElementById('mModel').textContent = model;
    document.getElementById('mYear').textContent = year;
    document.getElementById('mLocal').textContent = local;
    document.getElementById('mOperator').textContent = operator;
    document.getElementById('mSince').textContent = since;
    document.getElementById('mFuel').textContent = fuel + ' L';

    const badge = document.getElementById('mBadge');
    badge.className = 'status-badge';
    if (status === 'ativa') { 
        badge.classList.add('badge-active'); badge.textContent = 'Em uso'; 
    } else if (status === 'manutencao') { 
        badge.classList.add('badge-maint'); badge.textContent = 'Manutenção'; 
    } else { 
        badge.classList.add('badge-off'); badge.textContent = 'Inativa'; 
    }

    const th = document.getElementById('mThumb');
    th.className = 'modal-mthumb ' + thumbColor;

    document.getElementById('modalOverlay').classList.add('open');
}

window.closeModal = function() {
    document.getElementById('modalOverlay').classList.remove('open');
}

window.closeOutside = function(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
}

window.setFilter = function(el, status) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.mq-card').forEach(card => {
        card.style.display = (status === 'todos' || card.dataset.status === status) ? 'block' : 'none';
    });
}

window.filterMachines = function(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.mq-card').forEach(card => {
        card.style.display = card.dataset.name.includes(q) ? 'block' : 'none';
    });
}