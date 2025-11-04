import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { remove } from '../store/cartSlice';

export default function Cart(){
const items = useSelector(s=>s.cart.items);
const dispatch = useDispatch();
return (
<div>
<h3>Cart</h3>
{items.map(it=> (
<div key={it.id}>{it.name} <button onClick={()=>dispatch(remove(it.id))}>Remove</button></div>
))}
</div>
)
}