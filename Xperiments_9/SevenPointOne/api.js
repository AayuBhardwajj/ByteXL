const express = require('express');
const app = express();
app.get('/api/products', (req,res)=>{
res.json([{ id:1, name:'Shoe' }, { id:2, name:'Shirt' }]);
});
app.listen(5000, ()=>console.log('API on :5000'));