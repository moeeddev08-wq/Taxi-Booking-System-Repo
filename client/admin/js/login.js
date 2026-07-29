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

// Safety net: if the browser restores this page from back-forward cache
// (e.g. navigating Back to the login page after already logging in), force
// a fresh reload so checkExistingSession() below runs again on a clean page.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

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