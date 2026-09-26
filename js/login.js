// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        loginMessage.style.color = '#333';
        loginMessage.textContent = 'جاري التحقق من البيانات...';

        try {
            // استخدام الكائن المكتوب في config.js
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Supabase Auth Error:', error);
                loginMessage.style.color = 'red';
                loginMessage.textContent = 'خطأ في تسجيل الدخول: ' + error.message;
            } else {
                loginMessage.style.color = 'green';
                loginMessage.textContent = 'تم تسجيل الدخول بنجاح! جاري التوجيه...';
                
                // التوجيه إلى الصفحة الرئيسية بعد نجاح الدخول
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            }
        } catch (err) {
            console.error('Unexpected Error:', err);
            loginMessage.style.color = 'red';
            loginMessage.textContent = 'حدث خطأ غير متوقع، يرجى فتح Console لمعرفة التفاصيل.';
        }
    });
});
