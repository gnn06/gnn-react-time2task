import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery:   fetchBaseQuery({
        baseUrl : 'https://api.airtable.com/v0/appxxeJDaPUItDFAF',
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
                        slotExpr: item.fields.slotExpr
                    }))
        }),

        setSlotExpr: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/Taches/${id}`,
                method: 'PATCH',
                body: { fields: { slotExpr: patch.slotExpr }},
              })
        }),

        addTask: builder.mutation({
            // TODO manage revalidate
            query: (patch) => ({
                url: '/Taches',
                method: 'POST',
                body: { fields: { Sujet: patch.title }}
            })
        }),

        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/Taches/${id}`,
                method: 'DELETE'
              })
        })
    })
})

export const { useGetTasksQuery, useSetSlotExprMutation, useAddTaskMutation, useDeleteTaskMutation } = apiSlice