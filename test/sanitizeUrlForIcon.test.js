const assert = require('assert');
const { sanitizeUrlForIcon } = require('../js/easy-tabs.js');

assert.strictEqual(sanitizeUrlForIcon('https://example.com/path#frag'), 'https://example.com');
assert.strictEqual(sanitizeUrlForIcon('chrome://extensions'), 'chrome://extensions');

console.log('sanitizeUrlForIcon tests passed');
