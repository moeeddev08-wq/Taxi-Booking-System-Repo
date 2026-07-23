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