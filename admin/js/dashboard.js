const bookingsArea = document.getElementById('bookingsArea');
const bookingCount = document.getElementById('bookingCount');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const sectionTitle = document.getElementById('sectionTitle');
const navItems = document.querySelectorAll('.nav-item');

// ---------- Sidebar section switching ----------
function showSection(sectionKey) {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.hidden = panel.id !== `section-${sectionKey}`;
    });

    navItems.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionKey);
    });

    const activeBtn = document.querySelector(`.nav-item[data-section="${sectionKey}"]`);
    sectionTitle.textContent = activeBtn ? activeBtn.textContent.trim() : sectionKey;
}

navItems.forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return escapeHtml(value);
    return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function renderBookings(rows) {
    if (!rows || rows.length === 0) {
        bookingsArea.innerHTML = '<div class="state-msg">No bookings yet. New bookings from the site will show up here.</div>';
        bookingCount.textContent = '';
        return;
    }

    bookingCount.textContent = rows.length + (rows.length === 1 ? ' booking' : ' bookings');

    const rowsHtml = rows.map(b => `
    <tr>
      <td>${formatDateTime(b.date_time)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.phone)}</td>
      <td>${escapeHtml(b.pickup_location)}</td>
      <td>${escapeHtml(b.dropoff_location)}</td>
      <td>${b.fare !== null && b.fare !== undefined ? '£' + escapeHtml(b.fare) : '—'}</td>
      <td>${escapeHtml(b.notes) || '—'}</td>
      <td><span class="badge">${formatDateTime(b.created_at)}</span></td>
    </tr>
  `).join('');

    bookingsArea.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pickup date/time</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Pickup</th>
          <th>Drop-off</th>
          <th>Fare</th>
          <th>Notes</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

async function loadBookings() {
    bookingsArea.innerHTML = '<div class="state-msg">Loading bookings...</div>';

    const { data, error } = await supabaseClient
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading bookings:', error);
        bookingsArea.innerHTML = `<div class="state-msg">Could not load bookings: ${escapeHtml(error.message)}</div>`;
        bookingCount.textContent = '';
        return;
    }

    renderBookings(data);
}

async function initDashboard() {
    const { data } = await supabaseClient.auth.getSession();

    if (!data || !data.session) {
        window.location.href = 'login.html';
        return;
    }

    userEmailEl.textContent = data.session.user.email || 'Admin Dashboard';
    loadBookings();
}

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
});

refreshBtn.addEventListener('click', loadBookings);

// Redirect to login if the session ever ends (e.g. token expiry) while on this page
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'login.html';
    }
});

initDashboard();