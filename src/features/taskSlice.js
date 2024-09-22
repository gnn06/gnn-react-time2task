import { createSlice } from '@reduxjs/toolkit';

import { arrayPut } from '../utils/arrayUtil';
import { retrieveAccessToken, retrieveUser } from '../services/browser-storage';

const initialState = {
    tasks : [],
    selectedTaskId: [],
    currentTaskFilter: 'no-filter',
    currentFilterIsMulti: false,
    currentFilterIsDisable: false,
    slotViewFilterConf: {
        collapse: [
          "this_month next_week",
          "this_month following_week",
          "next_month"
        ],
        remove: [],
        levelMin: null,
        levelMaxIncluded: null
    },
    selectedSlotId: [],
    association: {},
    user: retrieveUser(),
    accessToken: retrieveAccessToken(),
    activity: null
};

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
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
        setTaskFilter: (state, action) => {
            state.currentTaskFilter = action.payload.filter;
        },
        setFilterIsMulti: (state, action) => {
            state.currentFilterIsMulti = action.payload.filter;
        },
        setFilterIsDisable: (state, action) => {
            state.currentFilterIsDisable = action.payload.filter;
        },
        login: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = { id: '', email: '' };
            state.accessToken = '';
        },
        accessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        setActivity: (state, action) => {
            state.currentActivity = action.payload.activity;
        },
        setSlotViewFilterConf: (state, action) => {
            state.slotViewFilterConf = { ...state.slotViewFilterConf, levelMaxIncluded: action.payload.level };
        },
    }
})

export const { selectTask, selectSlot, associateSelected, setTaskFilter, setFilterIsMulti, setFilterIsDisable, login, logout, accessToken, setActivity,
    setSlotViewFilterConf
} = taskSlice.actions

export default taskSlice.reducer