const express = require('express');
const app = express();

function logger(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
}

function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    if (token === 'mysecrettoken') {
        console.log('✅ Authentication successful');
        next();
    } else {
        console.log('❌ Authentication failed');
        res.status(401).send('Unauthorized: Invalid or missing token');
    }
}

app.use(logger);

app.get('/', (req, res) => {
    res.send('Welcome to the Home Page — No authentication required.');
});

app.get('/dashboard', authenticate, (req, res) => {
    res.send('Welcome to your Dashboard! You are successfully authenticated.');
});

app.get('/profile', [logger, authenticate], (req, res) => {
    res.send('This is your profile page — Logging + Auth applied together.');
});

app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000');
});