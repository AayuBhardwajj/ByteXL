import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
name:'cart',
initialState: { items: [] },
reducers: {
add(state, action){
state.items.push(action.payload);
},
remove(state, action){
state.items = state.items.filter(i=>i.id!==action.payload);
}
}
});
export const { add, remove } = cartSlice.actions;
export default cartSlice.reducer; 