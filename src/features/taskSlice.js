import { createSlice } from '@reduxjs/toolkit';

const initialState = [
    { 
        id: 'id1',
        title: 'task 1'
    },
    {
        id: 'id2',
        title: 'task 2'
    },
    {
        id:    'id3',
        title: 'task 3'
    }
];

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        add: (state, action) => {
            const newId = state.length + 1;
            action.payload.id = "id" + newId;
            state.push(action.payload)
        }
    }
})

export const { add } = taskSlice.actions

export default taskSlice.reducer