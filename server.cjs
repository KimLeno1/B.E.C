// CommonJS startup file for Phusion Passenger / cPanel
const path = require('path');
const fs = require('fs');

const candidates = [
  path.join(__dirname, 'dist', 'server.cjs'),
  path.join(__dirname, 'dist-server', 'server.js')
];

let target = candidates.find(c => fs.existsSync(c));

if (target) {
  require(target);
} else {
  console.error('Fatal: Could not find server bundle at dist/server.cjs or dist-server/server.js.');
  process.exit(1);
}
