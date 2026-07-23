async function verificarSessao() {
    const res = await fetch('api/auth/check_session.php');
    const data = await res.json();
    
    if (!data.logged && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
    return data;
}

function logout() {
    fetch('api/auth/logout.php').then(() => window.location.href = 'login.html');
}