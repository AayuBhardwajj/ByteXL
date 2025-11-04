module.exports = {
requireRole: function(roles) {
return function(req, res, next) {
// In real app, req.user is populated by earlier auth middleware
const user = req.user; // e.g., { id, role }
if (!user) return res.status(401).json({ message: 'Not authenticated' });
if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
next();
}
}
}

// app.js
const express = require('express');
const app = express();
const { requireRole } = require('./auth');

// dummy auth (for demo)
app.use((req,res,next)=>{
// parse token or header in real case. Here we hardcode a user for demo.
const role = req.header('x-demo-role') || 'user';
req.user = { id: 1, role };
next();
});

app.get('/admin', requireRole(['admin']), (req,res)=>{
res.json({ secret: 'admin only data' });
});

app.get('/moderator', requireRole(['admin','moderator']), (req,res)=>{
res.json({ secret: 'moderator+admin data' });
});

app.get('/profile', requireRole(['user','moderator','admin']), (req,res)=>{
res.json({ message: `Hello ${req.user.role}` });
});

app.listen(3000, ()=>console.log('RBAC demo on http://localhost:3000'));