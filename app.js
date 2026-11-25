// Universal startup file for Phusion Passenger / cPanel / CloudLinux
// Synchronously loads dist/server.cjs for instant Passenger socket binding
try {
  require('./dist/server.cjs');
} catch (e) {
  if (typeof require === 'undefined' || e.code === 'ERR_REQUIRE_ESM') {
    import('./dist/server.cjs').catch(err => {
      console.error('Failed to load server bundle:', err);
      process.exit(1);
    });
  } else {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}
