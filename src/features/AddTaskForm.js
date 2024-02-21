import React, { useState } from "react";

import Button from '../components/button';

import { useAddTaskMutation } from "../features/apiSlice.js";
import { useStore } from "react-redux";

export default function AddTaskForm() {

    const [title, setTitle] = useState('');
    const [slotExpr, setSlotExpr]   = useState('');
    const store = useStore();

    const [
        addTask
      ] = useAddTaskMutation()
    const onTitleChange = e => setTitle(e.target.value);

    const onSaveTaskClicked = () => {
        const user = store.getState().tasks.user;
        addTask({title, slotExpr, user: user.id})
        setTitle('');
        setSlotExpr('');
    };

    return(
        <div>
            <form>
                <label htmlFor="taskTitle">Titre : </label>
                <input type="text"
                    id="taskTitle"
                    name="taskTile"
                    value={title}
                    onChange={onTitleChange}
                />
                <label htmlFor="taskSlotExpr">Créneau : </label>
                <input type="text"
                    id="taskSlotExpr"
                    name="taskSlotExpr"
                    value={slotExpr}
                    onChange={(e) => setSlotExpr(e.target.value)}
                />
            </form>
            <Button clickToto={onSaveTaskClicked} label="Sauver la Tâche" />
        </div>
    )
}