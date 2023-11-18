import React, { useState } from "react";

import Button from '../components/button';

import { useAddTaskMutation } from "../features/apiSlice.js";

export default function AddTaskForm() {

    const [title, setTitle] = useState('');

    const [
        addTask
      ] = useAddTaskMutation()
    const onTitleChange = e => setTitle(e.target.value);

    const onSaveTaskClicked = () => {
        addTask({title})
        setTitle('');
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
            </form>
            <Button clickToto={onSaveTaskClicked} label="Sauver la Tâche" />
        </div>
    )
}