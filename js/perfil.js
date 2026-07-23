// js/perfil.js

document.addEventListener('DOMContentLoaded', async () => {
    await verificarSessao();
    carregarDadosPerfil();
});

// --- FUNÇÕES DE INTERFACE ---
function showToast(msg, color = '#085041') {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    t.style.display = 'flex';
    t.style.background = color;
    msgEl.innerText = msg;
    t.classList.add('show');
    if (color !== '#1D9E75') {
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => { t.style.display = 'none'; }, 300);
        }, 3000);
    }
}

function showLoading(msg = 'Carregando perfil...') {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    t.style.display = 'flex';
    msgEl.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>${msg}</div>`;
    t.classList.add('show');
}

function hideLoading() {
    const t = document.getElementById('toast');
    t.classList.remove('show');
    setTimeout(() => { t.style.display = 'none'; }, 300);
}

// --- BUSCA DE DADOS ---
async function carregarDadosPerfil() {
    showLoading();
    try {
        const response = await fetch('api/usuario/perfil_dados.php');
        const data = await response.json();

        if (response.ok) {
            const p = data.perfil;
            const s = data.estatisticas;

            // 1. Hero
            document.getElementById('prof-avatar').innerText = p.iniciais;
            document.getElementById('prof-name').innerText = p.nome;
            document.getElementById('prof-role').innerText = p.cargo;

            // 2. Stats
            document.getElementById('stat-mes').innerText = s.horas_mes + 'h';
            document.getElementById('stat-regs').innerText = s.total_registros;
            document.getElementById('stat-maqs').innerText = s.total_maquinas;

            // 3. Dados Pessoais
            document.getElementById('val-nome').innerText = p.nome;
            document.getElementById('val-email').innerText = p.email;
            document.getElementById('val-tel').innerText = p.telefone || '(Não informado)';
            document.getElementById('val-empresa').innerText = p.empresa || 'Verda';
            document.getElementById('val-unidade').innerText = p.unidade || 'Não informada';

            // 4. Modal
            document.getElementById('edit-nome').value = p.nome;
            document.getElementById('edit-email').value = p.email;
            document.getElementById('edit-tel').value = p.telefone || '';

            hideLoading();
        }
    } catch (e) {
        console.error(e);
        showToast("Erro ao carregar dados", "#DC2626");
    }
}

async function salvarAlteracoesPerfil() {
    const dados = {
        nome: document.getElementById('edit-nome').value,
        email: document.getElementById('edit-email').value,
        telefone: document.getElementById('edit-tel').value
    };

    showLoading("Salvando...");

    const res = await fetch('api/usuario/update_perfil.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (res.ok) {
        showToast("Perfil atualizado!", "#1D9E75");
        setTimeout(() => {
            closeModal();
            carregarDadosPerfil();
        }, 1000);
    } else {
        hideLoading();
        showToast("Erro ao salvar", "#DC2626");
    }
}

function fazerLogout() {
    if (confirm("Deseja sair do sistema?")) {
        fetch('api/auth/logout.php').then(() => window.location.href = 'login.html');
    }
}