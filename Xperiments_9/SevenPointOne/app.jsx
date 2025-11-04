import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function App(){
const [data, setData] = useState([]);
useEffect(()=>{
axios.get('/api/products').then(r=>setData(r.data));
},[]);
return (<ul>{data.map(p=>(<li key={p.id}>{p.name}</li>))}</ul>);
}