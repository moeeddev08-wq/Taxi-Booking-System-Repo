// Reviews Loader — loads Google reviews + approved site reviews, and handles new submissions

function escapeHtmlPublic(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function starsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fa-solid fa-star${i <= rating ? '' : ' star-empty'}"></i>`;
    }
    return html;
}

function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    const days = Math.floor(seconds / 86400);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

async function loadGoogleReviews() {
    const container = document.getElementById('google-reviews-list');
    if (!container) return;

    const { data, error } = await supabaseClient
        .from('google_reviews')
        .select('*')
        .order('review_time', { ascending: false });

    if (error || !data || data.length === 0) {
        container.innerHTML = '<div class="state-msg">No Google reviews synced yet. Check back soon!</div>';
        return;
    }

    container.innerHTML = data.map(r => `
        <div class="review-card">
            <div class="review-card-head">
                <span class="review-author">${escapeHtmlPublic(r.author_name)}</span>
                <span class="review-time">${timeAgo(r.review_time)}</span>
            </div>
            <div class="review-stars">${starsHtml(r.rating)}</div>
            <p class="review-text">${escapeHtmlPublic(r.review_text)}</p>
        </div>
    `).join('');
}

async function loadSiteReviews() {
    const container = document.getElementById('site-reviews-list');
    if (!container) return;

    const { data, error } = await supabaseClient
        .from('site_reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        container.innerHTML = '<div class="state-msg">No reviews yet — be the first to share your experience!</div>';
        return;
    }

    container.innerHTML = data.map(r => `
        <div class="review-card">
            <div class="review-card-head">
                <span class="review-author">${escapeHtmlPublic(r.name)}</span>
                <span class="review-time">${timeAgo(r.created_at)}</span>
            </div>
            <div class="review-stars">${starsHtml(r.rating)}</div>
            <p class="review-text">${escapeHtmlPublic(r.message)}</p>
        </div>
    `).join('');
}

function initStarRating() {
    const stars = document.querySelectorAll('.star-input');
    const ratingInput = document.getElementById('review-rating');
    if (!stars.length || !ratingInput) return;

    function paintStars(value) {
        stars.forEach(star => {
            const starValue = parseInt(star.dataset.value, 10);
            star.classList.toggle('star-empty', starValue > value);
        });
    }

    paintStars(0);

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value, 10);
            ratingInput.value = value;
            paintStars(value);
        });
        star.addEventListener('mouseenter', () => {
            paintStars(parseInt(star.dataset.value, 10));
        });
    });

    const starWrap = document.getElementById('star-rating');
    if (starWrap) {
        starWrap.addEventListener('mouseleave', () => {
            paintStars(parseInt(ratingInput.value, 10) || 0);
        });
    }
}

function initReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;

    const submitBtn = document.getElementById('review-submit-btn');
    const originalBtnText = submitBtn.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot spam check
        const honeypot = document.getElementById('review-website');
        if (honeypot && honeypot.value !== '') return;

        const name = document.getElementById('review-name').value.trim();
        const message = document.getElementById('review-message').value.trim();
        const rating = parseInt(document.getElementById('review-rating').value, 10);

        if (!name || !message || !rating || rating < 1 || rating > 5) {
            alert('Please fill in your name, a review message, and select a star rating.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const { error } = await supabaseClient
            .from('site_reviews')
            .insert([{ name, rating, message, status: 'pending' }]);

        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (error) {
            console.error('Error submitting review:', error);
            alert('Could not submit your review right now. Please try again shortly.');
            return;
        }

        form.reset();
        document.getElementById('review-rating').value = 0;
        document.querySelectorAll('.star-input').forEach(s => s.classList.add('star-empty'));

        alert('Thank you! Your review has been submitted and will appear here once it\'s approved.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadGoogleReviews();
    loadSiteReviews();
    initStarRating();
    initReviewForm();
});