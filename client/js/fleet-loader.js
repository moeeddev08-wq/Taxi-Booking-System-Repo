// Fleet Loader — pulls vehicle details from Supabase "fleet" table and fills fleet.html
// Runs on fleet.html only. Requires supabase-client.js to already be loaded.
async function loadFleetContent() {
    const { data, error } = await supabaseClient
        .from('fleet')
        .select('*')
        .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
        console.error('Could not load fleet data:', error);
        return;
    }

    data.forEach(v => {
        const key = v.vehicle_key;

        const tabBtn = document.getElementById(`tab-btn-${key}`);
        if (tabBtn) tabBtn.textContent = v.title;

        const titleEl = document.getElementById(`fleet-title-${key}`);
        if (titleEl) titleEl.textContent = v.title;

        const subtitleEl = document.getElementById(`fleet-subtitle-${key}`);
        if (subtitleEl) subtitleEl.textContent = v.subtitle;

        const descEl = document.getElementById(`fleet-desc-${key}`);
        if (descEl) descEl.textContent = v.description;

        const passengersEl = document.getElementById(`spec-passengers-${key}`);
        if (passengersEl) passengersEl.textContent = v.passengers_text;

        const luggageEl = document.getElementById(`spec-luggage-${key}`);
        if (luggageEl) luggageEl.textContent = v.luggage_text;

        const spec3El = document.getElementById(`spec-3-${key}`);
        if (spec3El) spec3El.textContent = v.spec3_text;

        const spec4El = document.getElementById(`spec-4-${key}`);
        if (spec4El) spec4El.textContent = v.spec4_text;

        const pricingEl = document.getElementById(`fleet-pricing-${key}`);
        if (pricingEl) {
            pricingEl.innerHTML = `Rates from <strong>£${Number(v.price_per_mile).toFixed(2)}/mile</strong> (Minimum fare £${Number(v.minimum_fare).toFixed(2)})`;
        }
    });
}

document.addEventListener('DOMContentLoaded', loadFleetContent);