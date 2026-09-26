// js/settings.js

document.addEventListener('DOMContentLoaded', () => {
    const titleEl = document.getElementById('platform-title');
    const logoImg = document.getElementById('platform-logo');
    const logoInput = document.getElementById('logo-input');

    // 1. استرجاع الاسم والشعار المكتوبين سابقاً
    const savedTitle = localStorage.getItem('school_platform_title');
    const savedLogo = localStorage.getItem('school_platform_logo');

    if (savedTitle && titleEl) {
        titleEl.textContent = savedTitle;
    }

    if (savedLogo && logoImg) {
        logoImg.src = savedLogo;
    }

    // 2. حفظ التعديل على اسم المنصة فور كتابته
    if (titleEl) {
        titleEl.addEventListener('blur', () => {
            const newTitle = titleEl.textContent.trim();
            if (newTitle) {
                localStorage.setItem('school_platform_title', newTitle);
            }
        });
    }

    // 3. رفع الشعار وحفظه
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64Image = evt.target.result;
                    logoImg.src = base64Image;
                    localStorage.setItem('school_platform_logo', base64Image);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
