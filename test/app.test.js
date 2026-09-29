const test = require('node:test');
const assert = require('node:assert');
const app = require('../app');
function withServer(fn) {
    return async () => {
        const server = app.listen(0);
        const port = server.address().port;
        try {
            await fn('http://127.0.0.1:' + port);
        } finally {
            server.close();
        }
    };
}
test('GET /health returns status UP', withServer(async (base) => {
    const res = await fetch(base + '/health');
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.status, 'UP');
}));
test('GET / returns the home page', withServer(async (base) => {
    const res = await fetch(base + '/');
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.ok(text.includes('Hello from Jenkins on AWS'));
}));