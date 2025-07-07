/* =============================================================================
   REFACTORED THEME TOGGLE SYSTEM - CHANGELOG v2.0
   =============================================================================
   
   CHANGELOG: Complete refactor of theme toggle system
   - Single source of truth: data-theme attribute on documentElement
   - CSS-only icon styling with proper color inheritance
   - Improved accessibility with ARIA roles and states
   - Smooth transitions for all color changes
   - Persistent theme preference in localStorage
   - System preference detection with fallback
   - Works across all pages consistently
   
   Previous issues fixed:
   - Removed duplicate theme logic
   - Fixed icon color inheritance
   - Added proper ARIA attributes
   - Consolidated theme state management
   ============================================================================= */

/**
 * Enhanced Theme System Manager
 * Provides a single source of truth for theme management across the application
 */
class ThemeManager {
  constructor() {
    this.THEME_KEY = 'core-eminance-theme';
    this.themeToggleBtn = null;
    this.currentTheme = 'light';
    this.observers = [];
    
    // Initialize immediately
    this.init();
  }

  /**
   * Initialize the theme system
   * CHANGELOG: Consolidated initialization logic
   */
  init() {
    // Set up theme toggle button reference
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Determine initial theme with proper fallback chain
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const systemPreference = this.getSystemPreference();
    const initialTheme = savedTheme || systemPreference;
    
    // Apply initial theme
    this.setTheme(initialTheme, false); // Don't save on init
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up system preference change listener
    this.setupSystemPreferenceListener();
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
    
    console.log(`🎨 Theme System initialized: ${this.currentTheme}`);
  }

  /**
   * Get system color scheme preference
   * CHANGELOG: Improved system preference detection
   */
  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Set theme with proper state management
   * CHANGELOG: Single source of truth implementation
   * @param {string} theme - 'light' or 'dark'
   * @param {boolean} persist - Whether to save to localStorage
   */
  setTheme(theme, persist = true) {
    // Validate theme value
    if (!['light', 'dark'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Defaulting to light.`);
      theme = 'light';
    }

    // Update current theme state
    this.currentTheme = theme;
    
    // Apply theme to document (single source of truth)
    document.documentElement.setAttribute('data-theme', theme);
    
    // Persist to localStorage if requested
    if (persist) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
    
    // Update toggle button state and accessibility
    this.updateToggleButton();
    
    // Update icon colors with CSS variables
    this.updateIconColors();
    
    // Notify charts and other components
    this.notifyThemeChange(theme);
    
    // Trigger smooth transitions
    this.triggerTransitions();
    
    console.log(`🎨 Theme changed to: ${theme}`);
  }

  /**
   * Toggle between light and dark themes
   * CHANGELOG: Simplified toggle logic
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Update toggle button state and accessibility
   * CHANGELOG: Enhanced ARIA support and icon management
   */
  updateToggleButton() {
    if (!this.themeToggleBtn) return;

    const isDark = this.currentTheme === 'dark';
    
    // Update ARIA attributes for accessibility
    this.themeToggleBtn.setAttribute('aria-pressed', isDark.toString());
    this.themeToggleBtn.setAttribute('aria-label', 
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
    
    // Add role for better screen reader support
    this.themeToggleBtn.setAttribute('role', 'switch');
    this.themeToggleBtn.setAttribute('aria-checked', isDark.toString());
    
    // Update visual state for CSS targeting
    this.themeToggleBtn.classList.toggle('theme-toggle--dark', isDark);
    this.themeToggleBtn.classList.toggle('theme-toggle--light', !isDark);
  }

  /**
   * Update icon colors using CSS variables only
   * CHANGELOG: CSS-only approach for better performance
   */
  updateIconColors() {
    // Force CSS recalculation for proper color inheritance
    document.documentElement.style.setProperty('--theme-update-trigger', Math.random());
    
    // Recreate Lucide icons if available
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.lucide.createIcons();
      }, 10);
    }
  }

  /**
   * Set up all event listeners
   * CHANGELOG: Consolidated event listener setup
   */
  setupEventListeners() {
    // Theme toggle button click
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });

      // Keyboard support
      this.themeToggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }

    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.THEME_KEY && e.newValue !== this.currentTheme) {
        this.setTheme(e.newValue, false); // Don't re-save to avoid loops
      }
    });
  }

  /**
   * Listen for system preference changes
   * CHANGELOG: Real-time system preference updates
   */
  setupSystemPreferenceListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-update if user hasn't manually set a preference
        if (!localStorage.getItem(this.THEME_KEY)) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme, false);
        }
      });
    }
  }

  /**
   * Set up mutation observer for dynamic content
   * CHANGELOG: Optimized observer for performance
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        // Check if new nodes with icons were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.querySelector && node.querySelector('[data-lucide]')) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        // Debounce updates
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.updateIconColors();
        }, 50);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.observers.push(observer);
  }

  /**
   * Trigger smooth transitions
   * CHANGELOG: CSS-based transition triggering
   */
  triggerTransitions() {
    document.documentElement.classList.add('theme-transitioning');
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  }

  /**
   * Notify other components of theme change
   * CHANGELOG: Improved component communication
   */
  notifyThemeChange(theme) {
    // Update charts if available
    if (window.updateChartsTheme && typeof window.updateChartsTheme === 'function') {
      window.updateChartsTheme(theme);
    }
    
    // Dispatch custom event for other components
    const event = new CustomEvent('themeChanged', {
      detail: { theme, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get current theme
   * CHANGELOG: Simple getter method
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if current theme is dark
   * CHANGELOG: Utility method for components
   */
  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  /**
   * Cleanup method for proper disposal
   * CHANGELOG: Added cleanup for memory management
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }
}

// Initialize theme system when DOM is ready
// CHANGELOG: Improved initialization timing and error handling
function initializeThemeSystem() {
  try {
    // Create global theme manager instance
    window.themeManager = new ThemeManager();
    
    // Expose convenient global functions for compatibility
    window.toggleTheme = () => window.themeManager.toggleTheme();
    window.setTheme = (theme) => window.themeManager.setTheme(theme);
    window.getCurrentTheme = () => window.themeManager.getCurrentTheme();
    window.isDarkMode = () => window.themeManager.isDarkMode();
    
    console.log('✅ Theme system fully initialized and ready');
  } catch (error) {
    console.error('❌ Error initializing theme system:', error);
    
    // Provide basic fallback
    window.toggleTheme = function() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('core-eminance-theme', newTheme);
    };
  }
}

// Initialize based on document state with proper timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeSystem);
} else {
  // DOM already loaded, initialize immediately
  initializeThemeSystem();
}

/* =============================================================================
   END REFACTORED THEME TOGGLE SYSTEM
   ============================================================================= */
