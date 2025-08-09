#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

class DevServer {
  constructor(port = 3000, directory = '.') {
    this.port = port;
    this.directory = path.resolve(directory);
    this.server = null;
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async findAvailablePort(startPort) {
    return new Promise((resolve) => {
      const server = http.createServer();
      server.listen(startPort, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      server.on('error', () => {
        resolve(this.findAvailablePort(startPort + 1));
      });
    });
  }

  async start() {
    // Find available port
    this.port = await this.findAvailablePort(this.port);

    this.server = http.createServer((req, res) => {
      let filePath = path.join(this.directory, req.url === '/' ? 'index.html' : req.url);
      
      // Remove query parameters
      filePath = filePath.split('?')[0];

      fs.readFile(filePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <head><title>404 - File Not Found</title></head>
                <body>
                  <h1>404 - File Not Found</h1>
                  <p>The requested file <code>${req.url}</code> was not found.</p>
                  <p><a href="/">Go back to home</a></p>
                </body>
              </html>
            `);
          } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          }
          return;
        }

        const mimeType = this.getMimeType(filePath);
        res.writeHead(200, { 
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(data);
      });
    });

    this.server.listen(this.port, () => {
      const url = `http://localhost:${this.port}`;
      console.log(`🚀 Development server running at ${url}`);
      console.log(`📁 Serving files from: ${this.directory}`);
      console.log('Press Ctrl+C to stop the server');
      
      // Auto-open browser
      this.openBrowser(url);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down development server...');
      this.server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      });
    });
  }

  openBrowser(url) {
    const platform = process.platform;
    let command;

    switch (platform) {
      case 'darwin':
        command = `open "${url}"`;
        break;
      case 'win32':
        command = `start "${url}"`;
        break;
      default:
        command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.log(`💡 Open your browser and navigate to: ${url}`);
      }
    });
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const port = args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 3000;
  const directory = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : '.';

  const server = new DevServer(port, directory);
  server.start().catch(console.error);
}

module.exports = DevServer;