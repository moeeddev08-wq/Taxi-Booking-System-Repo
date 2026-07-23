// Supabase Client Setup (Public/Anon key - safe to use in browser)
const SUPABASE_URL = "https://muvacbyliuddiearxvdc.supabase.co";
const SUPABASE_KEY = "sb_publishable_LHot2uEKOA5IaFf-Vn98aQ_ww0jzML1";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);