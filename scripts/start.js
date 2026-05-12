#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const env = process.env.NODE_ENV || 'development';
const buildPath = path.join(__dirname, 'build');

if (env === 'production' || fs.existsSync(buildPath)) {
  console.log('Starting production server...');
  execSync('npm run serve', { stdio: 'inherit' });
} else {
  console.log('Starting development server...');
  require('react-scripts/scripts/start');
}
