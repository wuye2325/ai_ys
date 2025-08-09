#!/usr/bin/env node

/**
 * Build script for HTML refactoring project
 * Provides development workflow with file watching, component combination, and basic optimization
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class BuildSystem {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.componentsDir = path.join(this.projectRoot, 'components');
    this.assetsDir = path.join(this.projectRoot, 'assets');
    this.buildDir = path.join(this.projectRoot, 'build');
    this.distDir = path.join(this.projectRoot, 'dist');
    this.isProduction = false;
    this.watchers = [];
  }

  // Development mode with file watching
  startDev() {
    console.log('🚀 Starting development build system...');
    console.log('📁 Project root:', this.projectRoot);
    
    this.isProduction = false;
    
    // Initial build
    this.build();
    
    // Setup file watching
    this.setupFileWatching();
    
    console.log('✅ Development server ready!');
    console.log('💡 Make changes to your files and they will be automatically processed.');
    console.log('🔄 Press Ctrl+C to stop watching');
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping development server...');
      this.cleanup();
      process.exit(0);
    });
  }

  // Setup comprehensive file watching
  setupFileWatching() {
    console.log('👀 Setting up file watchers...');
    
    const watchDirs = [
      { dir: this.componentsDir, name: 'Components' },
      { dir: this.assetsDir, name: 'Assets' },
      { dir: path.join(this.projectRoot, 'index.html'), name: 'Main HTML', isFile: true }
    ];

    let debounceTimer = null;
    const debounceDelay = 300; // ms

    watchDirs.forEach(({ dir, name, isFile }) => {
      if (fs.existsSync(dir)) {
        try {
          const watcher = fs.watch(dir, { recursive: !isFile }, (eventType, filename) => {
            if (filename && (filename.endsWith('.html') || filename.endsWith('.css') || 
                           filename.endsWith('.js') || filename.endsWith('.json'))) {
              
              // Debounce rapid file changes
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(() => {
                console.log(`📝 ${name} changed: ${filename}`);
                this.build();
              }, debounceDelay);
            }
          });
          
          this.watchers.push(watcher);
          console.log(`✅ Watching ${name}: ${dir}`);
        } catch (error) {
          console.warn(`⚠️ Could not watch ${name}: ${error.message}`);
        }
      }
    });
  }

  // Cleanup watchers
  cleanup() {
    this.watchers.forEach(watcher => {
      try {
        watcher.close();
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    this.watchers = [];
  }

  // Build process
  build() {
    console.log('🔨 Building project...');
    
    try {
      // Validate project structure
      this.validateStructure();
      
      // Create dist directory if it doesn't exist
      if (!fs.existsSync(this.distDir)) {
        fs.mkdirSync(this.distDir, { recursive: true });
      }
      
      // Process components
      this.processComponents();
      
      // Process assets
      this.processAssets();
      
      // Copy and process main HTML file
      this.processMainHTML();
      
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      if (!this.isProduction) {
        console.log('🔄 Continuing to watch for changes...');
      }
    }
  }

  // Validate that required directories exist
  validateStructure() {
    const requiredDirs = [
      'components',
      'components/navbar',
      'components/discussion', 
      'components/comments',
      'components/ai-assistant',
      'assets',
      'assets/css',
      'assets/js',
      'assets/data'
    ];

    for (const dir of requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }
    
    console.log('✅ Project structure validated');
  }

  // Process components - combine HTML, CSS, and JS for each component
  processComponents() {
    console.log('📦 Processing components...');
    
    const componentDirs = fs.readdirSync(this.componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const combinedComponents = {};
    
    componentDirs.forEach(componentName => {
      const componentPath = path.join(this.componentsDir, componentName);
      const component = {
        name: componentName,
        html: '',
        css: '',
        js: ''
      };
      
      // Read HTML file
      const htmlFile = path.join(componentPath, `${componentName}.html`);
      if (fs.existsSync(htmlFile)) {
        component.html = fs.readFileSync(htmlFile, 'utf8');
      }
      
      // Read CSS file
      const cssFile = path.join(componentPath, `${componentName}.css`);
      if (fs.existsSync(cssFile)) {
        component.css = fs.readFileSync(cssFile, 'utf8');
      }
      
      // Read JS file
      const jsFile = path.join(componentPath, `${componentName}.js`);
      if (fs.existsSync(jsFile)) {
        component.js = fs.readFileSync(jsFile, 'utf8');
      }
      
      combinedComponents[componentName] = component;
      console.log(`  ✅ Processed component: ${componentName}`);
    });
    
    // Write combined components file
    const componentsOutput = path.join(this.distDir, 'components.js');
    const componentsContent = `
// Auto-generated combined components file
window.COMPONENTS = ${JSON.stringify(combinedComponents, null, 2)};
`;
    
    fs.writeFileSync(componentsOutput, componentsContent);
    console.log(`  📄 Created combined components file: ${componentsOutput}`);
  }

  // Process assets - combine and optionally minify CSS and JS
  processAssets() {
    console.log('🎨 Processing assets...');
    
    // Process CSS files
    this.processCSSFiles();
    
    // Process JS files
    this.processJSFiles();
    
    // Copy data files
    this.copyDataFiles();
  }
  
  // Combine and process CSS files
  processCSSFiles() {
    const cssDir = path.join(this.assetsDir, 'css');
    const cssFiles = [];
    
    if (fs.existsSync(cssDir)) {
      const files = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
      files.forEach(file => {
        const filePath = path.join(cssDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        cssFiles.push({ name: file, content });
      });
    }
    
    // Combine all CSS
    let combinedCSS = cssFiles.map(file => `/* ${file.name} */\n${file.content}`).join('\n\n');
    
    // Basic minification for production
    if (this.isProduction) {
      combinedCSS = this.minifyCSS(combinedCSS);
    }
    
    // Write combined CSS
    const outputPath = path.join(this.distDir, 'styles.css');
    fs.writeFileSync(outputPath, combinedCSS);
    console.log(`  📄 Created combined CSS: ${outputPath}`);
  }
  
  // Combine and process JS files
  processJSFiles() {
    const jsDir = path.join(this.assetsDir, 'js');
    const jsFiles = [];
    
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
      files.forEach(file => {
        const filePath = path.join(jsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        jsFiles.push({ name: file, content });
      });
    }
    
    // Combine all JS
    let combinedJS = jsFiles.map(file => `/* ${file.name} */\n${file.content}`).join('\n\n');
    
    // Basic minification for production
    if (this.isProduction) {
      combinedJS = this.minifyJS(combinedJS);
    }
    
    // Write combined JS
    const outputPath = path.join(this.distDir, 'scripts.js');
    fs.writeFileSync(outputPath, combinedJS);
    console.log(`  📄 Created combined JS: ${outputPath}`);
  }
  
  // Copy data files
  copyDataFiles() {
    const dataDir = path.join(this.assetsDir, 'data');
    if (fs.existsSync(dataDir)) {
      const distDataDir = path.join(this.distDir, 'data');
      if (!fs.existsSync(distDataDir)) {
        fs.mkdirSync(distDataDir, { recursive: true });
      }
      
      const files = fs.readdirSync(dataDir);
      files.forEach(file => {
        const srcPath = path.join(dataDir, file);
        const destPath = path.join(distDataDir, file);
        fs.copyFileSync(srcPath, destPath);
      });
      
      console.log(`  📄 Copied data files to: ${distDataDir}`);
    }
  }
  
  // Process main HTML file
  processMainHTML() {
    const mainHTMLPath = path.join(this.projectRoot, 'index.html');
    if (fs.existsSync(mainHTMLPath)) {
      let htmlContent = fs.readFileSync(mainHTMLPath, 'utf8');
      
      // Update script and style references for production
      if (this.isProduction) {
        htmlContent = htmlContent
          .replace(/assets\/css\/[^"]+\.css/g, 'dist/styles.css')
          .replace(/assets\/js\/[^"]+\.js/g, 'dist/scripts.js');
      }
      
      const outputPath = path.join(this.distDir, 'index.html');
      fs.writeFileSync(outputPath, htmlContent);
      console.log(`  📄 Processed main HTML: ${outputPath}`);
    }
  }
  
  // Basic CSS minification
  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
      .replace(/\s*{\s*/g, '{') // Clean up braces
      .replace(/}\s*/g, '}')
      .replace(/;\s*/g, ';')
      .trim();
  }
  
  // Basic JS minification
  minifyJS(js) {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Clean up semicolons
      .trim();
  }

  // Production build
  buildProd() {
    console.log('🏗️ Building for production...');
    this.isProduction = true;
    
    // Clean dist directory
    if (fs.existsSync(this.distDir)) {
      fs.rmSync(this.distDir, { recursive: true, force: true });
    }
    
    this.build();
    
    console.log('✅ Production build completed!');
    console.log(`📁 Output directory: ${this.distDir}`);
  }

  // Show help
  showHelp() {
    console.log(`
📖 HTML Refactoring Build System

Usage:
  node build/build.js [command]

Commands:
  dev     Start development mode with file watching
  build   Run a single build
  prod    Build for production
  help    Show this help message

Examples:
  node build/build.js dev    # Start development server
  node build/build.js build  # Run single build
  node build/build.js prod   # Production build
`);
  }
}

// CLI interface
const command = process.argv[2] || 'help';
const buildSystem = new BuildSystem();

switch (command) {
  case 'dev':
    buildSystem.startDev();
    break;
  case 'build':
    buildSystem.build();
    break;
  case 'prod':
    buildSystem.buildProd();
    break;
  case 'help':
  default:
    buildSystem.showHelp();
    break;
}