/**
 * Main Component Loader
 * Central system for loading and managing all components
 */

// Import side-effect modules to ensure they are loaded and initialized
import './logger.js';
import './error-handler.js';

import { showFeedback } from './utils.js';
import { loadAndRenderAllContent } from './data-manager.js';

/**
 * Component registry to track loaded components
 */
const componentRegistry = new Map();

/**
 * Component configuration
 */
const COMPONENTS = {
  navbar: {
    containerId: 'navbar-container',
    htmlPath: '../../components/navbar/navbar.html',
    cssPath: '../../components/navbar/navbar.css',
    jsPath: '../../components/navbar/navbar.js',
    required: true
  },
  topicInfo: {
    containerId: 'topic-info-container',
    htmlPath: '../../components/topic-info/topic-info.html',
    cssPath: '../../components/topic-info/topic-info.css',
    jsPath: '../../components/topic-info/topic-info.js',
    required: true
  },
  aiAssistant: {
    containerId: 'ai-assistant-container',
    htmlPath: '../../components/ai-assistant/ai-assistant.html',
    cssPath: '../../components/ai-assistant/ai-assistant.css',
    jsPath: '../../components/ai-assistant/ai-assistant.js',
    required: false
  },
  discussion: {
    containerId: 'discussion-container',
    htmlPath: '../../components/discussion/discussion-section.html',
    cssPath: '../../components/discussion/discussion-section.css',
    jsPath: '../../components/discussion/discussion-section.js',
    required: true
  }
};

/**
 * Component loading states
 */
const LOADING_STATES = {
  NOT_STARTED: 'not_started',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

/**
 * Main Component Loader Class
 */
class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
    this.failedComponents = new Set();
    this.loadingPromises = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the component loader
   */
  async init() {
    if (this.isInitialized) {
      window.Logger?.warn('ComponentLoader', 'Already initialized');
      return;
    }

    window.Logger?.info('ComponentLoader', 'Initializing component loader...');
    
    return window.ErrorHandler?.safeAsync(async () => {
      // Load all components
      await this.loadAllComponents();
      
      // Load and render content data
      await loadAndRenderAllContent();
      
      this.isInitialized = true;
      window.Logger?.info('ComponentLoader', 'Initialized successfully');
      
      // Dispatch initialization complete event
      this.dispatchEvent('componentsLoaded', {
        loaded: Array.from(this.loadedComponents),
        failed: Array.from(this.failedComponents)
      });
      
    }, 'ComponentLoader', () => {
      showFeedback('组件加载失败，部分功能可能不可用', 'error');
    });
  }

  /**
   * Load all components in parallel
   */
  async loadAllComponents() {
    window.Logger?.info('ComponentLoader', 'Loading all components...');
    
    const loadPromises = Object.entries(COMPONENTS).map(([name, config]) => 
      this.loadComponent(name, config)
    );

    const results = await Promise.allSettled(loadPromises);
    
    // Log results
    results.forEach((result, index) => {
      const componentName = Object.keys(COMPONENTS)[index];
      if (result.status === 'fulfilled') {
        window.Logger?.info('ComponentLoader', `Component '${componentName}' loaded successfully`);
      } else {
        window.Logger?.error('ComponentLoader', `Component '${componentName}' failed to load`, result.reason);
      }
    });
    
    const stats = this.getLoadingStats();
    window.Logger?.info('ComponentLoader', `Loading complete: ${stats.loaded}/${stats.total} components loaded (${stats.successRate}% success rate)`);
  }

  /**
   * Load a single component
   * @param {string} name - Component name
   * @param {Object} config - Component configuration
   * @returns {Promise<boolean>} Success status
   */
  async loadComponent(name, config) {
    // Prevent duplicate loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const loadPromise = this._loadComponentInternal(name, config);
    this.loadingPromises.set(name, loadPromise);
    
    try {
      const result = await loadPromise;
      this.loadingPromises.delete(name);
      return result;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  /**
   * Internal component loading logic
   * @param {string} name - Component name
   * @param {Object} config - Component configuration
   * @returns {Promise<boolean>} Success status
   */
  async _loadComponentInternal(name, config) {
    console.log(`[Debug] Starting to load component: ${name}`);
    return window.ErrorHandler?.safeAsync(async () => {
      window.Logger?.debug('ComponentLoader', `Loading component: ${name}`);
      
      // Check if container exists
      const container = document.getElementById(config.containerId);
      console.log(`[Debug] Component '${name}': container element is`, container);
      if (!container) {
        if (config.required) {
          throw new Error(`Required container '${config.containerId}' not found for component '${name}'`);
        } else {
          window.Logger?.warn('ComponentLoader', `Optional container '${config.containerId}' not found for component '${name}', skipping`);
          return false;
        }
      }

      // Load CSS first (non-blocking)
      if (config.cssPath) {
        this.loadCSS(config.cssPath, name).catch(error => {
          window.Logger?.warn('ComponentLoader', `Failed to load CSS for component '${name}'`, error);
        });
      }

      // Load HTML
      const html = await this.loadHTML(config.htmlPath);
      container.innerHTML = html;

      // Load and initialize JavaScript
      if (config.jsPath) {
        await this.loadAndInitializeJS(config.jsPath, name, config.containerId);
      }

      // Register component as loaded
      this.registerComponent(name, {
        config,
        container,
        state: LOADING_STATES.LOADED
      });

      this.loadedComponents.add(name);
      window.Logger?.info('ComponentLoader', `Component '${name}' loaded successfully`);
      return true;

    }, 'ComponentLoader', false).catch(error => {
      window.Logger?.error('ComponentLoader', `Error loading component '${name}'`, error);
      
      // Create fallback content for required components
      if (config.required) {
        this.createFallbackContent(name, config);
      }
      
      this.failedComponents.add(name);
      
      // Register component as failed
      this.registerComponent(name, {
        config,
        container: document.getElementById(config.containerId),
        state: LOADING_STATES.ERROR,
        error: error.message
      });

      return false;
    });
  }

  /**
   * Load CSS file
   * @param {string} cssPath - Path to CSS file
   * @param {string} componentName - Component name for identification
   * @returns {Promise<void>}
   */
  async loadCSS(cssPath, componentName) {
    return new Promise((resolve, reject) => {
      // Check if CSS is already loaded
      const existingLink = document.querySelector(`link[href="${cssPath}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.setAttribute('data-component', componentName);
      
      link.onload = () => {
        console.log(`CSS loaded for component: ${componentName}`);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to load CSS: ${cssPath}`));
      };
      
      document.head.appendChild(link);
    });
  }

  /**
   * Load HTML content
   * @param {string} htmlPath - Path to HTML file
   * @returns {Promise<string>} HTML content
   */
  async loadHTML(htmlPath) {
    console.log(`[Debug] Fetching HTML from: ${htmlPath}`);
    const response = await fetch(htmlPath);
    if (!response.ok) {
      console.error(`[Debug] Failed to fetch HTML: ${htmlPath}`, response);
      throw new Error(`Failed to load HTML: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    console.log(`[Debug] Successfully fetched HTML from: ${htmlPath}`);
    return html;
  }

  /**
   * Load and initialize JavaScript module
   * @param {string} jsPath - Path to JavaScript file
   * @param {string} componentName - Component name
   * @param {string} containerId - Container ID
   * @returns {Promise<void>}
   */
  async loadAndInitializeJS(jsPath, componentName, containerId) {
    console.log(`[Debug] Importing JS module for '${componentName}' from: ${jsPath}`);
    try {
      // Dynamic import of the component module
      const module = await import(jsPath);
      console.log(`[Debug] JS module imported for '${componentName}':`, module);
      
      // Look for component loader function
      const loaderFunctionName = `load${this.capitalize(componentName)}Component`;
      const loaderFunction = module[loaderFunctionName];
      
      if (typeof loaderFunction === 'function') {
        console.log(`[Debug] Found loader function '${loaderFunctionName}'. Executing...`);
        // Use the component's own loader function
        const success = await loaderFunction(containerId);
        if (!success) {
          console.warn(`Component loader function returned false for: ${componentName}`);
        }
      } else {
        console.warn(`No loader function '${loaderFunctionName}' found in module: ${jsPath}`);
        
        // Try to find and instantiate controller class
        const controllerClassName = `${this.capitalize(componentName)}Controller`;
        const ControllerClass = module[controllerClassName];
        
        if (ControllerClass) {
          const controller = new ControllerClass();
          console.log(`Controller instantiated for component: ${componentName}`);
        }
      }
      
      console.log(`JavaScript loaded and initialized for component: ${componentName}`);
      
    } catch (error) {
      console.error(`Error loading JavaScript for component '${componentName}':`, error);
      throw error;
    }
  }

  /**
   * Create fallback content for failed components
   * @param {string} name - Component name
   * @param {Object} config - Component configuration
   */
  createFallbackContent(name, config) {
    const container = document.getElementById(config.containerId);
    if (!container) return;

    const fallbackContent = this.getFallbackContent(name);
    container.innerHTML = fallbackContent;
    
    console.log(`Fallback content created for component: ${name}`);
  }

  /**
   * Get fallback content for a component
   * @param {string} name - Component name
   * @returns {string} Fallback HTML content
   */
  getFallbackContent(name) {
    const fallbacks = {
      navbar: `
        <div class="navbar fallback-navbar">
          <div class="navbar-back" onclick="history.back()">
            <i class="fas fa-chevron-left"></i>
          </div>
          <div class="navbar-title">议事详情</div>
          <div class="navbar-actions">
            <button onclick="window.close()" title="关闭">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `,
      discussion: `
        <div class="discussion-section fallback-discussion">
          <div class="discussion-header">
            <h3>讨论区</h3>
            <p style="color: #666; font-size: 12px;">组件加载失败，功能受限</p>
          </div>
          <div id="comments-list">
            <div class="loading-placeholder">
              <p>正在加载评论...</p>
            </div>
          </div>
        </div>
      `,
      comments: `
        <div class="comments-container fallback-comments">
          <div id="comments-list">
            <div class="error-placeholder">
              <p style="color: #e74c3c;">评论组件加载失败</p>
              <button onclick="location.reload()" style="margin-top: 8px; padding: 4px 8px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                重新加载
              </button>
            </div>
          </div>
        </div>
      `,
      aiAssistant: `
        <div class="ai-assistant-fallback" style="display: none;">
          <p style="color: #666; font-size: 12px; text-align: center; padding: 20px;">
            AI助手功能暂不可用
          </p>
        </div>
      `
    };

    return fallbacks[name] || `
      <div class="component-fallback">
        <p style="color: #666; font-size: 12px; text-align: center; padding: 20px;">
          组件 "${name}" 加载失败
        </p>
      </div>
    `;
  }

  /**
   * Register a component in the registry
   * @param {string} name - Component name
   * @param {Object} data - Component data
   */
  registerComponent(name, data) {
    componentRegistry.set(name, {
      ...data,
      loadedAt: Date.now()
    });
  }

  /**
   * Get component information
   * @param {string} name - Component name
   * @returns {Object|null} Component data
   */
  getComponent(name) {
    return componentRegistry.get(name) || null;
  }

  /**
   * Check if a component is loaded
   * @param {string} name - Component name
   * @returns {boolean} Whether the component is loaded
   */
  isComponentLoaded(name) {
    return this.loadedComponents.has(name);
  }

  /**
   * Get all loaded components
   * @returns {Array<string>} Array of loaded component names
   */
  getLoadedComponents() {
    return Array.from(this.loadedComponents);
  }

  /**
   * Get all failed components
   * @returns {Array<string>} Array of failed component names
   */
  getFailedComponents() {
    return Array.from(this.failedComponents);
  }

  /**
   * Reload a specific component
   * @param {string} name - Component name
   * @returns {Promise<boolean>} Success status
   */
  async reloadComponent(name) {
    const config = COMPONENTS[name];
    if (!config) {
      throw new Error(`Unknown component: ${name}`);
    }

    console.log(`Reloading component: ${name}`);
    
    // Remove from loaded/failed sets
    this.loadedComponents.delete(name);
    this.failedComponents.delete(name);
    
    // Clear container
    const container = document.getElementById(config.containerId);
    if (container) {
      container.innerHTML = '<div class="loading-placeholder"><p>正在重新加载...</p></div>';
    }

    // Reload component
    return await this.loadComponent(name, config);
  }

  /**
   * Reload all components
   * @returns {Promise<void>}
   */
  async reloadAllComponents() {
    console.log('Reloading all components...');
    
    // Clear all loaded/failed states
    this.loadedComponents.clear();
    this.failedComponents.clear();
    componentRegistry.clear();
    
    // Reload all components
    await this.loadAllComponents();
    
    // Reload content data
    await loadAndRenderAllContent();
    
    showFeedback('所有组件已重新加载', 'success');
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {any} detail - Event detail data
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Add error handling for component failures
   * @param {string} componentName - Component name
   * @param {Error} error - Error object
   */
  handleComponentError(componentName, error) {
    console.error(`Component error in '${componentName}':`, error);
    
    // Update component registry with error state
    const component = componentRegistry.get(componentName);
    if (component) {
      component.state = LOADING_STATES.ERROR;
      component.error = error.message;
      component.errorTime = Date.now();
    }

    // Show user-friendly error message for critical components
    const config = COMPONENTS[componentName];
    if (config && config.required) {
      showFeedback(`核心组件 "${componentName}" 出现错误`, 'error');
    }
  }

  /**
   * Get loading statistics
   * @returns {Object} Loading statistics
   */
  getLoadingStats() {
    const total = Object.keys(COMPONENTS).length;
    const loaded = this.loadedComponents.size;
    const failed = this.failedComponents.size;
    
    return {
      total,
      loaded,
      failed,
      pending: total - loaded - failed,
      successRate: total > 0 ? (loaded / total * 100).toFixed(1) : 0
    };
  }

  /**
   * Destroy the component loader and clean up
   */
  destroy() {
    // Clear all data
    this.loadedComponents.clear();
    this.failedComponents.clear();
    this.loadingPromises.clear();
    componentRegistry.clear();
    
    // Remove dynamically loaded CSS
    document.querySelectorAll('link[data-component]').forEach(link => {
      link.remove();
    });
    
    this.isInitialized = false;
    console.log('ComponentLoader destroyed');
  }
}

// Create singleton instance
const componentLoader = new ComponentLoader();

// Export the singleton instance and class
export { ComponentLoader, componentLoader };

// Export convenience functions
export const initializeComponents = () => {
  console.log('Initializing components...');
  return componentLoader.init();
};
export const loadComponent = (name, config) => componentLoader.loadComponent(name, config);
export const reloadComponent = (name) => componentLoader.reloadComponent(name);
export const reloadAllComponents = () => componentLoader.reloadAllComponents();
export const isComponentLoaded = (name) => componentLoader.isComponentLoaded(name);
export const getLoadedComponents = () => componentLoader.getLoadedComponents();
export const getFailedComponents = () => componentLoader.getFailedComponents();
export const getLoadingStats = () => componentLoader.getLoadingStats();

// Global error handler for component errors
window.addEventListener('error', (event) => {
  // Check if error is related to component loading
  if (event.filename && event.filename.includes('/components/')) {
    const componentName = event.filename.match(/\/components\/([^\/]+)\//)?.[1];
    if (componentName) {
      componentLoader.handleComponentError(componentName, event.error);
    }
  }
});

// Export for global access (for debugging)
window.ComponentLoader = {
  instance: componentLoader,
  reload: reloadAllComponents,
  stats: getLoadingStats,
  loaded: getLoadedComponents,
  failed: getFailedComponents
};

console.log('Main component loader module loaded');