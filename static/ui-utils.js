// ui-utils.js: Production-ready JS utilities
function showToast(message, type = 'info') {
  let toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
function confirmAction(message, onConfirm) {
  if (window.confirm(message)) onConfirm();
}
// Navbar toggle with ARIA and smooth transitions
const hamburger = document.getElementById('hamburger-menu');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('open');
  });
}
