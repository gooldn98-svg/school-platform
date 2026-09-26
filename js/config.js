// js/config.js

const SUPABASE_URL = "https://dszeximmfnsmcfdccofv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ng8OyJTQp4iCyuLkcwVe2Q_sH7x2VUV";

// تهيئة عميل Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
