import { createSlice } from '@reduxjs/toolkit'

export const slotSlice = createSlice({
    name: 'slot',
    initialState: {
        slots: [
            {
                id:    'slot3',
                title: 'day',
                inner: [
                    {
                        id:    'slot1',
                        title: 'créneau1',
                        start: '10:00',
                        end:   '11:00'
                    },
                    {
                        id:    'slot2',
                        title: 'créneau2',
                        start: '14:00',
                        end:   '15:00'
                    }
                ]
            }
        ]
    },
    reducers: {
        add: (state, newSlot) => {
            state.slots.push(newSlot)
        }
    }
})

export const { add } = slotSlice.actions

export default slotSlice.reducer