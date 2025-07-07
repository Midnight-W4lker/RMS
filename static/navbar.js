/**
 * Core Eminance - Navbar & Theme Management
 * Mobile navigation and theme persistence
 */
(function() {
    'use strict';

    // Theme Management
    function initTheme() {
        const themeToggle = document.getElementById('theme-toggle-btn');
        const html = document.documentElement;
        const moonIcon = document.querySelector('.theme-icon-dark');
        const sunIcon = document.querySelector('.theme-icon-light');

        // Get stored theme or default to system preference
        let currentTheme = localStorage.getItem('theme');
        if (!currentTheme) {
            currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        // Apply theme
        function setTheme(theme) {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Update aria-pressed for accessibility
            if (themeToggle) {
                themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            }
            
            if (moonIcon && sunIcon) {
                if (theme === 'dark') {
                    moonIcon.style.display = 'none';
                    sunIcon.style.display = 'block';
                } else {
                    moonIcon.style.display = 'block';
                    sunIcon.style.display = 'none';
                }
            }
        }

        // Initialize theme
        setTheme(currentTheme);

        // Theme toggle handler
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Mobile Navigation - Now handled by sidebar toggle
    function initMobileNav() {
        // Mobile navigation is now handled by the sidebar toggle
        // This function is kept for future navbar-specific mobile functionality
    }

    // Dropdown Management
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (!toggle || !menu) return;

            // Toggle dropdown
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.dropdown-menu')?.classList.remove('active');
                        otherDropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle current dropdown
                const isOpen = menu.classList.contains('active');
                menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', !isOpen);
            });

            // Keyboard navigation
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function() {
            dropdowns.forEach(dropdown => {
                const menu = dropdown.querySelector('.dropdown-menu');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                
                if (menu && toggle) {
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        initMobileNav();
        initDropdowns();
        
        // Initialize Lucide icons if available
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // Enhanced accessibility for keyboard users
    document.addEventListener('keydown', function(e) {
        // Skip to main content (if implemented)
        if (e.altKey && e.key === 'm') {
            const main = document.querySelector('main');
            if (main) {
                main.focus();
                main.scrollIntoView();
            }
        }
    });

})();