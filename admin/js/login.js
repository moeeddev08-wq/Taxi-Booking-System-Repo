import supabase from "./supabase.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert("Login Failed: " + error.message);
        return;
    }

    alert("Login Successful!");

    console.log(data);

    // Agle step me yahan dashboard par redirect karenge
    // window.location.href = "dashboard.html";
});