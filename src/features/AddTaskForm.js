import React, { useState } from "react";
import { useDispatch } from "react-redux";

import Button from '../components/button';

import { add, associate } from './taskSlice';

export default function AddTaskForm() {

    const [title, setTitle] = useState('');

    const dispatch = useDispatch();

    const onTitleChange = e => setTitle(e.target.value);

    const onSaveTaskClicked = () => {
        dispatch(
            add({title})
        );
        setTitle('');
    };

    const onAssociateClicked = () => {
        dispatch(
            associate({task: 'task1', slot: 'slot1'})
        );
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
            <Button clickToto={onAssociateClicked} label="Associer" />
        </div>
    )
}