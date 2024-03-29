import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { taskCompare } from '../data/task'
import { mapProperties } from '../utils/objectUtil'

const mapping = [
    { old: 'slotExpr', new: 'slotExpr' },
    { old: 'status',   new: 'Etat' },
    { old: 'order',    new: 'ordre' },
    { old: 'title',    new: 'Sujet' },
];

/**
 * postgres policy implemented, tasks.id need to be autoincremented
 */

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery:   fetchBaseQuery({
        baseUrl : process.env.REACT_APP_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const state = getState()            
            headers.set("apiKey", process.env.REACT_APP_API_KEY)
            headers.set("Authorization", 'Bearer ' + state.tasks.accessToken)
        },
    }),

    endpoints: builder => ({
        getTasks: builder.query({
            query: (user) => `/tasks?and=(Etat.neq.archivé),user.eq.${user})`,            
            transformResponse: (response, meta, arg) => 
                response.map(
                    item => ({
                        id: item.id,
                        title: item.Sujet,
                        slotExpr: item.slotExpr,
                        status: item.Etat,
                        order: item.ordre
                    }))
                    // Don't need to check MultiSlot as compare sort on  first slot
                    .sort(taskCompare),
            providesTags: (result) => [{ type: 'Tasks', id: 'LIST' }]
        }),

        updateTask: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/tasks?id=eq.${id}`,
                method: 'PATCH',
                body: mapProperties(patch, mapping),
            }),
            invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),

        addTask: builder.mutation({
            query: (patch) => ({
                url: '/tasks',
                method: 'POST',
                body: { Sujet: patch.title, slotExpr: patch.slotExpr, user: patch.user }
            }),
            invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),

        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/tasks?id=eq.${id}`,
                method: 'DELETE'
              }),
              invalidatesTags: (result, error, id) => [{ type: 'Tasks', id: 'LIST' }, { type: 'Tasks', id }]
            })
    })
})

export const { useGetTasksQuery, useUpdateTaskMutation, useAddTaskMutation, useDeleteTaskMutation } = apiSlice