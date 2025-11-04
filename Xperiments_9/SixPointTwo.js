const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const SECRET = 'bank_secret_change_me';
app.use(bodyParser.json());

// login (demo)
app.post('/login', (req,res)=>{
const { user } = req.body;
if(!user) return res.status(400).end();
const token = jwt.sign({ user }, SECRET, { expiresIn:'1h' });
res.json({ token });
});

function auth(req,res,next){
const h = req.headers.authorization;
if(!h) return res.status(401).end();
try{ req.user = jwt.verify(h.split(' ')[1], SECRET); next(); } catch(e){ res.status(401).end(); }
}

// protected banking endpoints
app.get('/balance', auth, (req,res)=>{
// demo fixed balance
res.json({ account: req.user.user, balance: 12345 });
});

app.post('/transfer', auth, (req,res)=>{
const { to, amount } = req.body;
// demo: always succeed
res.json({ status:'ok', to, amount });
});

app.listen(6000, ()=>console.log('Banking API on :6000'));