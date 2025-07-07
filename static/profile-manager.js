/**
 * Profile Management
 * Handles avatar upload preview and profile interactions
 */

class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupAvatarUpload();
        this.setupFormValidation();
        this.enhanceFormInteractions();
        this.initializeAnimations();
    }

    setupAvatarUpload() {
        const avatarInput = document.getElementById('avatarUpload');
        const avatarPreview = document.getElementById('profileAvatarPreview');
        
        if (!avatarInput || !avatarPreview) return;

        avatarInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                if (window.errorManager) {
                    window.errorManager.error('Please select a valid image file.');
                }
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                if (window.errorManager) {
                    window.errorManager.error('Image file size must be less than 5MB.');
                }
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.updateAvatarPreview(e.target.result);
                
                if (window.errorManager) {
                    window.errorManager.success('Profile picture updated! Don\'t forget to save your changes.');
                }
            };
            
            reader.onerror = () => {
                if (window.errorManager) {
                    window.errorManager.error('Error reading the selected file.');
                }
            };
            
            reader.readAsDataURL(file);
        });
    }

    updateAvatarPreview(imageSrc) {
        const avatarPreview = document.getElementById('profileAvatarPreview');
        if (!avatarPreview) return;

        // Remove existing content
        avatarPreview.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Profile picture preview';
        img.className = 'profile-avatar__image';
        
        avatarPreview.appendChild(img);
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('.profile-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (event) => {
                if (!this.validateForm(form)) {
                    event.preventDefault();
                    if (window.errorManager) {
                        window.errorManager.error('Please fix the errors in the form before submitting.');
                    }
                }
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required.');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address.');
                isValid = false;
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Add smooth form validation and interaction enhancements
    enhanceFormInteractions() {
        // Add loading state to submit button
        const form = document.querySelector('.profile-form');
        const submitBtn = form?.querySelector('input[type="submit"]');
        
        if (form && submitBtn) {
            form.addEventListener('submit', (e) => {
                submitBtn.classList.add('btn--loading');
                submitBtn.disabled = true;
                
                // Re-enable after a delay (for demo purposes)
                setTimeout(() => {
                    submitBtn.classList.remove('btn--loading');
                    submitBtn.disabled = false;
                }, 2000);
            });
        }
        
        // Add smooth focus transitions for form inputs
        const formControls = document.querySelectorAll('.form-control');
        formControls.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', () => {
                input.style.transform = 'translateY(0)';
            });
        });
        
        // Add hover effects for settings cards
        const settingsCards = document.querySelectorAll('.settings-card');
        settingsCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // Initialize page animations
    initializeAnimations() {
        // Add fade-in class to profile cards
        const profileCard = document.querySelector('.profile-card');
        const settingsCards = document.querySelectorAll('.settings-card');
        
        if (profileCard) {
            profileCard.classList.add('fade-in');
        }
        
        settingsCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('slide-up');
            }, index * 100);
        });
        
        // Add hover enhancement for interactive elements
        const interactiveElements = document.querySelectorAll('.profile-stat, .setting-item, .badge');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.02)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
    }
}

// Initialize profile manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.profile-page')) {
        window.profileManager = new ProfileManager();
    }
});
