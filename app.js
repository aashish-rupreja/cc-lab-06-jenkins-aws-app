const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('<h1>Hello from Jenkins on AWS!</h1><p>Version 1.0</p>');
});
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('App running on port ' + PORT);
    });
}
module.exports = app;