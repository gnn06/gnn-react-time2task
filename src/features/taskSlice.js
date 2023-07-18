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
    selectedTask: [],
    slots: [
        {
            id:    'slot1',
            title: 'day',
            inner: [
                {
                    id:    'slot2',
                    title: 'créneau1',
                    start: '10:00',
                    end:   '11:00'
                },
                {
                    id:    'slot3',
                    title: 'créneau2',
                    start: '14:00',
                    end:   '15:00'
                }
            ]
        }
    ],
    association: {}
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
        selectTask: (state, action) => {
            const taskId = action.payload;
            const index = state.selectedTask.indexOf(taskId);
            if (index === -1) {
                state.selectedTask.push(taskId);
            } else {
                state.selectedTask.splice(index, 1);
            }
        },
        associate: (state, action) => {
            const {task, slot} = action.payload;
            state.association[task] = slot;
        }
    }
})

export const { add, selectTask, associate } = taskSlice.actions

export default taskSlice.reducer