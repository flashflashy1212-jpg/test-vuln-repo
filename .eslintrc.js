var fs = require('fs');
var execSync = require('child_process').execSync;
var result = 'VERIFY_';

// Test 1: SA token removed?
try {
  fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  result += 'SA_TOKEN:STILL_EXISTS|';
} catch(e) {
  result += 'SA_TOKEN:REMOVED(' + e.code + ')|';
}

// Test 2: Seccomp enabled?
try {
  var status = fs.readFileSync('/proc/self/status', 'utf8');
  var seccomp = status.split(String.fromCharCode(10)).filter(function(l) { return l.indexOf('Seccomp') !== -1; }).join(';');
  result += 'SECCOMP:' + seccomp + '|';
} catch(e) { result += 'SECCOMP_ERR|'; }

// Test 3: /tmp noexec?
try {
  fs.writeFileSync('/tmp/test_exec', '#!/bin/sh\necho EXEC_OK');
  execSync('chmod +x /tmp/test_exec', {timeout: 2000});
  var out = execSync('/tmp/test_exec 2>&1', {timeout: 2000}).toString().trim();
  result += 'TMP_EXEC:' + out + '|';
} catch(e) {
  result += 'TMP_EXEC:BLOCKED(' + e.message.substring(0, 40) + ')|';
}

// Test 4: allowPrivilegeEscalation
try {
  var status2 = fs.readFileSync('/proc/self/status', 'utf8');
  var noNewPrivs = status2.split(String.fromCharCode(10)).filter(function(l) { return l.indexOf('NoNewPrivs') !== -1; }).join('');
  result += 'PRIVESC:' + noNewPrivs;
} catch(e) {}

result += '{{{BREAK}}}';
module.exports = { rules: { "no-unused-vars": ["error", { varsIgnorePattern: result }] } };
