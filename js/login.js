
function showToast(msg, color = '#085041') {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');

    t.style.display = 'flex';
    t.style.background = color;
    msgEl.innerText = msg;

    t.classList.remove('show');
    void t.offsetWidth;

    t.classList.add('show');

    if (color !== '#1D9E75') {
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => { t.style.display = 'none'; }, 300);
        }, 3500);
    }
}

function showLoading(msg = 'Autenticando...') {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');

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
    t.classList.remove('show');
    setTimeout(() => { t.style.display = 'none'; }, 300);
}

document.querySelector('.btn-primary').onclick = async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const senha = document.querySelector('#senha').value;
    const btn = e.currentTarget;

    // 1. Validação de campos vazios
    if (!email || !senha) {
        showToast("Por favor, preencha todos os campos", "#DC2626");
        return;
    }

    // 2. Validação de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("Insira um e-mail válido", "#DC2626");
        return;
    }

    showLoading("Verificando credenciais...");
    btn.disabled = true;

    try {
        const response = await fetch('api/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const result = await response.json();

        if (response.ok) {
            // Sucesso
            showToast("Acesso autorizado! Entrando...", "#1D9E75");
            setTimeout(() => {
                window.location.href = (result.cargo === 'admin') ? 'd-dashboard.html' : 'maquinas.html';
            }, 1200);
        } else {
            hideLoading();
            setTimeout(() => {
                showToast(result.message || "Erro na autenticação", "#DC2626");
            }, 350); // Delay para o loading anterior sumir
            btn.disabled = false;
        }
    } catch (error) {
        hideLoading();
        showToast("Sem resposta do servidor. Tente mais tarde.", "#DC2626");
        btn.disabled = false;
    }
};