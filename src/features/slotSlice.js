import { createSlice } from '@reduxjs/toolkit'

const initialState = [
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
];

export const slotSlice = createSlice({
    name: 'slots',
    initialState,
    reducers: {
        add: (state, newSlot) => {
            state.slots.push(newSlot)
        }
    }
})

export const { add } = slotSlice.actions

export default slotSlice.reducer