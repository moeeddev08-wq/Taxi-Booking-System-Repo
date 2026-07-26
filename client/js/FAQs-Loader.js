// FAQs Loader — loads FAQs from Supabase, grouped by category, into FAQs.html

function escapeHtmlFaq(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function loadFaqsPublic() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    const { data, error } = await supabaseClient
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
        container.innerHTML = '<div class="state-msg">FAQs are being updated — please check back soon.</div>';
        return;
    }

    // Group by category, preserving the order categories first appear in
    const categories = [];
    const grouped = {};

    data.forEach(faq => {
        if (!grouped[faq.category]) {
            grouped[faq.category] = [];
            categories.push(faq.category);
        }
        grouped[faq.category].push(faq);
    });

    let html = '';
    categories.forEach(category => {
        html += `<h3 class="faq-category">${escapeHtmlFaq(category)}</h3>`;
        grouped[category].forEach(faq => {
            html += `
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">
                        <span>${escapeHtmlFaq(faq.question)}</span>
                        <i class="fa-solid fa-chevron-down faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        <p>${escapeHtmlFaq(faq.answer)}</p>
                    </div>
                </div>
            `;
        });
    });

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadFaqsPublic);