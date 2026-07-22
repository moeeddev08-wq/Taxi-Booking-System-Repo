import supabase from "./supabase.js";

const { data } = await supabase.auth.getSession();

if (!data.session) {
    window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    await supabase.auth.signOut();

    window.location.href = "index.html";

});