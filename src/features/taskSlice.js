import { createSlice } from '@reduxjs/toolkit'

export const taskSlice = createSlice({
    name: 'task',
    initialState: {
        tasks: [
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
    },
    reducers: {
        add: (state, newTask) => {
            state.tasks.push(newTask)
        }
    }
})

export const { add } = taskSlice.actions

export default taskSlice.reducer