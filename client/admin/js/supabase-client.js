// Supabase Client Setup — used by both login.js and dashboard.js
// Same project as the public site.
const SUPABASE_URL = "https://muvacbyliuddiearxvdc.supabase.co";
const SUPABASE_KEY = "sb_publishable_LHot2uEKOA5IaFf-Vn98aQ_ww0jzML1";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);