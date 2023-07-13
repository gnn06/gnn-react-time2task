import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tasks : [
        { 
            id: 'task1',
            title: 'task 1'
        },
        {
            id: 'task2',
            title: 'task 2'
        },
        {
            id:    'task3',
            title: 'task 3'
        }
    ],
    taskWithSlot: {}
};

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        add: (state, action) => {
            const newId = state.tasks.length + 1;
            action.payload.id = "id" + newId;
            state.tasks.push(action.payload)
        },
        associate: (state, action) => {
            const {task, slot} = action.payload;
            state.taskWithSlot[task] = slot;
        }
    }
})

export const { add, associate } = taskSlice.actions

export default taskSlice.reducer