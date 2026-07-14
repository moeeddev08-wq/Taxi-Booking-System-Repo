// Wizz Cars Godalming - Interactive Client Script
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxO_pqU4cEGr4XskzJyrQBlnGe8OaudtPqZPd0OpAmwGqqw6v0sHYheqKVfvD5eJWTA/exec";


document.addEventListener('DOMContentLoaded', () => {
    initScrollHeader();
    initMobileMenu();
    initFareEstimator();
    initTestimonialSlider();
    initContactForm();
});

// 1. Sticky Navigation Scroll Effect
function initScrollHeader() {
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scroll-scrolled');
        } else {
            header.classList.remove('scroll-scrolled');
        }
    });
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
    vehicleSelector.value = vehicleClass;

    // Trigger change event to update the booking summary
    const event = new Event('change');
    vehicleSelector.dispatchEvent(event);

    // Smooth scroll to form
    const bookingSection = document.getElementById('booking-section');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
}

// 4. Interactive Booking Fare Estimator
function initFareEstimator() {
    const bookingForm = document.getElementById('booking-form');
    const pickupInput = document.getElementById('pickup-address');
    const dropoffInput = document.getElementById('dropoff-address');
    const serviceType = document.getElementById('service-type');
    const vehicleType = document.getElementById('vehicle-type');
    const passengerCount = document.getElementById('passenger-count');
    const luggageCount = document.getElementById('luggage-count');

    // Fare outputs
    const farePrice = document.getElementById('fare-price');
    const fareNotes = document.getElementById('fare-notes');
    const summaryVehicle = document.getElementById('summary-vehicle');
    const summaryPassengers = document.getElementById('summary-passengers');
    const summaryLuggage = document.getElementById('summary-luggage');
    const summaryDistance = document.getElementById('summary-distance');

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

    // Pseudorandom distance generator based on address character codes (stable output)
    function calculatePseudoDistance(pickup, dropoff) {
        if (!pickup || !dropoff) return 0;
        let combined = (pickup + dropoff).toLowerCase().replace(/\s/g, '');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Returns a stable distance between 4 and 28 miles
        return Math.abs(hash % 25) + 4;
    }

    // Main Calculator Function
    function calculateFare() {
        const pickup = pickupInput.value.trim();
        const dropoff = dropoffInput.value.trim();
        const service = serviceType.value;
        const vehicle = vehicleType.value;

        // Update summary text
        const vehicleNames = {
            saloon: 'Standard Saloon',
            executive: 'Executive Saloon',
            mpv: 'Luxury MPV (Minivan)'
        };
        const vehiclePassengers = { saloon: 'Up to 4', executive: 'Up to 4', mpv: 'Up to 8' };
        const vehicleLuggage = { saloon: 'Up to 3 bags', executive: 'Up to 3 bags', mpv: 'Up to 6 bags' };

        summaryVehicle.textContent = vehicleNames[vehicle];
        summaryPassengers.textContent = vehiclePassengers[vehicle];
        summaryLuggage.textContent = vehicleLuggage[vehicle];

        if (!pickup || !dropoff) {
            farePrice.textContent = '£0.00';
            fareNotes.textContent = 'Please enter pickup and dropoff addresses';
            summaryDistance.textContent = 'Awaiting route details';
            return;
        }

        let distance = calculatePseudoDistance(pickup, dropoff);
        let baseFare = 0;
        let perMileRate = 0;
        let isFixed = false;
        let routeName = '';

        // Check for common airport fixed routes
        const dropoffLower = dropoff.toLowerCase();
        const pickupLower = pickup.toLowerCase();

        if (dropoffLower.includes('heathrow') || pickupLower.includes('heathrow')) {
            baseFare = 85.00;
            isFixed = true;
            routeName = 'Heathrow Airport';
        } else if (dropoffLower.includes('gatwick') || pickupLower.includes('gatwick')) {
            baseFare = 85.00;
            isFixed = true;
            routeName = 'Gatwick Airport';
        } else if (dropoffLower.includes('luton') || pickupLower.includes('luton')) {
            baseFare = 170.00;
            isFixed = true;
            routeName = 'Luton Airport';
        } else if (dropoffLower.includes('stansted') || pickupLower.includes('stansted')) {
            baseFare = 190.00;
            isFixed = true;
            routeName = 'Stansted Airport';
        } else if (dropoffLower.includes('london city') || pickupLower.includes('london city')) {
            baseFare = 150.00;
            isFixed = true;
            routeName = 'London City Airport';
        } else if (dropoffLower.includes('st pancras') || pickupLower.includes('st pancras') || dropoffLower.includes('kings cross') || pickupLower.includes('kings cross')) {
            baseFare = 140.00;
            isFixed = true;
            routeName = 'St Pancras / Kings Cross';
        } else if (dropoffLower.includes('wimbledon') || pickupLower.includes('wimbledon')) {
            baseFare = 90.00;
            isFixed = true;
            routeName = 'Wimbledon Stadium';
        } else if (dropoffLower.includes('oval') || pickupLower.includes('oval') || dropoffLower.includes('lords') || pickupLower.includes('lords')) {
            baseFare = 120.00;
            isFixed = true;
            routeName = 'Lords / Oval Cricket Ground';
        } else if (dropoffLower.includes('south west london') || pickupLower.includes('south west london')) {
            baseFare = 120.00;
            isFixed = true;
            routeName = 'South West London';
        } else if (dropoffLower.includes('central london') || pickupLower.includes('central london')) {
            baseFare = 130.00;
            isFixed = true;
            routeName = 'Central London';
        } else if (dropoffLower.includes('london') || pickupLower.includes('london')) {
            baseFare = 120.00;
            isFixed = true;
            routeName = 'London';
        }

        // Standard rates calculation if not fixed airport route
        if (!isFixed) {
            switch (service) {
                case 'local':
                    baseFare = 6.00;
                    perMileRate = 2.50;
                    break;
                case 'airport':
                    baseFare = 15.00;
                    perMileRate = 2.20;
                    break;
                case 'long-distance':
                    baseFare = 12.00;
                    perMileRate = 2.30;
                    break;
                case 'executive':
                    baseFare = 25.00;
                    perMileRate = 3.80;
                    break;
                default:
                    baseFare = 6.00;
                    perMileRate = 2.50;
            }
        }

        // Vehicle multipliers
        let vehicleMultiplier = 1.0;
        if (vehicle === 'executive') vehicleMultiplier = 1.5;
        if (vehicle === 'mpv') vehicleMultiplier = 1.8;

        let totalFare = 0;
        if (isFixed) {
            totalFare = baseFare * vehicleMultiplier;
            fareNotes.textContent = `*Fixed Route Rate for ${routeName}`;
            summaryDistance.textContent = 'Fixed Airport Route';
        } else {
            totalFare = (baseFare + (distance * perMileRate)) * vehicleMultiplier;
            fareNotes.textContent = `*Estimated Route Rate (Distance: ~${distance} miles)`;
            summaryDistance.textContent = `~${distance} miles`;
        }

        // Format and display
        farePrice.textContent = `£${totalFare.toFixed(2)}`;
    }

    // Attach Event Listeners for Live Calculating
    const inputs = [pickupInput, dropoffInput, serviceType, vehicleType, passengerCount, luggageCount];
    inputs.forEach(input => {
        input.addEventListener('change', calculateFare);
        input.addEventListener('input', calculateFare);
    });
    calculateFare()

    // Make popular routes pre-fill the form when clicked (from side-panel or pricing plan table)
    const routeItems = document.querySelectorAll('.route-rate-item, .pricing-row');
    routeItems.forEach(item => {
        item.addEventListener('click', () => {
            const dest = item.getAttribute('data-destination') || item.getAttribute('data-route');
            pickupInput.value = 'Godalming, Surrey';

            if (dest === 'Heathrow') {
                dropoffInput.value = 'Heathrow Airport, Hounslow';
            } else if (dest === 'Gatwick') {
                dropoffInput.value = 'Gatwick Airport, Horley';
            } else if (dest === 'Luton') {
                dropoffInput.value = 'Luton Airport, Luton';
            } else if (dest === 'Stansted') {
                dropoffInput.value = 'Stansted Airport, Stansted Mountfitchet';
            } else if (dest === 'London City') {
                dropoffInput.value = 'London City Airport, Royal Docks';
            } else if (dest === 'Kings Cross') {
                dropoffInput.value = 'St Pancras / Kings Cross Station, London';
            } else if (dest === 'South West London') {
                dropoffInput.value = 'South West London, London';
            } else if (dest === 'Oval') {
                dropoffInput.value = 'Lords / Oval Cricket Ground, London';
            } else if (dest === 'Wimbledon') {
                dropoffInput.value = 'Wimbledon Stadium, London';
            } else if (dest === 'Central London') {
                dropoffInput.value = 'Central London, London';
            }
            serviceType.value = 'airport';

            // Trigger calculation
            calculateFare();

            // Smooth scroll to form fields
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

    // Handle Form Submission (Display Modal Popup)
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Honeypot spam check (silently drop bot submissions)
        const honeypot = document.getElementById('website-url');
        if (honeypot && honeypot.value !== '') {
            return;
        }

        // Final validations
        if (!pickupInput.value || !dropoffInput.value) return;

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

        const vehicleSelector = document.getElementById('vehicle-type');
        document.getElementById('modal-vehicle').textContent = vehicleSelector.options[vehicleSelector.selectedIndex].text;

        document.getElementById('modal-fare').textContent = farePrice.textContent;

        // Send booking data to Google Sheet + Email notification
        const nameField = document.getElementById('customer-name');
        const phoneField = document.getElementById('customer-phone');

        fetch(GOOGLE_SHEET_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({
                name: nameField ? nameField.value : '',
                phone: phoneField ? phoneField.value : '',
                pickup: pickupInput.value,
                dropoff: dropoffInput.value,
                vehicle: vehicleSelector.options[vehicleSelector.selectedIndex].text,
                fare: farePrice.textContent,
                bookingCode: bookingCode
            })
        }).catch((err) => {
            console.error('Booking submission failed to reach Google Sheet:', err);
        });

        // Open Modal
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    });

    // Close Modal Functions
    const closeModal = () => {
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Unlock scroll
        bookingForm.reset();

        // Re-set defaults
        dateInput.value = today;
        timeInput.value = `${hours}:${minutes}`;
        calculateFare();
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

// 6. Quick Inquiry Contact Form Submission Mock
function initContactForm() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Mocking submission success with a simple elegant alert
        const originalBtnText = form.querySelector('button').textContent;
        const btn = form.querySelector('button');

        btn.textContent = 'Sending...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = 'Message Sent Successfully!';
            btn.style.background = '#28a745'; // green success
            btn.style.color = '#fff';

            setTimeout(() => {
                form.reset();
                btn.textContent = originalBtnText;
                btn.style.background = ''; // restore CSS
                btn.style.color = '';
                btn.disabled = false;
            }, 3000);
        }, 1200);
    });
}
