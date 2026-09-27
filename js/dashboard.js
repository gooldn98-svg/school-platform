// ملف لوحة المعلومات
class Dashboard {
  constructor() {
    this.init();
  }

  init() {
    this.checkAuth();
    this.setupEventListeners();
    this.loadDashboardData();
  }

  checkAuth() {
    if (!authManager.isAuthenticated()) {
      window.location.href = '/login.html';
    }
  }

  setupEventListeners() {
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => authManager.logout());
    }

    // أزرار الملاحة
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.navigateTo(page);
      });
    });
  }

  loadDashboardData() {
    // تحميل بيانات لوحة المعلومات
    console.log('📊 جاري تحميل بيانات لوحة المعلومات...');
  }

  navigateTo(page) {
    const pages = {
      'academic-years': '/pages/academic-years.html',
      'semesters': '/pages/semesters.html',
      'grades': '/pages/grades.html',
      'sections': '/pages/sections.html',
      'subjects': '/pages/subjects.html'
    };

    if (pages[page]) {
      window.location.href = pages[page];
    }
  }
}

// تهيئة لوحة المعلومات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
