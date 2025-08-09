/**
 * Error handling utility for the HTML refactoring project
 * Provides comprehensive error handling with graceful fallbacks
 */

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // ms
    
    // Setup global error handlers
    this.setupGlobalHandlers();
  }

  // Setup global error event listeners
  setupGlobalHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError('Global', new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Promise', event.reason, {
        type: 'unhandled_rejection'
      });
      event.preventDefault(); // Prevent console error
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleResourceError(event.target);
      }
    }, true);
  }

  // Main error handling method
  handleError(component, error, context = {}) {
    const errorKey = `${component}:${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // Log the error
    window.Logger?.error(component, `Error occurred: ${error.message}`, {
      error: error.stack || error.toString(),
      context,
      count: count + 1
    });

    // Show user-friendly error message
    this.showUserError(component, error, context);

    // Return error info for further handling
    return {
      component,
      error,
      context,
      count: count + 1,
      canRetry: count < this.maxRetries
    };
  }

  // Handle resource loading errors (images, scripts, etc.)
  handleResourceError(element) {
    const resourceType = element.tagName.toLowerCase();
    const resourceSrc = element.src || element.href;
    
    window.Logger?.error('ResourceLoader', `Failed to load ${resourceType}: ${resourceSrc}`);
    
    // Add error class for styling
    element.classList.add('resource-error');
    
    // Provide fallback based on resource type
    switch (resourceType) {
      case 'img':
        this.handleImageError(element);
        break;
      case 'script':
        this.handleScriptError(element);
        break;
      case 'link':
        this.handleStyleError(element);
        break;
    }
  }

  // Handle image loading errors
  handleImageError(img) {
    // Create placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-content">
        <span>Image not available</span>
        <small>${img.alt || 'No description'}</small>
      </div>
    `;
    
    // Replace image with placeholder
    img.parentNode?.replaceChild(placeholder, img);
  }

  // Handle script loading errors
  handleScriptError(script) {
    const scriptName = script.src.split('/').pop();
    window.Logger?.warn('ScriptLoader', `Script failed to load: ${scriptName}`);
    
    // Try to provide fallback functionality
    this.provideFallbackForScript(scriptName);
  }

  // Handle stylesheet loading errors
  handleStyleError(link) {
    window.Logger?.warn('StyleLoader', `Stylesheet failed to load: ${link.href}`);
    
    // Add basic fallback styles
    this.addFallbackStyles();
  }

  // Provide fallback functionality for failed scripts
  provideFallbackForScript(scriptName) {
    // Basic fallbacks for known scripts
    if (scriptName.includes('component')) {
      window.Logger?.info('Fallback', 'Providing basic component fallback');
      // Ensure basic component structure exists
      if (!window.ComponentLoader) {
        window.ComponentLoader = {
          loadComponent: () => Promise.reject(new Error('Component loading unavailable'))
        };
      }
    }
  }

  // Add basic fallback styles
  addFallbackStyles() {
    if (!document.getElementById('fallback-styles')) {
      const style = document.createElement('style');
      style.id = 'fallback-styles';
      style.textContent = `
        .resource-error { 
          border: 2px dashed #ccc; 
          background: #f5f5f5; 
        }
        .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          background: #f0f0f0;
          border: 1px solid #ddd;
          color: #666;
        }
        .placeholder-content {
          text-align: center;
        }
        .error-message {
          background: #ffe6e6;
          border: 1px solid #ffcccc;
          color: #cc0000;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
        }
        .error-message.warning {
          background: #fff3cd;
          border-color: #ffeaa7;
          color: #856404;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Show user-friendly error message
  showUserError(component, error, context = {}) {
    // Don't show too many errors to avoid spam
    const errorKey = `${component}:${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    
    if (count > 2) return; // Stop showing after 3 occurrences
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    let message = `${component}: ${this.getUserFriendlyMessage(error)}`;
    
    if (context.canRetry !== false && count < this.maxRetries) {
      message += ' Retrying...';
      errorDiv.className += ' warning';
    }
    
    errorDiv.textContent = message;
    
    // Find appropriate container
    const container = this.findErrorContainer(component);
    if (container) {
      container.appendChild(errorDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    }
  }

  // Convert technical errors to user-friendly messages
  getUserFriendlyMessage(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'Content not found. It may have been moved or deleted.';
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Access denied. You may not have permission to view this content.';
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    // Generic fallback
    return 'Something went wrong. Please try refreshing the page.';
  }

  // Find appropriate container for error messages
  findErrorContainer(component) {
    // Try to find component-specific container
    const componentContainer = document.querySelector(`[data-component="${component.toLowerCase()}"]`);
    if (componentContainer) return componentContainer;
    
    // Try to find main content area
    const mainContent = document.querySelector('main, .main-content, #main');
    if (mainContent) return mainContent;
    
    // Fallback to body
    return document.body;
  }

  // Retry mechanism for failed operations
  async retry(operation, component, maxRetries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        window.Logger?.debug(component, `Attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        lastError = error;
        window.Logger?.warn(component, `Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxRetries) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wrap async operations with error handling
  async safeAsync(operation, component, fallback = null) {
    try {
      return await operation();
    } catch (error) {
      const errorInfo = this.handleError(component, error);
      
      if (errorInfo.canRetry) {
        try {
          return await this.retry(operation, component);
        } catch (retryError) {
          this.handleError(component, retryError, { type: 'retry_failed' });
        }
      }
      
      return fallback;
    }
  }

  // Get error statistics
  getErrorStats() {
    const stats = {};
    for (const [key, count] of this.errorCounts) {
      const [component] = key.split(':');
      stats[component] = (stats[component] || 0) + count;
    }
    return stats;
  }

  // Clear error counts
  clearErrorCounts() {
    this.errorCounts.clear();
  }
}

// Create global error handler instance
window.ErrorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}