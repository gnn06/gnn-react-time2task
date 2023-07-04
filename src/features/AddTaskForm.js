import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { add } from './taskSlice';

export default function AddTaskForm() {

    const [title, setTitle] = useState('');

    const dispatch = useDispatch();

    const onTitleChange = e => setTitle(e.target.value);

    const onSaveTaskClicked = () => {
        dispatch(
            add({title})
        );
        setTitle('');
    }

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
            <button type="button" onClick={onSaveTaskClicked}>Sauver la Tâche</button>
        </div>
    )
}