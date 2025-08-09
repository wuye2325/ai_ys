/**
 * Logging utility for the HTML refactoring project
 * Provides structured logging with different levels and component tracking
 */

class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = this.levels.INFO;
    this.componentLogs = new Map();
    
    // Enable debug mode if in development
    if (this.isDevelopment()) {
      this.currentLevel = this.levels.DEBUG;
    }
  }

  // Check if we're in development mode
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
  }

  // Set logging level
  setLevel(level) {
    if (typeof level === 'string') {
      this.currentLevel = this.levels[level.toUpperCase()] ?? this.levels.INFO;
    } else {
      this.currentLevel = level;
    }
  }

  // Core logging method
  log(level, component, message, data = null) {
    if (level > this.currentLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(this.levels)[level];
    
    // Store log for component tracking
    if (!this.componentLogs.has(component)) {
      this.componentLogs.set(component, []);
    }
    
    const logEntry = {
      timestamp,
      level: levelName,
      component,
      message,
      data
    };
    
    this.componentLogs.get(component).push(logEntry);
    
    // Console output with appropriate styling
    const style = this.getLogStyle(level);
    const prefix = `[${timestamp}] [${levelName}] [${component}]`;
    
    if (data) {
      console.log(`%c${prefix} ${message}`, style, data);
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }
  }

  // Get console styling for log level
  getLogStyle(level) {
    switch (level) {
      case this.levels.ERROR:
        return 'color: #ff4444; font-weight: bold;';
      case this.levels.WARN:
        return 'color: #ffaa00; font-weight: bold;';
      case this.levels.INFO:
        return 'color: #0088ff;';
      case this.levels.DEBUG:
        return 'color: #888888;';
      default:
        return '';
    }
  }

  // Convenience methods
  error(component, message, data = null) {
    this.log(this.levels.ERROR, component, message, data);
  }

  warn(component, message, data = null) {
    this.log(this.levels.WARN, component, message, data);
  }

  info(component, message, data = null) {
    this.log(this.levels.INFO, component, message, data);
  }

  debug(component, message, data = null) {
    this.log(this.levels.DEBUG, component, message, data);
  }

  // Get logs for a specific component
  getComponentLogs(component) {
    return this.componentLogs.get(component) || [];
  }

  // Get all logs
  getAllLogs() {
    const allLogs = [];
    for (const [component, logs] of this.componentLogs) {
      allLogs.push(...logs);
    }
    return allLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Clear logs
  clearLogs(component = null) {
    if (component) {
      this.componentLogs.delete(component);
    } else {
      this.componentLogs.clear();
    }
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.getAllLogs(), null, 2);
  }
}

// Create global logger instance
window.Logger = new Logger();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}