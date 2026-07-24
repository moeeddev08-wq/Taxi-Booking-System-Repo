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

    if (sectionKey === 'prices') {
        loadPrices();
    }
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
    <tr data-id="${escapeHtml(b.id)}">
      <td>${formatDateTime(b.date_time)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.phone)}</td>
      <td>${escapeHtml(b.pickup_location)}</td>
      <td>${escapeHtml(b.dropoff_location)}</td>
      <td>${b.fare !== null && b.fare !== undefined ? '£' + escapeHtml(b.fare) : '—'}</td>
      <td>${escapeHtml(b.notes) || '—'}</td>
      <td><span class="badge">${formatDateTime(b.created_at)}</span></td>
      <td><button class="delete-btn" data-id="${escapeHtml(b.id)}">Delete</button></td>
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;

    bookingsArea.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteBooking(btn.dataset.id, btn));
    });
}

async function deleteBooking(id, btnEl) {
    const confirmed = window.confirm('Delete this booking? This cannot be undone.');
    if (!confirmed) return;

    btnEl.disabled = true;
    btnEl.textContent = 'Deleting...';

    const { error } = await supabaseClient
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting booking:', error);
        alert('Could not delete booking: ' + error.message);
        btnEl.disabled = false;
        btnEl.textContent = 'Delete';
        return;
    }

    loadBookings();
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

// ---------- Prices section ----------
const pricesArea = document.getElementById('pricesArea');

async function loadPrices() {
    pricesArea.innerHTML = '<div class="state-msg">Loading prices...</div>';

    const { data, error } = await supabaseClient
        .from('prices')
        .select('*')
        .order('label', { ascending: true });

    if (error) {
        console.error('Error loading prices:', error);
        pricesArea.innerHTML = `<div class="state-msg">Could not load prices: ${escapeHtml(error.message)}</div>`;
        return;
    }

    renderPrices(data);
}

function renderPrices(rows) {
    if (!rows || rows.length === 0) {
        pricesArea.innerHTML = '<div class="state-msg">No prices set up yet. Add rows to the "prices" table in Supabase to get started.</div>';
        return;
    }

    const rowsHtml = rows.map(p => `
    <tr data-id="${escapeHtml(p.id)}">
      <td>${escapeHtml(p.label)}</td>
      <td>
        <div class="price-edit">
          <span class="price-prefix">£</span>
          <input type="number" step="0.01" min="0" class="price-input" value="${escapeHtml(p.price)}">
        </div>
      </td>
      <td>
        <button class="save-price-btn" data-id="${escapeHtml(p.id)}">Save</button>
        <span class="save-status" id="save-status-${escapeHtml(p.id)}"></span>
      </td>
    </tr>
  `).join('');

    pricesArea.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;

    pricesArea.querySelectorAll('.save-price-btn').forEach(btn => {
        btn.addEventListener('click', () => savePrice(btn.dataset.id, btn));
    });
}

async function savePrice(id, btnEl) {
    const row = btnEl.closest('tr');
    const input = row.querySelector('.price-input');
    const statusEl = document.getElementById(`save-status-${id}`);
    const newValue = parseFloat(input.value);

    if (isNaN(newValue) || newValue < 0) {
        statusEl.textContent = 'Enter a valid price';
        statusEl.className = 'save-status error';
        return;
    }

    btnEl.disabled = true;
    btnEl.textContent = 'Saving...';
    statusEl.textContent = '';

    const { error } = await supabaseClient
        .from('prices')
        .update({ price: newValue, updated_at: new Date().toISOString() })
        .eq('id', id);

    btnEl.disabled = false;
    btnEl.textContent = 'Save';

    if (error) {
        console.error('Error saving price:', error);
        statusEl.textContent = 'Failed to save';
        statusEl.className = 'save-status error';
        return;
    }

    statusEl.textContent = 'Saved ✓';
    statusEl.className = 'save-status success';
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
}

async function initDashboard() {
    const { data } = await supabaseClient.auth.getSession();

    if (!data || !data.session) {
        window.location.href = 'login.html';
        return;
    }

    // Session confirmed — now safe to reveal the dashboard
    document.getElementById('authCheck').style.display = 'none';
    document.getElementById('appShell').style.display = 'flex';

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