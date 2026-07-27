// Site Contact Loader — runs on every page.
// Pulls phone/WhatsApp/email/hours from Supabase "site_settings" and applies them
// to the header, floating buttons, and (if present) the Contact page's own fields.

async function loadSiteContactSettings() {
    const { data, error } = await supabaseClient
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('Could not load site settings:', error);
        return;
    }

    const phone = data.phone_number;
    const whatsappNumber = data.whatsapp_number;
    const whatsappMessage = encodeURIComponent(data.whatsapp_message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    const telUrl = `tel:${phone}`;

    // Header phone button
    const headerPhoneBtn = document.getElementById('header-phone-btn');
    if (headerPhoneBtn) {
        headerPhoneBtn.href = telUrl;
        const span = headerPhoneBtn.querySelector('span');
        if (span) span.textContent = phone;
    }

    // Header WhatsApp button
    const headerWhatsappBtn = document.getElementById('header-whatsapp-btn');
    if (headerWhatsappBtn) headerWhatsappBtn.href = whatsappUrl;

    // Announcement popup button
    const announceBtn = document.getElementById('announce-btn');
    if (announceBtn) announceBtn.href = telUrl;

    // Floating action buttons
    const floatPhoneBtn = document.getElementById('float-phone-btn');
    if (floatPhoneBtn) floatPhoneBtn.href = telUrl;

    const floatWhatsappBtn = document.getElementById('float-whatsapp-btn');
    if (floatWhatsappBtn) floatWhatsappBtn.href = whatsappUrl;

    // Contact page specific fields (only present on contact.html)
    const contactPhoneLink = document.getElementById('contact-phone-link');
    if (contactPhoneLink) {
        contactPhoneLink.href = telUrl;
        contactPhoneLink.textContent = phone;
    }

    const contactEmailLink = document.getElementById('contact-email-link');
    if (contactEmailLink) {
        contactEmailLink.href = `mailto:${data.email}`;
        contactEmailLink.textContent = data.email;
    }

    const contactHoursText = document.getElementById('contact-hours-text');
    if (contactHoursText) contactHoursText.textContent = data.office_hours;

    // Announcement popup content
    const announcePopup = document.getElementById('announce-popup');
    if (announcePopup) {
        const titleEl = announcePopup.querySelector('h3');
        const textEl = announcePopup.querySelector('p');
        const btnEl = document.getElementById('announce-btn');

        if (titleEl) titleEl.textContent = data.announcement_title;
        if (textEl) textEl.textContent = data.announcement_text;
        if (btnEl) btnEl.textContent = data.announcement_button_text;
    }

    // Whether the popup is allowed to show at all (checked by app.js before it displays)
    window.announcementEnabled = data.announcement_enabled;
}

document.addEventListener('DOMContentLoaded', loadSiteContactSettings);