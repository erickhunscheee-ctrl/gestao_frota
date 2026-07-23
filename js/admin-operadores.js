// js/admin-operadores.js

// Mapeamento de cores para os avatares (mantido do seu original)
const colorMap = { 
    c1: '#1D9E75', c2: '#0F6E56', c3: '#3B82F6', c4: '#8B5CF6', 
    c5: '#EC4899', c6: '#F59E0B', c7: '#64748B', c8: '#EF4444' 
};

document.addEventListener('DOMContentLoaded', async () => {
    await verificarSessao();
    
    // 2. Carrega os operadores do banco
    carregarPainelOperadores();
});

async function carregarPainelOperadores() {
    try {
        const response = await fetch('api/admin/operadores_full.php');
        const data = await response.json();

        // 3. Atualiza os cards de estat�sticas do topo
        const statsNums = document.querySelectorAll('.stat-num');
        if (statsNums.length >= 3) {
            statsNums[0].innerText = data.stats.ativos;
            statsNums[1].innerText = 0; // Pausa (pode ser implementado na V2)
            statsNums[2].innerText = data.stats.offline;
        }

        // 4. Renderiza a lista de cards
        const container = document.getElementById('opList');
        container.innerHTML = ''; // Limpa a lista

        data.operadores.forEach(op => {
            const statusClass = op.status_real === 'working' ? 'working' : 'offline';
            const badgeClass = op.status_real === 'working' ? 'badge-working' : 'badge-offline';
            const statusTexto = op.status_real === 'working' ? 'Trabalhando' : 'Offline';
            
            // Dados para o modal (tratamento de nulos)
            const hHoje = parseFloat(op.horas_hoje || 0).toFixed(1);
            const fHoje = Math.round(op.fuel_hoje || 0);
            const hori = op.horimetro_final || '?';

            const card = `
                <div class="op-card ${statusClass}" data-status="${statusClass}" data-name="${op.nome.toLowerCase()}" 
                     onclick="openModal('${op.iniciais}', '${op.cor_avatar}', '${op.nome}', '${op.cargo}', '${op.maquina_nome || '?'}', '${op.unidade || '?'}', '${hHoje}', '${hori}', '${fHoje}')">
                    <div class="op-top">
                        <div class="op-avatar ${op.cor_avatar}" style="background: ${colorMap[op.cor_avatar]}">${op.iniciais}</div>
                        <div class="op-name-wrap">
                            <div class="op-name">${op.nome}</div>
                            <div class="op-role">${op.cargo}</div>
                        </div>
                        <span class="status-badge ${badgeClass}">${statusTexto}</span>
                    </div>
                    <div class="op-machine-row">
                        <div class="machine-tag">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="14" width="10" height="6" rx="1"/><rect x="12" y="10" width="8" height="10" rx="1"/></svg>
                            ${op.maquina_nome || 'Nenhuma máquina'}
                        </div>
                        <div class="location-tag">
                             <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                             ${op.unidade}
                        </div>
                    </div>
                    <div class="op-metrics">
                        <div class="metric"><div class="metric-label">Horas hoje</div><div class="metric-value">${hHoje}h</div></div>
                        <div class="metric"><div class="metric-label">Horímetro</div><div class="metric-value">${hori}</div></div>
                        <div class="metric"><div class="metric-label">Combustível</div><div class="metric-value">${fHoje} L</div></div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });

    } catch (e) { console.error("Erro ao carregar painel admin", e); }
}

// --- FUN��ES GLOBAIS (Expostas para o HTML) ---

window.openModal = function(initials, color, name, role, machine, local, hours, horimeter, fuel) {
    const av = document.getElementById('mAvatar');
    av.textContent = initials;
    av.className = 'modal-avatar';
    av.style.background = colorMap[color] || '#1D9E75';

    document.getElementById('mName').textContent = name;
    document.getElementById('mRole').textContent = role;
    document.getElementById('mHours').innerHTML = hours + '<span>h</span>';
    document.getElementById('mHorimeter').textContent = horimeter;
    document.getElementById('mFuel').innerHTML = fuel + '<span>L</span>';
    document.getElementById('mMachine').textContent = machine;
    document.getElementById('mLocal').textContent = local;

    const h = parseFloat(hours);
    const f = parseFloat(fuel);
    document.getElementById('mConsump').textContent = h > 0 ? (f / h).toFixed(1) + ' L/h' : '?';

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
    document.querySelectorAll('.op-card').forEach(card => {
        card.style.display = (status === 'todos' || card.dataset.status === status) ? 'block' : 'none';
    });
}

window.filterOps = function(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.op-card').forEach(card => {
        card.style.display = card.dataset.name.includes(q) ? 'block' : 'none';
    });
}