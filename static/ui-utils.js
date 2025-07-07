// Enhanced Toast Notification System with top-graded UI/UX
function showToast(message, type = 'info', duration = 3500) {
  // Remove existing toasts of the same type to prevent spam
  const existingToasts = document.querySelectorAll(`.toast.toast-${type}`);
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  // Create toast content with icon
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
  };
  
  toast.innerHTML = `
    <div class="toast__content">
      <i data-lucide="${iconMap[type] || 'info'}" class="toast__icon"></i>
      <span class="toast__message">${message}</span>
      <button class="toast__close" aria-label="Close notification">
        <i data-lucide="x"></i>
      </button>
    </div>
  `;
  
  // Add close functionality
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  });
  
  document.body.appendChild(toast);
  
  // Create icons and show toast
  if (window.lucide) {
    window.lucide.createIcons();
  }
  
  setTimeout(() => { 
    toast.classList.add('toast-show'); 
  }, 10);
  
  // Auto-hide after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }
  }, duration);
  
  return toast;
}
// Enhanced utility functions for top-graded interactions
function confirmAction(message, onConfirm, options = {}) {
  const {
    title = 'Confirm Action',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
  } = options;
  
  // Create custom confirmation modal instead of basic confirm
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal modal--confirm modal--${type}">
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
      </div>
      <div class="modal__content">
        <p class="modal__message">${message}</p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary modal__cancel">${cancelText}</button>
        <button class="btn btn--${type === 'danger' ? 'danger' : 'primary'} modal__confirm">${confirmText}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  const cancelBtn = modal.querySelector('.modal__cancel');
  const confirmBtn = modal.querySelector('.modal__confirm');
  
  const cleanup = () => {
    modal.remove();
  };
  
  cancelBtn.addEventListener('click', cleanup);
  confirmBtn.addEventListener('click', () => {
    onConfirm();
    cleanup();
  });
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cleanup();
  });
  
  // Show modal
  setTimeout(() => modal.classList.add('modal-overlay--show'), 10);
  
  // Focus confirm button
  confirmBtn.focus();
}

// Enhanced loading state management
function setLoadingState(element, loading = true) {
  if (loading) {
    element.classList.add('btn--loading');
    element.disabled = true;
  } else {
    element.classList.remove('btn--loading');
    element.disabled = false;
  }
}

// Smooth scroll to element
function scrollToElement(element, options = {}) {
  const {
    behavior = 'smooth',
    block = 'start',
    offset = 0
  } = options;
  
  const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementTop - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior
  });
}

// Form validation enhancement
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    const errorElement = field.parentNode.querySelector('.form-error');
    
    if (!field.value.trim()) {
      field.classList.add('form-control--error');
      if (errorElement) {
        errorElement.textContent = 'This field is required';
        errorElement.style.display = 'flex';
      }
      isValid = false;
    } else {
      field.classList.remove('form-control--error');
      field.classList.add('form-control--success');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  });
  
  return isValid;
}

// Enhanced ripple effect for better touch feedback
function createRipple(event, element) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  element.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

// Global error handler for AJAX requests
function handleApiError(error, customMessage = null) {
  console.error('API Error:', error);
  
  let message = customMessage || 'An unexpected error occurred. Please try again.';
  
  if (error.response) {
    // Server responded with error status
    if (error.response.status === 401) {
      message = 'You are not authorized. Please log in again.';
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else if (error.response.status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (error.response.status === 404) {
      message = 'The requested resource was not found.';
    } else if (error.response.status >= 500) {
      message = 'Server error. Please try again later.';
    }
  } else if (error.request) {
    // Network error
    message = 'Network error. Please check your connection and try again.';
  }
  
  showToast(message, 'error');
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
// CHANGELOG: Theme system moved to theme-system.js for better organization
// Legacy compatibility wrapper for existing code
// Enhanced Theme System with Icon Color Theory
(function() {
  // CHANGELOG: Simplified legacy wrapper - actual implementation in theme-system.js
  console.log('🎨 Theme system compatibility wrapper loaded');
  
  // Check for theme system with retry logic
  function checkThemeSystem(retries = 3) {
    if (window.themeManager) {
      console.log('✅ Theme system connected successfully');
      return;
    }
    
    if (retries > 0) {
      setTimeout(() => checkThemeSystem(retries - 1), 50);
    } else {
      console.warn('⚠️ New theme system not loaded yet. Using fallback...');
      
      // Simple fallback for immediate needs
      window.toggleTheme = function() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('core-eminance-theme', newTheme);
        console.log(`🎨 Fallback theme toggle: ${newTheme}`);
      };
    }
  }
  
  // Start checking after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkThemeSystem());
  } else {
    checkThemeSystem();
  }
})();

// ReactBits.dev-style animated table rows for all tables
function animateTableRows(tableSelector = '.table') {
  document.querySelectorAll(tableSelector).forEach(table => {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length <= 7) {
      // No scroll/animation needed
      rows.forEach(row => row.classList.remove('table-row-animated', 'table-row-visible'));
      tbody.classList.remove('table-scrollable');
      // Remove gradients if present
      const gTop = table.parentElement?.querySelector('.table-gradient-top');
      const gBot = table.parentElement?.querySelector('.table-gradient-bottom');
      if (gTop) gTop.style.opacity = 0;
      if (gBot) gBot.style.opacity = 0;
      return;
    }
    // Make tbody scrollable
    tbody.classList.add('table-scrollable');
    rows.forEach((row, i) => {
      if (i < 7) {
        row.classList.remove('table-row-animated', 'table-row-visible');
      } else {
        row.classList.add('table-row-animated');
        row.classList.remove('table-row-visible');
      }
    });
    // Gradients for scroll polish
    let gTop = table.parentElement?.querySelector('.table-gradient-top');
    let gBot = table.parentElement?.querySelector('.table-gradient-bottom');
    if (!gTop) {
      gTop = document.createElement('div');
      gTop.className = 'table-gradient-top';
      table.parentElement?.appendChild(gTop);
    }
    if (!gBot) {
      gBot = document.createElement('div');
      gBot.className = 'table-gradient-bottom';
      table.parentElement?.appendChild(gBot);
    }
    // Show/hide gradients on scroll
    function updateGradients() {
      const { scrollTop, scrollHeight, clientHeight } = tbody;
      gTop.style.opacity = scrollTop > 8 ? 1 : 0;
      gBot.style.opacity = (scrollTop + clientHeight < scrollHeight - 8) ? 1 : 0;
    }
    tbody.addEventListener('scroll', updateGradients);
    updateGradients();
    // Intersection Observer for reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('table-row-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: tbody, threshold: 0.1 });
    rows.slice(7).forEach(row => {
      observer.observe(row);
    });
  });
}
if (document.readyState !== 'loading') animateTableRows();
else document.addEventListener('DOMContentLoaded', () => animateTableRows());
// Button Ripple Effect (for .btn, .btn--primary, etc.)
document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn, .btn--primary, .btn--secondary, .btn--danger, .btn--success');
    if (!btn) return;
    // Remove old ripple if present
    const oldRipple = btn.querySelector('.btn__ripple');
    if (oldRipple) oldRipple.remove();
    // Create ripple
    const ripple = document.createElement('span');
    ripple.className = 'btn__ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, false);
});
