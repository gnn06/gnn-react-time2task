import { createSlice } from '@reduxjs/toolkit';

import { arrayPut } from '../utils/arrayUtil';
import { retrieveAccessToken, retrieveUser } from '../services/browser-storage';

const initialState = {
    tasks : [],
    selectedTaskId: [],
    currentTaskFilter: 'no-filter',
    currentFilterIsMulti: false,
    currentFilterIsDisable: false,
    slots: [{
        id: 'this_month',
        title: 'ce mois ci',
        path: 'this_month',
        inner: [
            { id:    'this_week',
              title: 'semaine',
              path: 'this_month this_week',
              inner: [
                {   id:    'lundi',
                    title: 'lundi',
                    path:  'this_month this_week lundi',
                    inner: [
                        { id: 'lundi_matin', title: 'matin', path: 'this_month this_week lundi matin' },
                        { id: 'lundi_aprem', title: 'aprem', path: 'this_month this_week lundi aprem' }
                    ]},
                {   id:    'mardi',
                    title: 'mardi',
                    path:  'this_month this_week mardi',
                    inner: [
                        { id: 'mardi_matin', title: 'matin', path: 'this_month this_week mardi matin' },
                        { id: 'mardi_aprem', title: 'aprem', path: 'this_month this_week mardi aprem' }
                    ] },
                {   id:    'mercredi',
                    title: 'mercredi',
                    path:  'this_month this_week mercredi',
                    inner: [
                        { id: 'mercredi_matin', title: 'matin', path: 'this_month this_week mercredi matin' },
                        { id: 'mercredi_aprem', title: 'aprem', path: 'this_month this_week mercredi aprem' }
                    ]
                },
                {   id:    'jeudi',
                    title: 'jeudi',
                    path:  'this_month this_week jeudi',
                    inner: [
                        { id: 'jeudi_matin', title: 'matin', path: 'this_month this_week jeudi matin' },
                        { id: 'jeudi_aprem', title: 'aprem', path: 'this_month this_week jeudi aprem' }
                    ]
                },
                {   id:    'vendredi',
                    title: 'vendredi',
                    path:  'this_month this_week vendredi',
                    inner: [
                        { id: 'vendredi_matin', title: 'matin', path: 'this_month this_week vendredi matin' },
                        { id: 'vendredi_aprem', title: 'aprem', path: 'this_month this_week vendredi aprem' }
                    ] }
              ]
            },
            { id:    'next_week',
              title: 'semaine prochaine',
              path:  'this_month next_week',
              inner: []
            },
            {
              id: 'following_week',
              title: 'semaine suivante',
              path: 'this_month following_week',
              inner: []
            }
        ]
    },{
        id:    'next_month',
        title: 'mois prochain',
        path:  'next_month'
    }],
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
    }
})

export const { selectTask, selectSlot, associateSelected, setTaskFilter, setFilterIsMulti, setFilterIsDisable, login, logout, accessToken, setActivity } = taskSlice.actions

export default taskSlice.reducer