/**
 * Core Eminance - Error Display & Alert Management System
 * Provides graceful error handling with modern UI components and logging
 * Version: 1.0
 * Created: 2025-07-07
 */

class ErrorManager {
  constructor() {
    this.container = null;
    this.alerts = new Map(); // Track active alerts by ID
    this.logEntries = []; // Store all log entries
    this.maxAlerts = 5; // Maximum simultaneous alerts
    this.defaultDuration = 8000; // Default auto-dismiss time (8 seconds)
    this.init();
    
    console.log('🚨 Error Manager v1.0 initialized');
  }

  /**
   * Initialize the error management system
   */
  init() {
    this.createContainer();
    this.setupGlobalErrorHandlers();
    this.setupKeyboardHandlers();
  }

  /**
   * Create the main alert container
   */
  createContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'error-banner-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'System notifications');
    this.container.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(this.container);
  }

  /**
   * Generate unique ID for alerts
   */
  generateId() {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log entry to internal logging system
   */
  log(level, title, message, data = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
      id: this.generateId(),
      timestamp,
      level,
      title,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logEntries.push(entry);
    
    // Keep only last 100 log entries to prevent memory issues
    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(-100);
    }

    // Console logging with appropriate level
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warning' ? 'warn' : 
                         level === 'success' ? 'log' : 'info';
    
    console[consoleMethod](`[${level.toUpperCase()}] ${title}:`, message, data);
    
    return entry;
  }

  /**
   * Show alert with specified type and options
   */
  show(type = 'error', title, message, options = {}) {
    const {
      duration = this.defaultDuration,
      persistent = false,
      allowDuplicates = false,
      data = {}
    } = options;

    // Check for duplicate messages if not allowed
    if (!allowDuplicates) {
      const existing = Array.from(this.alerts.values()).find(alert => 
        alert.title === title && alert.message === message
      );
      if (existing) {
        this.refresh(existing.id);
        return existing.id;
      }
    }

    // Remove oldest alert if at max capacity
    if (this.alerts.size >= this.maxAlerts) {
      const oldestId = Array.from(this.alerts.keys())[0];
      this.dismiss(oldestId);
    }

    const id = this.generateId();
    const alert = this.createAlert(id, type, title, message, persistent);
    
    // Store alert reference
    this.alerts.set(id, {
      id,
      type,
      title,
      message,
      element: alert,
      persistent,
      duration,
      createdAt: Date.now()
    });

    // Log the alert
    this.log(type, title, message, data);

    // Add to container
    this.container.appendChild(alert);

    // Trigger show animation
    requestAnimationFrame(() => {
      alert.classList.add('show');
    });

    // Set up auto-dismiss
    if (!persistent && duration > 0) {
      this.setAutoDismiss(id, duration);
    }

    // Update container state
    this.updateContainerState();

    return id;
  }

  /**
   * Create alert DOM element
   */
  createAlert(id, type, title, message, persistent) {
    const alert = document.createElement('div');
    alert.className = `error-banner type-${type}`;
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'assertive');
    alert.id = id;

    const iconMap = {
      error: 'alert-circle',
      warning: 'alert-triangle',
      success: 'check-circle',
      info: 'info'
    };

    alert.innerHTML = `
      <div class="error-banner__header">
        <i data-lucide="${iconMap[type]}" class="error-banner__icon" aria-hidden="true"></i>
        <div class="error-banner__content">
          <h4 class="error-banner__title">${this.escapeHtml(title)}</h4>
          <p class="error-banner__message">${this.escapeHtml(message)}</p>
        </div>
        <button class="error-banner__close" 
                aria-label="Close notification" 
                type="button">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>
      ${!persistent ? '<div class="error-banner__progress"></div>' : ''}
    `;

    // Add close button functionality
    const closeBtn = alert.querySelector('.error-banner__close');
    closeBtn.addEventListener('click', () => {
      this.dismiss(id);
    });

    // Initialize Lucide icons if available
    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ nameAttr: 'data-lucide' });
    }

    return alert;
  }

  /**
   * Set up auto-dismiss with progress bar
   */
  setAutoDismiss(id, duration) {
    const alert = this.alerts.get(id);
    if (!alert) return;

    const progressBar = alert.element.querySelector('.error-banner__progress');
    if (progressBar) {
      // Animate progress bar
      progressBar.style.width = '100%';
      progressBar.style.transition = `width ${duration}ms linear`;
      
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }

    // Set dismiss timer
    alert.dismissTimer = setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  /**
   * Refresh an existing alert (reset timer)
   */
  refresh(id) {
    const alert = this.alerts.get(id);
    if (!alert) return;

    // Clear existing timer
    if (alert.dismissTimer) {
      clearTimeout(alert.dismissTimer);
    }

    // Reset progress bar and timer
    if (!alert.persistent) {
      this.setAutoDismiss(id, alert.duration);
    }

    // Add subtle animation to indicate refresh
    alert.element.style.transform = 'scale(1.02)';
    setTimeout(() => {
      alert.element.style.transform = '';
    }, 200);
  }

  /**
   * Dismiss alert by ID
   */
  dismiss(id) {
    const alert = this.alerts.get(id);
    if (!alert) return;

    // Clear timer
    if (alert.dismissTimer) {
      clearTimeout(alert.dismissTimer);
    }

    // Animate out
    alert.element.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (alert.element.parentNode) {
        alert.element.parentNode.removeChild(alert.element);
      }
      this.alerts.delete(id);
      this.updateContainerState();
    }, 300); // Match CSS transition duration
  }

  /**
   * Dismiss all alerts
   */
  dismissAll() {
    const ids = Array.from(this.alerts.keys());
    ids.forEach(id => this.dismiss(id));
  }

  /**
   * Update container state for styling
   */
  updateContainerState() {
    if (this.alerts.size > 3) {
      this.container.classList.add('compact');
    } else {
      this.container.classList.remove('compact');
    }
  }

  /**
   * Convenience methods for different alert types
   */
  error(title, message, options = {}) {
    return this.show('error', title, message, { duration: 10000, ...options });
  }

  warning(title, message, options = {}) {
    return this.show('warning', title, message, { duration: 8000, ...options });
  }

  success(title, message, options = {}) {
    return this.show('success', title, message, { duration: 6000, ...options });
  }

  info(title, message, options = {}) {
    return this.show('info', title, message, { duration: 6000, ...options });
  }

  /**
   * Show Flask flash messages
   */
  showFlashMessages(messages) {
    if (!Array.isArray(messages)) return;

    messages.forEach(([message, category]) => {
      const type = this.mapFlashCategory(category);
      this.show(type, this.getFlashTitle(type), message, {
        duration: type === 'error' ? 10000 : 6000
      });
    });
  }

  /**
   * Map Flask flash categories to alert types
   */
  mapFlashCategory(category) {
    const mapping = {
      'error': 'error',
      'danger': 'error',
      'warning': 'warning',
      'success': 'success',
      'info': 'info',
      'message': 'info'
    };
    return mapping[category] || 'info';
  }

  /**
   * Get appropriate title for flash message type
   */
  getFlashTitle(type) {
    const titles = {
      error: 'Error',
      warning: 'Warning',
      success: 'Success',
      info: 'Information'
    };
    return titles[type] || 'Notification';
  }

  /**
   * Set up global error handlers
   */
  setupGlobalErrorHandlers() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.error(
        'JavaScript Error',
        `${event.message} (Line: ${event.lineno})`,
        { 
          data: { 
            filename: event.filename,
            error: event.error 
          },
          persistent: false 
        }
      );
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error(
        'Unhandled Promise Rejection',
        event.reason?.message || 'An unexpected error occurred',
        { 
          data: { reason: event.reason },
          persistent: false 
        }
      );
    });

    // Network errors (fetch failures)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          this.error(
            'Server Error',
            `Request failed with status ${response.status}`,
            { data: { url: args[0], status: response.status } }
          );
        }
        return response;
      } catch (error) {
        this.error(
          'Network Error',
          'Failed to connect to server',
          { data: { error: error.message } }
        );
        throw error;
      }
    };
  }

  /**
   * Set up keyboard handlers
   */
  setupKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
      // Escape key dismisses focused alert
      if (e.key === 'Escape') {
        const focused = document.activeElement;
        if (focused && focused.closest('.error-banner')) {
          const alertId = focused.closest('.error-banner').id;
          this.dismiss(alertId);
          e.preventDefault();
        }
      }

      // Ctrl+Shift+D dismisses all alerts (dev shortcut)
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.dismissAll();
        e.preventDefault();
      }
    });
  }

  /**
   * Get current log entries (for debugging)
   */
  getLogs(level = null, limit = 50) {
    let logs = this.logEntries;
    
    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }
    
    return logs.slice(-limit);
  }

  /**
   * Export logs as JSON (for debugging/reporting)
   */
  exportLogs() {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logEntries
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clean up and destroy manager
   */
  destroy() {
    this.dismissAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.alerts.clear();
    this.logEntries = [];
  }
}

// Create global error manager instance
window.ErrorManager = new ErrorManager();

// Global convenience functions
window.showError = (title, message, options) => window.ErrorManager.error(title, message, options);
window.showWarning = (title, message, options) => window.ErrorManager.warning(title, message, options);
window.showSuccess = (title, message, options) => window.ErrorManager.success(title, message, options);
window.showInfo = (title, message, options) => window.ErrorManager.info(title, message, options);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorManager;
}

console.log('✅ Error Management System loaded successfully');
