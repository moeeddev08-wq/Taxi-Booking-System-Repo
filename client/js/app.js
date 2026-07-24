// Wizz Cars Godalming - Interactive Client Script
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxO_pqU4cEGr4XskzJyrQBlnGe8OaudtPqZPd0OpAmwGqqw6v0sHYheqKVfvD5eJWTA/exec";

function sanitizeForSheet(value) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (/^[=+\-@]/.test(trimmed)) {
        return "'" + trimmed;
    }
    return value;
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollHeader();
    initMobileMenu();
    initFareEstimator();
    initTestimonialSlider();
    initContactForm();
    initAnnouncePopup();
});

// 8. Light/Dark Mode Theme Toggle
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;

    // Check saved preference; default is light mode (root variables)
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// 1. Sticky Navigation Scroll Effect
function initScrollHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scroll-scrolled');
        } else {
            header.classList.remove('scroll-scrolled');
        }
    });
}


// 7. Top Announcement Popup (shows once per browser session)
function initAnnouncePopup() {
    const popup = document.getElementById('announce-popup');
    const backdrop = document.getElementById('announce-backdrop');
    const closeBtn = document.getElementById('announce-close');
    const ctaBtn = document.getElementById('announce-btn');
    if (!popup || !backdrop) return;

    // Only show once per browser session (not on every single refresh)
    if (sessionStorage.getItem('announceDismissed') === 'true') return;

    setTimeout(() => {
        popup.classList.add('show');
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 1000);

    const dismiss = () => {
        popup.classList.remove('show');
        backdrop.classList.remove('show');
        document.body.style.overflow = 'auto';
        sessionStorage.setItem('announceDismissed', 'true');
    };

    closeBtn.addEventListener('click', dismiss);
    ctaBtn.addEventListener('click', dismiss);
    backdrop.addEventListener('click', dismiss); // clicking outside the popup closes it
}

// 2. Mobile Responsive Menu
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('active');
        mainNav.classList.toggle('active');
    });

    // Close menu when clicking nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleBtn.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });
}

// 3b. Services Page Tab Switcher
function switchServiceTab(serviceKey) {
    const tabs = document.querySelectorAll('#service-tabs .tab-btn');
    const contents = document.querySelectorAll('#services-page-header .fleet-tab-content');

    tabs.forEach(tab => {
        if (tab.id === `tab-btn-${serviceKey}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    contents.forEach(content => {
        if (content.id === `service-content-${serviceKey}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}


// 3. Fleet Showcase Tab Switcher
function switchFleetTab(vehicleClass) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.fleet-tab-content');

    // Update active tab buttons
    tabs.forEach(tab => {
        if (tab.id === `tab-btn-${vehicleClass}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update active content blocks
    contents.forEach(content => {
        if (content.id === `fleet-content-${vehicleClass}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Quick action: Select vehicle from Fleet Showcase and pre-fill form
function selectFleetInForm(vehicleClass) {
    const vehicleSelector = document.getElementById('vehicle-type');
    const passengerSelector = document.getElementById('passenger-count');
    const luggageSelector = document.getElementById('luggage-count');

    vehicleSelector.value = vehicleClass;

    // Match passenger/luggage defaults to the fleet card details
    const defaults = {
        saloon: { passengers: '4', luggage: '3' },
        executive: { passengers: '4', luggage: '3' },
        mpv: { passengers: '8', luggage: '4' }
    };

    const setValues = defaults[vehicleClass];
    if (setValues) {
        passengerSelector.value = setValues.passengers;
        luggageSelector.value = setValues.luggage;
    }

    // Trigger change event to update the booking summary
    const event = new Event('change');
    vehicleSelector.dispatchEvent(event);
    passengerSelector.dispatchEvent(event);
    luggageSelector.dispatchEvent(event);

    // Smooth scroll to form
    const bookingSection = document.getElementById('booking-section');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
}

// 4. Booking Form Handler (no live fare calculation — dispatch confirms pricing)
function initFareEstimator() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    const pickupInput = document.getElementById('pickup-address');
    const dropoffInput = document.getElementById('dropoff-address');
    const serviceType = document.getElementById('service-type');
    const vehicleType = document.getElementById('vehicle-type');
    const passengerCount = document.getElementById('passenger-count');
    const luggageCount = document.getElementById('luggage-count');

    // Populated dynamically from Supabase "prices" table — see loadPricesFromSupabase()
    let routeBasePrices = {};

    // Full address text used to pre-fill the dropoff field when a route is clicked
    const destinations = {
        'Heathrow': 'Heathrow Airport, Hounslow',
        'Gatwick': 'Gatwick Airport, Horley',
        'Luton': 'Luton Airport, Luton',
        'Stansted': 'Stansted Airport, Stansted Mountfitchet',
        'London City': 'London City Airport, Royal Docks',
        'Kings Cross': 'St Pancras / Kings Cross Station, London',
        'South West London': 'South West London, London',
        'Oval': 'Lords / Oval Cricket Ground, London',
        'Wimbledon': 'Wimbledon Stadium, London',
        'Central London': 'Central London, London'
    };

    // Vehicle multipliers — derived from fleet.html mileage rates (£3.00 / £4.50 / £5.50 per mile)
    const vehicleMultipliers = {
        saloon: 1,
        executive: 1.5,
        mpv: 1.83
    };

    function calculateFare(routeName, vehicleClass) {
        const basePrice = routeBasePrices[routeName];
        if (!basePrice) return null; // custom/manual address — admin will confirm fare
        const multiplier = vehicleMultipliers[vehicleClass] || 1;
        return Math.round(basePrice * multiplier);
    }

    // ---------- Pricing table: fetch live prices from Supabase and render ----------
    const pricingGrid = document.querySelector('.pricing-grid-list');

    function attachRouteClickHandlers() {
        const routeItems = document.querySelectorAll('.route-rate-item, .pricing-row');
        routeItems.forEach(item => {
            item.addEventListener('click', () => {
                const dest = item.getAttribute('data-destination') || item.getAttribute('data-route');
                pickupInput.value = 'Godalming, Surrey';
                document.getElementById('selected-route').value = dest;

                if (destinations[dest]) {
                    dropoffInput.value = destinations[dest];
                }
                serviceType.value = 'airport';

                // Smooth scroll to form
                pickupInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Pulse visual feedback
                pickupInput.classList.add('pulse-highlight');
                dropoffInput.classList.add('pulse-highlight');
                setTimeout(() => {
                    pickupInput.classList.remove('pulse-highlight');
                    dropoffInput.classList.remove('pulse-highlight');
                }, 1000);
            });
        });
    }

    function renderPricingTable(rows) {
        if (!pricingGrid) return;

        if (!rows || rows.length === 0) {
            pricingGrid.innerHTML = '<p style="text-align:center; padding:20px;">Pricing is being updated — please call us for a quote.</p>';
            return;
        }

        pricingGrid.innerHTML = rows.map(row => `
            <div class="pricing-row" data-route="${row.destination}">
                <span class="pricing-dest">${row.label}</span>
                <span class="pricing-leader"></span>
                <span class="pricing-badge">From £${row.price}</span>
            </div>
        `).join('');

        attachRouteClickHandlers();
    }

    async function loadPricesFromSupabase() {
        if (pricingGrid) {
            pricingGrid.innerHTML = '<p style="text-align:center; padding:20px;">Loading current rates...</p>';
        }

        const { data, error } = await supabaseClient
            .from('prices')
            .select('*')
            .order('label', { ascending: true });

        if (error) {
            console.error('Could not load prices:', error);
            if (pricingGrid) {
                pricingGrid.innerHTML = '<p style="text-align:center; padding:20px;">Rates unavailable right now — please call us for a quote.</p>';
            }
            return;
        }

        routeBasePrices = {};
        data.forEach(row => {
            routeBasePrices[row.destination] = row.price;
        });

        renderPricingTable(data);
    }

    loadPricesFromSupabase();

    // Modal elements
    const bookingModal = document.getElementById('booking-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalDoneBtn = document.getElementById('modal-done-btn');

    // Set default pickup date to today
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;

    // Set default pickup time to +30 minutes from now
    const timeInput = document.getElementById('booking-time');
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeInput.value = `${hours}:${minutes}`;

    // Pre-fill from URL parameters (?service=airport or ?vehicle=mpv from services.html / fleet.html)
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const vehicleParam = urlParams.get('vehicle');

    if (serviceParam) {
        const validServices = ['local', 'airport', 'long-distance', 'executive', 'events'];
        if (validServices.includes(serviceParam)) {
            serviceType.value = serviceParam;
        }
    }

    if (vehicleParam) {
        const vehicleDefaults = {
            saloon: { passengers: '4', luggage: '3' },
            executive: { passengers: '4', luggage: '3' },
            mpv: { passengers: '8', luggage: '4' }
        };
        if (vehicleDefaults[vehicleParam]) {
            vehicleType.value = vehicleParam;
            passengerCount.value = vehicleDefaults[vehicleParam].passengers;
            luggageCount.value = vehicleDefaults[vehicleParam].luggage;
        }
    }

    // Handle Form Submission (Display Modal Popup — no fare shown, dispatch confirms pricing)
    const submitBtn = document.getElementById('btn-submit-booking');
    const submitBtnOriginalText = submitBtn ? submitBtn.textContent : '';

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Honeypot spam check (silently drop bot submissions)
        const honeypot = document.getElementById('website-url');
        if (honeypot && honeypot.value !== '') {
            return;
        }

        // Final validations
        if (!pickupInput.value || !dropoffInput.value) return;

        // Show loading state on submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
        }

        // Generate dynamic mock Booking Code
        const randNum = Math.floor(10000 + Math.random() * 90000);
        const bookingCode = `WC-${randNum}`;
        document.getElementById('modal-booking-code').textContent = bookingCode;

        // Populate Modal Summary Info
        document.getElementById('modal-pickup').textContent = pickupInput.value;
        document.getElementById('modal-dropoff').textContent = dropoffInput.value;

        const dateVal = document.getElementById('booking-date').value;
        const timeVal = document.getElementById('booking-time').value;
        document.getElementById('modal-datetime').textContent = `${dateVal} at ${timeVal}`;

        document.getElementById('modal-vehicle').textContent = vehicleType.options[vehicleType.selectedIndex].text;

        // Send booking data to Google Sheet
        const nameField = document.getElementById('customer-name');
        const phoneField = document.getElementById('customer-phone');
        const emailField = document.getElementById('customer-email');
        const messageField = document.getElementById('booking-message');

        fetch(GOOGLE_SHEET_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({
                name: sanitizeForSheet(nameField ? nameField.value : ''),
                phone: sanitizeForSheet(phoneField ? phoneField.value : ''),
                email: sanitizeForSheet(emailField ? emailField.value : ''),
                pickup: sanitizeForSheet(pickupInput.value),
                dropoff: sanitizeForSheet(dropoffInput.value),
                serviceType: serviceType.options[serviceType.selectedIndex].text,
                vehicle: vehicleType.options[vehicleType.selectedIndex].text,
                passengers: passengerCount.value,
                luggage: luggageCount.value,
                message: sanitizeForSheet(messageField ? messageField.value : ''),
                bookingCode: bookingCode
            })
        }).catch((err) => {
            console.error('Booking submission failed to reach Google Sheet:', err);
        });

        // Send booking data to Supabase Database
        // Calculate fare based on selected route + vehicle type
        const selectedRoute = document.getElementById('selected-route').value;
        const calculatedFare = calculateFare(selectedRoute, vehicleType.value);

        const pickupDateTime = `${dateVal}T${timeVal}:00`;
        const extraNotes = `Email: ${emailField ? emailField.value : ''} | Service: ${serviceType.options[serviceType.selectedIndex].text} | Passengers: ${passengerCount.value} | Luggage: ${luggageCount.value} | Message: ${messageField ? messageField.value : 'None'}`;

        const bookingData = {
            name: nameField ? nameField.value : '',
            phone: phoneField ? phoneField.value : '',
            pickup_location: pickupInput.value,
            dropoff_location: dropoffInput.value,
            date_time: pickupDateTime,
            fare: calculatedFare,
            notes: extraNotes,
            status: "pending"
        };

        supabaseClient
            .from("bookings")
            .insert([bookingData])
            .then(({ data, error }) => {
                if (error) {
                    console.error("❌ Supabase Error:", error);
                    alert("Booking could not be saved. Please try again.");
                    return;
                }

                console.log("✅ Booking Saved:", data);
            });


        // Slight delay so the loading state is visible, then open modal
        setTimeout(() => {
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtnOriginalText;
            }
        }, 600);
    });

    // Close Modal Functions
    const closeModal = () => {
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        bookingForm.reset();

        // Re-set defaults
        dateInput.value = today;
        timeInput.value = `${hours}:${minutes}`;
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalDoneBtn.addEventListener('click', closeModal);
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeModal();
    });
}


// 5. Testimonials Slider Carousel
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    if (!prevBtn || !nextBtn || slides.length === 0) return;
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Reset boundary cases
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to target slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Auto rotate every 6 seconds
    function startAutoSlide() {
        slideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 6000);
    }

    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    // Button controls
    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoSlide();
    });

    // Dot controls
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoSlide();
        });
    });

    // Initialize auto slideshow
    startAutoSlide();
}

/// 6. Quick Inquiry Contact Form Submission
function initContactForm() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Honeypot spam check
        const honeypot = document.getElementById('inquiry-website');
        if (honeypot && honeypot.value !== '') {
            return;
        }

        const originalBtnText = form.querySelector('button').textContent;
        const btn = form.querySelector('button');
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const messageInput = form.querySelector('textarea');

        btn.textContent = 'Sending...';
        btn.disabled = true;

        fetch(GOOGLE_SHEET_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({
                type: 'inquiry',
                name: sanitizeForSheet(nameInput.value),
                email: sanitizeForSheet(emailInput.value),
                message: sanitizeForSheet(messageInput.value)
            })
        }).catch((err) => {
            console.error('Inquiry submission failed:', err);
        });

        setTimeout(() => {
            btn.textContent = 'Message Sent Successfully!';
            btn.style.background = '#28a745';
            btn.style.color = '#fff';

            setTimeout(() => {
                form.reset();
                btn.textContent = originalBtnText;
                btn.style.background = '';
                btn.style.color = '';
                btn.disabled = false;
            }, 3000);
        }, 1200);
    });
}

// 9. FAQ Accordion (only one answer open at a time)
function toggleFaq(button) {
    const item = button.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('active');

    document.querySelectorAll('.faq-item.active').forEach(openItem => {
        openItem.classList.remove('active');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}