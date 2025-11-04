// client/src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function Login(){
const [email,setEmail] = useState('');
const [pw,setPw] = useState('');
const login = async () => {
const res = await axios.post('/api/login',{ email, password: pw });
localStorage.setItem('token', res.data.token);
window.location.href = '/dashboard';
}
return (
<div>
<h2>Login</h2>
<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
<input value={pw} onChange={e=>setPw(e.target.value)} placeholder="password" type="password" />
<button onClick={login}>Login</button>
</div>
)
}

// client/src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }){
const token = localStorage.getItem('token');
if(!token) return <Navigate to="/login" replace />;
return children;
}

// server/index.js (Express + JWT)
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const SECRET = 'change_this_secret';

app.post('/api/login', (req,res)=>{
const { email, password } = req.body;
// demo: accept any non-empty credentials
if(!email || !password) return res.status(400).json({message:'bad'})
const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
res.json({ token });
});

// middleware to protect
function auth(req,res,next){
const authh = req.headers.authorization;
if(!authh) return res.status(401).end();
const token = authh.split(' ')[1];
try{ req.user = jwt.verify(token, SECRET); next(); } catch(e){ res.status(401).end(); }
}

app.get('/api/secure', auth, (req,res)=>{
res.json({ message: 'secure data', user: req.user });
});

app.listen(4000, ()=>console.log('Auth demo on :4000'));