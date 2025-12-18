import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { taskCompare } from '../data/task'
import { mapProperties } from '../utils/objectUtil'
import { extractExtrasFromRow, buildExtraPropsFromPatch } from '../utils/extraProps';
import { supabase } from '../services/supabase'
import { storeUser, storeAccessToken, removeUser, removeAccessToken } from "../services/browser-storage";
import { login, accessToken, logout } from "../features/taskSlice";

const mapping = [
    { old: 'slotExpr', new: 'slotExpr' },
    { old: 'status',   new: 'Etat' },
    { old: 'order',    new: 'ordre' },
    { old: 'activity', new: 'Activity' },
    { old: 'title',    new: 'Sujet' },
];

/**
 * postgres policy implemented, tasks.id need to be autoincremented
 */

export const baseQuery = fetchBaseQuery({
    baseUrl : import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
        const state = getState()            
        headers.set("apiKey", import.meta.env.VITE_API_KEY)
        headers.set("Authorization", 'Bearer ' + state.tasks.accessToken)
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    // TODO manage concurrent refresh ; not cirtical as refreshToken return same refresh token.
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
        console.log('oauth, 401, try to refresh')
        // try to get a new token
        const { data, error } = await supabase.auth.refreshSession()
        if (!error) {
            console.log('oauth, token refreshed succced')
            // store refresh token
            storeAccessToken(data.session.access_token)
            api.dispatch(accessToken(data.session.access_token))
            // retry the initial query
            result = await baseQuery(args, api, extraOptions)
        } else {
            // logout
            console.log('oauth, token refresh failure')
            api.dispatch(logout())
        }
    }
    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery:   baseQueryWithReauth,
    tagTypes: ['Activities','UserConfs'],
 
    endpoints: builder => ({
        getActivities: builder.query({
            query: (param) => {
                return `/Activities`
            },
            providesTags: (result) => [{ type: 'Activities', id: 'LIST' }]
        }),
        updateActivity: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/Activities?id=eq.${id}`,
                method: 'PATCH',
                body: patch,
            }),
            invalidatesTags: [{ type: 'Activities', id: 'LIST' }]
        }),
        deleteActivity: builder.mutation({
            query: (id) => ({
                url: `/Activities?id=eq.${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Activities', id: 'LIST' }, { type: 'Activity', id }, { type: 'Tasks', id: 'LIST' }]
        }),
        // addActivity({ label: "toto" })
        addActivity: builder.mutation({
            query: (patch) => ({
                url: '/Activities',
                method: 'POST',
                body: { label: patch.label },
                headers: {
                    "Prefer": "return=representation"
                }                
            }),
            invalidatesTags: () => [{ type: 'Activities', id: 'LIST' }]
        }),

        getTasks: builder.query({
            query: (param) => {
                const { userId, activity } = param
                if (activity === 0) {
                    return `/tasks?Etat=neq.archivé&user=eq.${userId}&Activity=is.null`
                } else if (activity ) {
                    return `/tasks?Etat=neq.archivé&user=eq.${userId}&Activity=eq.${activity}`
                } else {
                    return `/tasks?Etat=neq.archivé&user=eq.${userId}`
                }                
            },
            transformResponse: (response, meta, arg) =>
                response.map(item => {
                    const extras = extractExtrasFromRow(item);
                    return {
                        id: item.id,
                        title: item.Sujet,
                        slotExpr: item.slotExpr,
                        status: item.Etat,
                        order: item.ordre,
                        nextAction: extras.nextAction, // changed
                        url: extras.url,
                        favorite: extras.favorite,
                        activity: item.Activity
                    }
                }).sort(taskCompare),
                // Don't need to check MultiSlot as compare sort on  first slot
            providesTags: (result) => [{ type: 'Tasks', id: 'LIST' }]
        }),

        updateTask: builder.mutation({
            // on peut appeler updateTask avec uniquement les propriétés qui ont changées ; ça peut etre toutes
            query: ({ id, ...patch }) => {
                const body = mapProperties(patch, mapping);
                const extra = buildExtraPropsFromPatch(patch);
                if (extra) body.extra_props = extra; // changed: will write nextAction into extra_props
                return {
                    url: `/tasks?id=eq.${id}`,
                    method: 'PATCH',
                    body
                };
            },
            invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),

        addTask: builder.mutation({
            query: (patch) => {
                const extra = buildExtraPropsFromPatch(patch);
                return {
                    url: '/tasks',
                    method: 'POST',
                    body: {
                        Sujet: patch.title,
                        slotExpr: patch.slotExpr,
                        ordre: patch.order,
                        Activity: patch.activity,
                        Etat: patch.status,
                        user: patch.user,
                        ...(extra ? { extra_props: extra } : {})
                    }
                }
            },
            invalidatesTags: () => [{ type: 'Tasks', id: 'LIST' }]
        }),

        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/tasks?id=eq.${id}`,
                method: 'DELETE'
              }),
              invalidatesTags: (result, error, id) => [{ type: 'Tasks', id: 'LIST' }, { type: 'Tasks', id }]
            }),
        // SnapDates [ userid, slotid, date ]
        getSnapDates: builder.query({
            query: (param) => {
                return `/SnapDates`
            },
            providesTags: (result) => [{ type: 'SnapDates', id: 'LIST' }]
        }),
        updateSnapDate: builder.mutation({
            query: ({ id: slotid, ...patch }) => ({
                url: `/SnapDates`,
                method: 'POST',
                body: patch,
                headers: {Prefer: "resolution=merge-duplicates"}  
            }),
            invalidatesTags: (result, error, id) => [{ type: 'SnapDates', id: 'LIST' },]
        }),
        // récupère le filtre d'un utilisateur (retourne l'objet JSON ou null)
        getUserConf: builder.query({
            query: ({ userId, conf = 'default' }) => `/user_confs?conf=eq.${conf}`,
            transformResponse: (response) => {
                // PostgREST renvoie un tableau ; on prend le premier élément s'il existe
                if (!response || response.length === 0) return null;
                return response[0].value;
            },
            providesTags: (result, error, arg) => [{ type: 'UserConfs', id: arg.userId + ':' + (arg.conf||'default') }]
        }),
        // upsert du filtre (création ou mise à jour)
        upsertUserConf: builder.mutation({
            query: ({ userId, conf = 'default', value }) => ({
                url: '/user_confs',
                method: 'POST',
                body: { user_id: userId, conf, value },
                headers: { Prefer: 'resolution=merge-duplicates,return=representation' } // upsert semantics in PostgREST
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'UserConfs', id: arg.userId + ':' + (arg.conf||'default') }]
        }),
    })
})

export const { 
    useGetTasksQuery, useUpdateTaskMutation, useAddTaskMutation, useDeleteTaskMutation, 
    useGetActivitiesQuery, useUpdateActivityMutation, useAddActivityMutation, useDeleteActivityMutation,
    useGetSnapDatesQuery, useUpdateSnapDateMutation,
    useLazyGetUserConfQuery, useUpsertUserConfMutation
} = apiSlice