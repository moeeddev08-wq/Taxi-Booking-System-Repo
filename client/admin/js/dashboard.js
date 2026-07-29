const bookingsArea = document.getElementById('bookingsArea');
const bookingCount = document.getElementById('bookingCount');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const sectionTitle = document.getElementById('sectionTitle');
const navItems = document.querySelectorAll('.nav-item');

let currentBookings = [];

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

    if (sectionKey === 'fleet') {
        loadFleet();
    }

    if (sectionKey === 'testimonials') {
        loadReviews();
    }

    if (sectionKey === 'faqs') {
        loadFaqs();
    }

    if (sectionKey === 'contact') {
        loadContactSettings();
    }

    if (sectionKey === 'settings') {
        loadAnnouncementSettings();
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
        currentBookings = [];
        return;
    }

    currentBookings = data;
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

// ---------- Fleet section ----------
const fleetArea = document.getElementById('fleetArea');

async function loadFleet() {
    fleetArea.innerHTML = '<div class="state-msg">Loading fleet...</div>';

    const { data, error } = await supabaseClient
        .from('fleet')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error loading fleet:', error);
        fleetArea.innerHTML = `<div class="state-msg">Could not load fleet: ${escapeHtml(error.message)}</div>`;
        return;
    }

    renderFleet(data);
}

function renderFleet(rows) {
    if (!rows || rows.length === 0) {
        fleetArea.innerHTML = '<div class="state-msg">No fleet vehicles found. Add rows to the "fleet" table in Supabase to get started.</div>';
        return;
    }

    const cardsHtml = rows.map(v => `
    <div class="fleet-admin-card" data-id="${escapeHtml(v.id)}">
      <h3>${escapeHtml(v.title)}</h3>

      <div class="fleet-field">
        <label>Title</label>
        <input type="text" class="fleet-title-input" value="${escapeHtml(v.title)}">
      </div>

      <div class="fleet-field">
        <label>Subtitle</label>
        <input type="text" class="fleet-subtitle-input" value="${escapeHtml(v.subtitle)}">
      </div>

      <div class="fleet-field">
        <label>Description</label>
        <textarea class="fleet-desc-input">${escapeHtml(v.description)}</textarea>
      </div>

      <div class="fleet-field-row">
        <div class="fleet-field">
          <label>Passengers text</label>
          <input type="text" class="fleet-passengers-input" value="${escapeHtml(v.passengers_text)}">
        </div>
        <div class="fleet-field">
          <label>Luggage text</label>
          <input type="text" class="fleet-luggage-input" value="${escapeHtml(v.luggage_text)}">
        </div>
      </div>

      <div class="fleet-field-row">
        <div class="fleet-field">
          <label>Feature 3</label>
          <input type="text" class="fleet-spec3-input" value="${escapeHtml(v.spec3_text)}">
        </div>
        <div class="fleet-field">
          <label>Feature 4</label>
          <input type="text" class="fleet-spec4-input" value="${escapeHtml(v.spec4_text)}">
        </div>
      </div>

      <div class="fleet-field-row">
        <div class="fleet-field">
          <label>Price per mile (£)</label>
          <div class="price-edit">
            <span class="price-prefix">£</span>
            <input type="number" step="0.01" min="0" class="price-input fleet-rate-input" value="${escapeHtml(v.price_per_mile)}">
          </div>
        </div>
        <div class="fleet-field">
          <label>Minimum fare (£)</label>
          <div class="price-edit">
            <span class="price-prefix">£</span>
            <input type="number" step="0.01" min="0" class="price-input fleet-minfare-input" value="${escapeHtml(v.minimum_fare)}">
          </div>
        </div>
      </div>

      <button class="save-price-btn save-fleet-btn" data-id="${escapeHtml(v.id)}">Save</button>
      <span class="save-status" id="save-fleet-status-${escapeHtml(v.id)}"></span>
    </div>
  `).join('');

    fleetArea.innerHTML = `<div class="fleet-admin-grid">${cardsHtml}</div>`;

    fleetArea.querySelectorAll('.save-fleet-btn').forEach(btn => {
        btn.addEventListener('click', () => saveFleet(btn.dataset.id, btn));
    });
}

async function saveFleet(id, btnEl) {
    const card = btnEl.closest('.fleet-admin-card');
    const statusEl = document.getElementById(`save-fleet-status-${id}`);

    const title = card.querySelector('.fleet-title-input').value.trim();
    const subtitle = card.querySelector('.fleet-subtitle-input').value.trim();
    const description = card.querySelector('.fleet-desc-input').value.trim();
    const passengers_text = card.querySelector('.fleet-passengers-input').value.trim();
    const luggage_text = card.querySelector('.fleet-luggage-input').value.trim();
    const spec3_text = card.querySelector('.fleet-spec3-input').value.trim();
    const spec4_text = card.querySelector('.fleet-spec4-input').value.trim();
    const price_per_mile = parseFloat(card.querySelector('.fleet-rate-input').value);
    const minimum_fare = parseFloat(card.querySelector('.fleet-minfare-input').value);

    if (!title || !subtitle || !description) {
        statusEl.textContent = 'Title, subtitle & description required';
        statusEl.className = 'save-status error';
        return;
    }

    if (isNaN(price_per_mile) || price_per_mile < 0 || isNaN(minimum_fare) || minimum_fare < 0) {
        statusEl.textContent = 'Enter valid prices';
        statusEl.className = 'save-status error';
        return;
    }

    btnEl.disabled = true;
    btnEl.textContent = 'Saving...';
    statusEl.textContent = '';

    const { error } = await supabaseClient
        .from('fleet')
        .update({
            title, subtitle, description,
            passengers_text, luggage_text, spec3_text, spec4_text,
            price_per_mile, minimum_fare,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    btnEl.disabled = false;
    btnEl.textContent = 'Save';

    if (error) {
        console.error('Error saving fleet vehicle:', error);
        statusEl.textContent = 'Failed to save';
        statusEl.className = 'save-status error';
        return;
    }

    statusEl.textContent = 'Saved ✓';
    statusEl.className = 'save-status success';
    setTimeout(() => { statusEl.textContent = ''; }, 2500);

    card.querySelector('h3').textContent = title;
}

// ---------- Reviews section (moderation) ----------
const pendingReviewsArea = document.getElementById('pendingReviewsArea');
const approvedReviewsArea = document.getElementById('approvedReviewsArea');

function starsHtmlAdmin(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating ? '★' : '☆';
    }
    return html;
}

async function loadReviews() {
    pendingReviewsArea.innerHTML = '<div class="state-msg">Loading pending reviews...</div>';
    approvedReviewsArea.innerHTML = '<div class="state-msg">Loading approved reviews...</div>';

    const { data, error } = await supabaseClient
        .from('site_reviews')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading reviews:', error);
        pendingReviewsArea.innerHTML = `<div class="state-msg">Could not load reviews: ${escapeHtml(error.message)}</div>`;
        approvedReviewsArea.innerHTML = '';
        return;
    }

    const pending = data.filter(r => r.status === 'pending');
    const approved = data.filter(r => r.status === 'approved');

    renderPendingReviews(pending);
    renderApprovedReviews(approved);
}

function renderPendingReviews(rows) {
    if (!rows || rows.length === 0) {
        pendingReviewsArea.innerHTML = '<div class="state-msg">No reviews waiting for approval.</div>';
        return;
    }

    pendingReviewsArea.innerHTML = rows.map(r => `
    <div class="review-admin-card" data-id="${escapeHtml(r.id)}">
      <div class="review-admin-head">
        <strong>${escapeHtml(r.name)}</strong>
        <span class="review-admin-stars">${starsHtmlAdmin(r.rating)}</span>
        <span class="badge">${formatDateTime(r.created_at)}</span>
      </div>
      <p class="review-admin-message">${escapeHtml(r.message)}</p>
      <div class="review-admin-actions">
        <button class="approve-review-btn" data-id="${escapeHtml(r.id)}">Approve</button>
        <button class="reject-review-btn" data-id="${escapeHtml(r.id)}">Reject</button>
      </div>
    </div>
  `).join('');

    pendingReviewsArea.querySelectorAll('.approve-review-btn').forEach(btn => {
        btn.addEventListener('click', () => setReviewStatus(btn.dataset.id, 'approved', btn));
    });
    pendingReviewsArea.querySelectorAll('.reject-review-btn').forEach(btn => {
        btn.addEventListener('click', () => setReviewStatus(btn.dataset.id, 'rejected', btn));
    });
}

function renderApprovedReviews(rows) {
    if (!rows || rows.length === 0) {
        approvedReviewsArea.innerHTML = '<div class="state-msg">No approved reviews yet.</div>';
        return;
    }

    approvedReviewsArea.innerHTML = rows.map(r => `
    <div class="review-admin-card" data-id="${escapeHtml(r.id)}">
      <div class="review-admin-head">
        <strong>${escapeHtml(r.name)}</strong>
        <span class="review-admin-stars">${starsHtmlAdmin(r.rating)}</span>
        <span class="badge">${formatDateTime(r.created_at)}</span>
      </div>
      <p class="review-admin-message">${escapeHtml(r.message)}</p>
      <div class="review-admin-actions">
        <button class="delete-review-btn" data-id="${escapeHtml(r.id)}">Remove from site</button>
      </div>
    </div>
  `).join('');

    approvedReviewsArea.querySelectorAll('.delete-review-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteReview(btn.dataset.id, btn));
    });
}

async function setReviewStatus(id, status, btnEl) {
    btnEl.disabled = true;

    const { error } = await supabaseClient
        .from('site_reviews')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating review status:', error);
        alert('Could not update this review: ' + error.message);
        btnEl.disabled = false;
        return;
    }

    loadReviews();
}

async function deleteReview(id, btnEl) {
    const confirmed = window.confirm('Remove this review from the website? This cannot be undone.');
    if (!confirmed) return;

    btnEl.disabled = true;
    btnEl.textContent = 'Removing...';

    const { error } = await supabaseClient
        .from('site_reviews')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting review:', error);
        alert('Could not remove review: ' + error.message);
        btnEl.disabled = false;
        btnEl.textContent = 'Remove from site';
        return;
    }

    loadReviews();
}

// ---------- FAQs section ----------
const faqsArea = document.getElementById('faqsArea');

async function loadFaqs() {
    faqsArea.innerHTML = '<div class="state-msg">Loading FAQs...</div>';

    const { data, error } = await supabaseClient
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error loading FAQs:', error);
        faqsArea.innerHTML = `<div class="state-msg">Could not load FAQs: ${escapeHtml(error.message)}</div>`;
        return;
    }

    renderFaqs(data);
}

function renderFaqs(rows) {
    if (!rows || rows.length === 0) {
        faqsArea.innerHTML = '<div class="state-msg">No FAQs yet. Add one above to get started.</div>';
        return;
    }

    faqsArea.innerHTML = rows.map(f => `
    <div class="faq-admin-card" data-id="${escapeHtml(f.id)}">
      <div class="fleet-field">
        <label>Category</label>
        <input type="text" class="faq-category-input" value="${escapeHtml(f.category)}">
      </div>
      <div class="fleet-field">
        <label>Question</label>
        <input type="text" class="faq-question-input" value="${escapeHtml(f.question)}">
      </div>
      <div class="fleet-field">
        <label>Answer</label>
        <textarea class="faq-answer-input">${escapeHtml(f.answer)}</textarea>
      </div>
      <div class="review-admin-actions">
        <button class="save-price-btn save-faq-btn" data-id="${escapeHtml(f.id)}">Save</button>
        <button class="delete-review-btn delete-faq-btn" data-id="${escapeHtml(f.id)}">Delete</button>
        <span class="save-status" id="save-faq-status-${escapeHtml(f.id)}"></span>
      </div>
    </div>
  `).join('');

    faqsArea.querySelectorAll('.save-faq-btn').forEach(btn => {
        btn.addEventListener('click', () => saveFaq(btn.dataset.id, btn));
    });
    faqsArea.querySelectorAll('.delete-faq-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFaq(btn.dataset.id, btn));
    });
}

async function saveFaq(id, btnEl) {
    const card = btnEl.closest('.faq-admin-card');
    const statusEl = document.getElementById(`save-faq-status-${id}`);

    const category = card.querySelector('.faq-category-input').value.trim();
    const question = card.querySelector('.faq-question-input').value.trim();
    const answer = card.querySelector('.faq-answer-input').value.trim();

    if (!category || !question || !answer) {
        statusEl.textContent = 'All fields required';
        statusEl.className = 'save-status error';
        return;
    }

    btnEl.disabled = true;
    btnEl.textContent = 'Saving...';
    statusEl.textContent = '';

    const { error } = await supabaseClient
        .from('faqs')
        .update({ category, question, answer, updated_at: new Date().toISOString() })
        .eq('id', id);

    btnEl.disabled = false;
    btnEl.textContent = 'Save';

    if (error) {
        console.error('Error saving FAQ:', error);
        statusEl.textContent = 'Failed to save';
        statusEl.className = 'save-status error';
        return;
    }

    statusEl.textContent = 'Saved ✓';
    statusEl.className = 'save-status success';
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
}

async function deleteFaq(id, btnEl) {
    const confirmed = window.confirm('Delete this FAQ? This cannot be undone.');
    if (!confirmed) return;

    btnEl.disabled = true;
    btnEl.textContent = 'Deleting...';

    const { error } = await supabaseClient
        .from('faqs')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting FAQ:', error);
        alert('Could not delete FAQ: ' + error.message);
        btnEl.disabled = false;
        btnEl.textContent = 'Delete';
        return;
    }

    loadFaqs();
}

const addFaqBtn = document.getElementById('addFaqBtn');
if (addFaqBtn) {
    addFaqBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('addFaqStatus');
        const categoryInput = document.getElementById('newFaqCategory');
        const questionInput = document.getElementById('newFaqQuestion');
        const answerInput = document.getElementById('newFaqAnswer');

        const category = categoryInput.value.trim();
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();

        if (!category || !question || !answer) {
            statusEl.textContent = 'All fields required';
            statusEl.className = 'save-status error';
            return;
        }

        addFaqBtn.disabled = true;
        addFaqBtn.textContent = 'Adding...';

        const { error } = await supabaseClient
            .from('faqs')
            .insert([{ category, question, answer, display_order: 999 }]);

        addFaqBtn.disabled = false;
        addFaqBtn.textContent = 'Add FAQ';

        if (error) {
            console.error('Error adding FAQ:', error);
            statusEl.textContent = 'Failed to add';
            statusEl.className = 'save-status error';
            return;
        }

        categoryInput.value = '';
        questionInput.value = '';
        answerInput.value = '';
        statusEl.textContent = 'Added ✓';
        statusEl.className = 'save-status success';
        setTimeout(() => { statusEl.textContent = ''; }, 2500);

        loadFaqs();
    });
}

// ---------- Contact Details / Site Settings section ----------
const contactSettingsArea = document.getElementById('contactSettingsArea');

async function loadContactSettings() {
    contactSettingsArea.innerHTML = '<div class="state-msg">Loading contact settings...</div>';

    const { data, error } = await supabaseClient
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('Error loading contact settings:', error);
        contactSettingsArea.innerHTML = `<div class="state-msg">Could not load contact settings: ${escapeHtml(error ? error.message : 'no data')}</div>`;
        return;
    }

    renderContactSettings(data);
}

function renderContactSettings(s) {
    contactSettingsArea.innerHTML = `
    <div class="fleet-field">
      <label>Phone Number (digits only, e.g. 00447833814223)</label>
      <input type="text" id="settingPhone" value="${escapeHtml(s.phone_number)}">
    </div>
    <div class="fleet-field">
      <label>WhatsApp Number (digits only, no leading 00, e.g. 447833814223)</label>
      <input type="text" id="settingWhatsappNumber" value="${escapeHtml(s.whatsapp_number)}">
    </div>
    <div class="fleet-field">
      <label>WhatsApp Pre-filled Message</label>
      <textarea id="settingWhatsappMessage">${escapeHtml(s.whatsapp_message)}</textarea>
    </div>
    <div class="fleet-field">
      <label>Email Address</label>
      <input type="text" id="settingEmail" value="${escapeHtml(s.email)}">
    </div>
    <div class="fleet-field">
      <label>Office Hours Text</label>
      <input type="text" id="settingHours" value="${escapeHtml(s.office_hours)}">
    </div>
    <button class="save-price-btn" id="saveContactSettingsBtn">Save Changes</button>
    <span class="save-status" id="saveContactSettingsStatus"></span>
  `;

    document.getElementById('saveContactSettingsBtn').addEventListener('click', saveContactSettings);
}

async function saveContactSettings() {
    const statusEl = document.getElementById('saveContactSettingsStatus');
    const btnEl = document.getElementById('saveContactSettingsBtn');

    const phone_number = document.getElementById('settingPhone').value.trim();
    const whatsapp_number = document.getElementById('settingWhatsappNumber').value.trim();
    const whatsapp_message = document.getElementById('settingWhatsappMessage').value.trim();
    const email = document.getElementById('settingEmail').value.trim();
    const office_hours = document.getElementById('settingHours').value.trim();

    if (!phone_number || !whatsapp_number || !whatsapp_message || !email || !office_hours) {
        statusEl.textContent = 'All fields required';
        statusEl.className = 'save-status error';
        return;
    }

    btnEl.disabled = true;
    btnEl.textContent = 'Saving...';
    statusEl.textContent = '';

    const { error } = await supabaseClient
        .from('site_settings')
        .update({ phone_number, whatsapp_number, whatsapp_message, email, office_hours })
        .eq('id', 1);

    btnEl.disabled = false;
    btnEl.textContent = 'Save Changes';

    if (error) {
        console.error('Error saving contact settings:', error);
        statusEl.textContent = 'Failed to save';
        statusEl.className = 'save-status error';
        return;
    }

    statusEl.textContent = 'Saved ✓ (updates everywhere on the site)';
    statusEl.className = 'save-status success';
    setTimeout(() => { statusEl.textContent = ''; }, 3500);
}

// ---------- Settings: Announcement Popup ----------
const announcementSettingsArea = document.getElementById('announcementSettingsArea');

async function loadAnnouncementSettings() {
    announcementSettingsArea.innerHTML = '<div class="state-msg">Loading...</div>';

    const { data, error } = await supabaseClient
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('Error loading announcement settings:', error);
        announcementSettingsArea.innerHTML = `<div class="state-msg">Could not load: ${escapeHtml(error ? error.message : 'no data')}</div>`;
        return;
    }

    renderAnnouncementSettings(data);
}

function renderAnnouncementSettings(s) {
    announcementSettingsArea.innerHTML = `
    <div class="fleet-field">
      <label>
        <input type="checkbox" id="announceEnabledCheckbox" ${s.announcement_enabled ? 'checked' : ''}>
        Show popup to visitors
      </label>
    </div>
    <div class="fleet-field">
      <label>Popup Title</label>
      <input type="text" id="announceTitleInput" value="${escapeHtml(s.announcement_title)}">
    </div>
    <div class="fleet-field">
      <label>Popup Text</label>
      <textarea id="announceTextInput">${escapeHtml(s.announcement_text)}</textarea>
    </div>
    <div class="fleet-field">
      <label>Button Text</label>
      <input type="text" id="announceButtonInput" value="${escapeHtml(s.announcement_button_text)}">
    </div>
    <button class="save-price-btn" id="saveAnnouncementBtn">Save Changes</button>
    <span class="save-status" id="saveAnnouncementStatus"></span>
  `;

    document.getElementById('saveAnnouncementBtn').addEventListener('click', saveAnnouncementSettings);
}

async function saveAnnouncementSettings() {
    const statusEl = document.getElementById('saveAnnouncementStatus');
    const btnEl = document.getElementById('saveAnnouncementBtn');

    const announcement_enabled = document.getElementById('announceEnabledCheckbox').checked;
    const announcement_title = document.getElementById('announceTitleInput').value.trim();
    const announcement_text = document.getElementById('announceTextInput').value.trim();
    const announcement_button_text = document.getElementById('announceButtonInput').value.trim();

    if (!announcement_title || !announcement_text || !announcement_button_text) {
        statusEl.textContent = 'All fields required';
        statusEl.className = 'save-status error';
        return;
    }

    btnEl.disabled = true;
    btnEl.textContent = 'Saving...';
    statusEl.textContent = '';

    const { error } = await supabaseClient
        .from('site_settings')
        .update({ announcement_enabled, announcement_title, announcement_text, announcement_button_text })
        .eq('id', 1);

    btnEl.disabled = false;
    btnEl.textContent = 'Save Changes';

    if (error) {
        console.error('Error saving announcement settings:', error);
        statusEl.textContent = 'Failed to save';
        statusEl.className = 'save-status error';
        return;
    }

    statusEl.textContent = 'Saved ✓';
    statusEl.className = 'save-status success';
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
}

// ---------- Settings: Change Admin Password ----------
const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('changePasswordStatus');
        const newPassword = document.getElementById('newPasswordInput').value;
        const confirmPassword = document.getElementById('confirmPasswordInput').value;

        if (!newPassword || newPassword.length < 6) {
            statusEl.textContent = 'Password must be at least 6 characters';
            statusEl.className = 'save-status error';
            return;
        }

        if (newPassword !== confirmPassword) {
            statusEl.textContent = 'Passwords do not match';
            statusEl.className = 'save-status error';
            return;
        }

        changePasswordBtn.disabled = true;
        changePasswordBtn.textContent = 'Updating...';
        statusEl.textContent = '';

        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = 'Update Password';

        if (error) {
            console.error('Error updating password:', error);
            statusEl.textContent = 'Failed: ' + error.message;
            statusEl.className = 'save-status error';
            return;
        }

        document.getElementById('newPasswordInput').value = '';
        document.getElementById('confirmPasswordInput').value = '';
        statusEl.textContent = 'Password updated ✓';
        statusEl.className = 'save-status success';
        setTimeout(() => { statusEl.textContent = ''; }, 3500);
    });
}

// Safety net: if the browser restores this page from back-forward cache
// (e.g. after logout, pressing the Back button), force a fresh reload so
// the session check below runs again instead of showing a stale cached view.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

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

if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
        if (!currentBookings || currentBookings.length === 0) {
            alert('No bookings available to export.');
            return;
        }

        const headers = ['ID', 'Created At', 'Pickup Date/Time', 'Customer Name', 'Phone Number', 'Pickup Location', 'Dropoff Location', 'Fare (£)', 'Status', 'Notes'];

        const rows = currentBookings.map(b => [
            b.id || '',
            b.created_at || '',
            b.date_time || '',
            b.name || '',
            b.phone || '',
            b.pickup_location || '',
            b.dropoff_location || '',
            b.fare !== null && b.fare !== undefined ? b.fare : '',
            b.status || '',
            b.notes || ''
        ]);

        function formatCsvCell(val) {
            if (val === null || val === undefined) return '';
            let formatted = String(val);
            if (formatted.includes('"') || formatted.includes(',') || formatted.includes('\n') || formatted.includes('\r')) {
                formatted = `"${formatted.replace(/"/g, '""')}"`;
            }
            return formatted;
        }

        const csvContent = [
            headers.map(formatCsvCell).join(','),
            ...rows.map(row => row.map(formatCsvCell).join(','))
        ].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `wizz_cars_bookings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

// Redirect to login if the session ever ends (e.g. token expiry) while on this page
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'login.html';
    }
});

initDashboard();