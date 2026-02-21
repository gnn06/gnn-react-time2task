import { createSlice } from '@reduxjs/toolkit';

import { arrayPut } from '../utils/arrayUtil';
import { retrieveAccessToken, retrieveUser } from '../services/browser-storage';
import { DEFAULT_CONF, reduceCollapseOnConf } from '../data/slot-view';

const initialState = {
    tasks : [],
    selectedTaskId: [],
    currentFilter: {
        expression: '',
        isMulti: false,
        isDisable: false,
        isStatusARepo: false,
        genericFilters: {},
        isError: false,
        slot: null,
        taskId: null,
    },
    slotViewFilterConf: DEFAULT_CONF,
    showRepeat: true,
    selectedSlotId: [],
    association: {},
    user: retrieveUser(),
    accessToken: retrieveAccessToken(),
    currentActivity: null,
    editTask: null,
    isDragging: false,
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
            state.currentFilter = {...state.currentFilter, expression: action.payload.filter }
        },
        setFilterIsMulti: (state, action) => {
            state.currentFilter = {...state.currentFilter, isMulti: action.payload.filter }
        },
        setFilterIsDisable: (state, action) => {
            state.currentFilter = {...state.currentFilter, isDisable: action.payload.filter }
        },
        setFilterIsStatusARepo: (state, action) => {
            state.currentFilter = {...state.currentFilter, isStatusARepo: action.payload.filter }
        },
        setFilterGeneric: (state, action) => {
            const filters = action.payload;
            state.currentFilter = {...state.currentFilter, genericFilters: filters }
        },
        setFilterSlot: (state, action) => {
            const path = action.payload
            state.currentFilter = {...state.currentFilter, slot: path }
        },
        setFilterTaskId: (state, action) => {
            const taskId = action.payload
            state.currentFilter = {...state.currentFilter, taskId: taskId }
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
        setSlotViewFilterConfView: (state, action) => {
            state.slotViewFilterConf = { ...state.slotViewFilterConf, view: action.payload.view };
        },
        setSlotViewStrict: (state, action) => {
            const strict = action.payload
            state.slotViewFilterConf = {...state.slotViewFilterConf, slotStrict: strict }
        },
        setSlotViewFilterConf: (state, action) => {
            state.slotViewFilterConf = action.payload.conf;
        },
        confBranch: (state, action) =>  {
            const { path } = action.payload;
            const newConf = reduceCollapseOnConf(state.slotViewFilterConf, path)
            state.slotViewFilterConf = newConf;
        },
        editTask: (state, action) => {
            const task = action.payload;
            state.editTask = task;
        },
        showRepeatAction: (state, action) => {
            state.showRepeat = action.payload;
        },
        dragging: (state, action) => {
            state.isDragging = action.payload;
        }
    }
})

export const { selectTask, selectSlot, associateSelected, setTaskFilter, setFilterIsMulti, setFilterIsDisable, setFilterIsStatusARepo, login, logout, accessToken, setActivity,
    setSlotViewFilterConfLevel, setSlotViewFilterConf, setSlotViewFilterConfView, setSlotViewStrict,
    confBranch, setFilterSlot, setFilterTaskId, setFilterGeneric,
    editTask, showRepeatAction, dragging
} = taskSlice.actions

export default taskSlice.reducer