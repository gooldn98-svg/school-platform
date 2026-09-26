// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // استخدام نظام المصادقة في Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert('خطأ في البريد الإلكتروني أو كلمة المرور!');
            console.error(error);
        } else {
            alert('تم تسجيل الدخول بنجاح!');
            window.location.href = '../index.html'; // التوجيه للرئيسية بعد الدخول
        }
    });
});
