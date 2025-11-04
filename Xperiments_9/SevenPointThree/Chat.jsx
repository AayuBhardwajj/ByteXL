import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');

export default function Chat(){
const [messages, setMessages] = useState([]);
const [text, setText] = useState('');
useEffect(()=>{
socket.on('message', msg => setMessages(m=>[...m, msg]));
return ()=> socket.off('message');
},[]);
const send = ()=>{ socket.emit('message', { text, when: Date.now()}); setText(''); }
return (
<div>
<div style={{height:200, overflow:'auto'}}>
{messages.map((m,i)=>(<div key={i}>{m.text}</div>))}
</div>
<input value={text} onChange={e=>setText(e.target.value)} />
<button onClick={send}>Send</button>
</div>
)
}