import React from "react";
import { useSelector } from "react-redux";
import Slot from './slot';
import { useGetTasksQuery } from "../features/apiSlice.js";

export default function SlotList()  {
    const slotRedux = useSelector(state => state.tasks.slots);
    const userId = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasks, isLoading, isError } = useGetTasksQuery({userId, activity})

    if (isLoading || isError)
        return 'Loading or Error'

    return (
        <div className="m-1 ">
            <h1>Slots</h1>
            {slotRedux.map((slot, index) => {
                return <Slot key={slot.id} slot={slot} tasks={tasks} />
            })}
        </div>
        )
    }