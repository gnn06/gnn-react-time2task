import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tasks : [
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
    ]
};

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        add: (state, action) => {
            const newId = state.tasks.length + 1;
            action.payload.id = "id" + newId;
            state.tasks.push(action.payload)
        }
    }
})

export const { add } = taskSlice.actions

export default taskSlice.reducer