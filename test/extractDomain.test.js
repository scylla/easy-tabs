const assert = require('assert');
const { extractDomain } = require('../js/easy-tabs.js');

assert.strictEqual(extractDomain('https://example.com/path'), 'example.com');
assert.strictEqual(extractDomain('chrome://extensions'), 'extensions');
assert.strictEqual(extractDomain('about:blank'), null);

console.log('All tests passed');
