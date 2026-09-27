document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener('click', (event) => event.preventDefault());
    });
});
