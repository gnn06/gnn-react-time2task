import { createSlice } from '@reduxjs/toolkit';

import { arrayPut } from '../utils/arrayUtil';

const initialState = {
    tasks : [
        { 
            id: 'task1',
            title: 'task 1',
            slotExpr: ''
        },
        {
            id: 'task2',
            title: 'task 2',
            slotExpr: ''
        },
        {
            id:    'task3',
            title: 'task 3',
            slotExpr: ''
        }
    ],
    selectedTaskId: [],
    slots: [
        { id:    'week',
          title: 'semaine',
          inner: [
            { id:    'lundi',
              title: 'lundi' },
            { id:    'mardi',
              title: 'mardi' },
            { id:    'mercredi',
              title: 'mercredi' }
          ]
        },
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
    selectedSlotId: [],
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
            arrayPut(state.selectedTaskId, taskId);
        },
        selectSlot: (state, action) => {
            const slotId = action.payload;
            arrayPut(state.selectedSlotId, slotId);
        },
        associate: (state, action) => {
            const {task, slot} = action.payload;
            state.association[task] = slot;
        },
        associateSelected: (state, action) => {
            const selectedTask = state.selectedTaskId;
            const selectedSlot = state.selectedSlotId[0];
            selectedTask.every(task => state.association[task] = selectedSlot);
            state.selectedTaskId = [];
            state.selectedSlotId = [];
        },
        setSlotExpr: (state, action) => {
            const { taskId, slotExpr } = action.payload;
            state.tasks.find(item => item.id === taskId).slotExpr = slotExpr;
        }
    }
})

export const { add, selectTask, selectSlot, associateSelected, setSlotExpr } = taskSlice.actions

export default taskSlice.reducer