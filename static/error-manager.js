/**
 * Error Message Component
 * Displays styled error messages with dismiss functionality
 */

class ErrorMessage {
    constructor() {
        this.container = null;
        this.init();
        this.setupGlobalErrorHandling();
    }

    init() {
        this.createContainer();
        this.setupStyles();
    }

    createContainer() {
        // Create error container if it doesn't exist
        this.container = document.getElementById('error-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'error-container';
            this.container.className = 'error-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-label', 'Error messages');
            document.body.appendChild(this.container);
        }
    }

    setupStyles() {
        // Error component styles are in components.css
        // This ensures they're applied immediately
        if (!document.querySelector('#error-component-styles')) {
            const style = document.createElement('style');
            style.id = 'error-component-styles';
            style.textContent = `
                .error-container {
                    position: fixed;
                    top: var(--space-4);
                    right: var(--space-4);
                    z-index: 9999;
                    max-width: 420px;
                    width: 100%;
                }
                
                @media (max-width: 768px) {
                    .error-container {
                        top: var(--space-2);
                        right: var(--space-2);
                        left: var(--space-2);
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(message, type = 'error', duration = 5000) {
        const errorElement = this.createElement(message, type);
        this.container.appendChild(errorElement);

        // Animate in
        requestAnimationFrame(() => {
            errorElement.classList.add('error-message--visible');
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(errorElement);
            }, duration);
        }

        return errorElement;
    }

    createElement(message, type) {
        const errorDiv = document.createElement('div');
        errorDiv.className = `error-message error-message--${type}`;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-atomic', 'true');

        const icon = this.getIcon(type);
        
        errorDiv.innerHTML = `
            <div class="error-message__content">
                <div class="error-message__icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="error-message__text">
                    <div class="error-message__title">${this.getTitle(type)}</div>
                    <div class="error-message__description">${message}</div>
                </div>
                <button class="error-message__dismiss" aria-label="Dismiss error message">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;

        // Add dismiss functionality
        const dismissBtn = errorDiv.querySelector('.error-message__dismiss');
        dismissBtn.addEventListener('click', () => {
            this.dismiss(errorDiv);
        });

        // Keyboard accessibility
        errorDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.dismiss(errorDiv);
            }
        });

        // Initialize Lucide icons for the new element
        if (typeof lucide !== 'undefined') {
            lucide.createIcons(errorDiv);
        }

        return errorDiv;
    }

    getIcon(type) {
        const icons = {
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info',
            success: 'check-circle'
        };
        return icons[type] || icons.error;
    }

    getTitle(type) {
        const titles = {
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            success: 'Success'
        };
        return titles[type] || titles.error;
    }

    dismiss(errorElement) {
        errorElement.classList.add('error-message--dismissing');
        
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 300);
    }

    setupGlobalErrorHandling() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            // Ignore script errors from external sources
            if (event.message === 'Script error.' && event.filename === '') {
                return;
            }
            
            const message = `${event.message} at line ${event.lineno}`;
            this.show(message, 'error');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const message = event.reason?.message || 'An unexpected error occurred';
            this.show(message, 'error');
            event.preventDefault(); // Prevent console error
        });

        // Handle fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.show(`HTTP ${response.status}: ${response.statusText}`, 'error');
                }
                return response;
            } catch (error) {
                this.show(`Network error: ${error.message}`, 'error');
                throw error;
            }
        };
    }

    // Public API methods
    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
}

// Initialize error message system
document.addEventListener('DOMContentLoaded', () => {
    window.errorManager = new ErrorMessage();
    
    // Make it available globally for easy access
    window.showError = (message, duration) => window.errorManager.error(message, duration);
    window.showWarning = (message, duration) => window.errorManager.warning(message, duration);
    window.showInfo = (message, duration) => window.errorManager.info(message, duration);
    window.showSuccess = (message, duration) => window.errorManager.success(message, duration);
});
