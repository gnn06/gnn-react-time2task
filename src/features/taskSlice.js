import { createSlice } from '@reduxjs/toolkit';

import { arrayPut } from '../utils/arrayUtil';
import { retrieveAccessToken, retrieveUser } from '../services/browser-storage';

const initialState = {
    tasks : [],
    selectedTaskId: [],
    currentFilter: {
        expression: 'no-filter',
        isMulti: false,
        isDisable: false,
        isStatusARepo: false,
        isError: false,
    },
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
            const selectedTask = state.selectedTapskId;
            const selectedSlot = state.selectedSlotId[0];
            selectedTask.every(task => state.association[task] = selectedSlot);
            state.selectedTaskId = [];
            state.selectedSlotId = [];
        },
        setTaskFilter: (state, action) => {
            state.currentFilter = {... state.currentFilter, expression: action.payload.filter }
        },
        setFilterIsMulti: (state, action) => {
            state.currentFilter = {... state.currentFilter, isMulti: action.payload.filter }
        },
        setFilterIsDisable: (state, action) => {
            state.currentFilter = {... state.currentFilter, isDisable: action.payload.filter }
        },
        setFilterIsStatusARepo: (state, action) => {
            state.currentFilter = {... state.currentFilter, isStatusARepo: action.payload.filter }
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
        setSlotViewFilterConfLevel: (state, action) => {
            state.slotViewFilterConf = { ...state.slotViewFilterConf, levelMaxIncluded: action.payload.level };
        },
        setSlotViewFilterConf: (state, action) => {
            state.slotViewFilterConf = action.payload.conf;
        }
    }
})

export const { selectTask, selectSlot, associateSelected, setTaskFilter, setFilterIsMulti, setFilterIsDisable, setFilterIsStatusARepo, login, logout, accessToken, setActivity,
    setSlotViewFilterConfLevel, setSlotViewFilterConf
} = taskSlice.actions

export default taskSlice.reducer