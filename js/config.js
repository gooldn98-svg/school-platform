// رابط المشروع ومفتاح الواجهة البرمجية
const SUPABASE_URL = 'https://dszeximmfnsmcfdccofv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ng8OyJTQp4iCyuLkcwVe2Q_sH7x2VUV';

// تهيئة الاتصال بقاعدة البيانات
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
