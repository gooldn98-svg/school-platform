// js/config.js

const SUPABASE_URL = "https://dszeximmfnsmcfdccofv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzemV4aW1tZm5zbWNmZGNjb2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNTUzODYsImV4cCI6MjEwNTkzMTM4Nn0.EMBktvDhzksfarLhWaO_xtahDofLKiN-YvRT0NUtvFg";

// تهيئة عميل Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
