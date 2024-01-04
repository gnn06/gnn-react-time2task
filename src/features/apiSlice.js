import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { slotCompare, completeSlot } from '../services/slot'
import { taskCompare } from '../services/task'

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery:   fetchBaseQuery({
        baseUrl : `https://api.airtable.com/v0/${process.env.REACT_APP_BDD_KEY}`,
        prepareHeaders: (headers, { getState }) => {
            headers.set("Authorization", "Bearer pateXlE2yDTfJUXSk.3ef63a108889473cb840070c3699ce6edebdfd737e94b57f0ab9c14c409f4f42")
        },
    }),

    endpoints: builder => ({
        getTasks: builder.query({
            query: () => '/Taches?view=Toutes%20les%20taches',
            transformResponse: (response, meta, arg) => 
                response.records.map(
                    item => ({
                        id: item.id,
                        title: item.fields.Sujet,
                        slotExpr: item.fields.slotExpr,
                        status: item.fields.Etat,
                        order: item.fields.ordre
                    }))
                    // Don't need to check MultiSlot as compare sort on  first slot
                    .sort(taskCompare),
            providesTags: (result) => [{ type: 'Tasks', id: 'LIST' }]
        }),

        setSlotExpr: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/Taches/${id}`,
                method: 'PATCH',
                body: { fields: { slotExpr: patch.slotExpr }},
              }),
              invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),

        setEtat: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/Taches/${id}`,
                method: 'PATCH',
                body: { fields: { Etat: patch.status }},
            }),
            invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),
        
        setOrder: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/Taches/${id}`,
                method: 'PATCH',
                body: { fields: { ordre: Number(patch.order) }},
            }),
            invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),

        addTask: builder.mutation({
            query: (patch) => ({
                url: '/Taches',
                method: 'POST',
                body: { fields: { Sujet: patch.title, slotExpr: patch.slotExpr }}
            }),
            invalidatesTags: [{ type: 'Tasks', id: 'LIST' }]
        }),

        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/Taches/${id}`,
                method: 'DELETE'
              }),
              invalidatesTags: (result, error, id) => [{ type: 'Tasks', id: 'LIST' }, { type: 'Tasks', id }]
            })
    })
})

export const { useGetTasksQuery, useSetSlotExprMutation, useSetEtatMutation, useSetOrderMutation, useAddTaskMutation, useDeleteTaskMutation } = apiSlice