const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const loginBtn = document.getElementById('loginBtn');

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function hideError() {
    errorMsg.style.display = 'none';
}

// If already logged in, skip straight to dashboard
(async function checkExistingSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session) {
        window.location.href = 'dashboard.html';
    }
})();

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    loginBtn.disabled = false;
    loginBtn.textContent = 'Log in';

    if (error) {
        console.error('Login error:', error);
        showError('Login failed: ' + error.message);
        return;
    }

    if (data && data.session) {
        window.location.href = 'dashboard.html';
    }
});