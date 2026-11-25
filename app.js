'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// HostyCare / cPanel "Setup Node.js App" (Phusion Passenger) CommonJS startup entrypoint
const rootDir = __dirname;
const prodServer = path.resolve(rootDir, 'dist', 'server.cjs');
const prodHtml = path.resolve(rootDir, 'dist', 'index.html');

if (!fs.existsSync(prodServer) || !fs.existsSync(prodHtml)) {
  if (
    fs.existsSync(path.resolve(rootDir, 'server.ts')) &&
    fs.existsSync(path.resolve(rootDir, 'index.html'))
  ) {
    console.log('Production build missing. Running "npm run build" automatically...');
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  } else {
    console.error(
      'Production build not found (dist/server.cjs or dist/index.html missing). Please run "npm run build" before starting the production server.'
    );
    process.exit(1);
  }
}

require(prodServer);
