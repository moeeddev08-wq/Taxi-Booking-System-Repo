import supabase from "./supabase.js";

const {
    data: { session },
} = await supabase.auth.getSession();

if (!session) {
    window.location.replace("index.html");
}

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
        return;
    }

    window.location.replace("index.html");
});

// ---------- Bookings Section ----------

const bookingsBody = document.getElementById("bookings-body");
const newBookingBadge = document.getElementById("new-booking-badge");

// Fetch all bookings, newest first
async function loadBookings() {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading bookings:", error);
        bookingsBody.innerHTML = `<tr><td colspan="9">Failed to load bookings.</td></tr>`;
        return;
    }

    renderBookings(data);
}

// Render bookings into the table
function renderBookings(bookings) {
    if (!bookings || bookings.length === 0) {
        bookingsBody.innerHTML = `<tr><td colspan="9">No bookings yet.</td></tr>`;
        return;
    }

    bookingsBody.innerHTML = "";

    bookings.forEach((booking) => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", booking.id);

        const fareDisplay = booking.fare
            ? `£${booking.fare}`
            : `<input type="number" placeholder="Enter fare" style="width: 70px;" class="fare-input" />`;

        row.innerHTML = `
            <td>${new Date(booking.date_time).toLocaleString()}</td>
            <td>${booking.name || ""}</td>
            <td>${booking.phone || ""}</td>
            <td>${booking.pickup_location || ""}</td>
            <td>${booking.dropoff_location || ""}</td>
            <td class="fare-cell">${fareDisplay}</td>
            <td class="status-cell"><strong>${booking.status}</strong></td>
            <td style="max-width: 200px; font-size: 12px;">${booking.notes || ""}</td>
            <td>
                <button class="accept-btn" ${booking.status !== "pending" ? "disabled" : ""}>Accept</button>
                <button class="reject-btn" ${booking.status !== "pending" ? "disabled" : ""}>Reject</button>
            </td>
        `;

        bookingsBody.appendChild(row);
    });

    attachActionListeners();
}

// Attach Accept/Reject button listeners
function attachActionListeners() {
    document.querySelectorAll(".accept-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const row = e.target.closest("tr");
            const id = row.getAttribute("data-id");
            await updateBookingStatus(id, "accepted", row);
        });
    });

    document.querySelectorAll(".reject-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const row = e.target.closest("tr");
            const id = row.getAttribute("data-id");
            await updateBookingStatus(id, "rejected", row);
        });
    });
}

// Update booking status (and fare if manually entered)
async function updateBookingStatus(id, newStatus, row) {
    const updatePayload = { status: newStatus };

    // If there's a manual fare input (fare was NULL), grab its value
    const fareInput = row.querySelector(".fare-input");
    if (fareInput && fareInput.value) {
        updatePayload.fare = parseFloat(fareInput.value);
    }

    const { error } = await supabase
        .from("bookings")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        console.error("Error updating booking:", error);
        alert("Failed to update booking. Check console.");
        return;
    }

    loadBookings(); // refresh table
}

// Initial load
loadBookings();

// ---------- Realtime: Show badge + auto-refresh when new booking arrives ----------
supabase
    .channel("bookings-changes")
    .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
            newBookingBadge.style.display = "inline";
            loadBookings();

            // Hide badge after 5 seconds
            setTimeout(() => {
                newBookingBadge.style.display = "none";
            }, 5000);
        }
    )
    .subscribe();