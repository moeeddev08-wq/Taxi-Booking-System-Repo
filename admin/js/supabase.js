const SUPABASE_URL = "https://muvacbyliuddiearxvdc.supabase.co";

const SUPABASE_KEY = "sb_publishable_LHot2uEKOA5IaFf-Vn98aQ_ww0jzML1";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

export default supabase;