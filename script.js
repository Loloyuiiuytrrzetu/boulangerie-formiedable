// Header scroll state
const header = document.querySelector('.header');
const toggleScrolled = () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
};
window.addEventListener('scroll', toggleScrolled, { passive: true });
toggleScrolled();

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(open));
});
menu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    });
});

// Contact form (front-end only)
function handleSubmit(e) {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    status.textContent = 'Merci ! Votre message a bien été pris en compte. Nous vous répondrons rapidement.';
    e.target.reset();
    setTimeout(() => { status.textContent = ''; }, 6000);
    return false;
}
