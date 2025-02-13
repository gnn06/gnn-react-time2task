import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton } from "@mui/material";
import TargetIcon from '@mui/icons-material/AdsClick';

import TaskGroup from "../components/task-group";
import TaskNew from './task-new';
import CreateTask from "./create-task";
import ShiftAction from './action-shift';
import TodoAction from './action-todo';
import { useAddTaskMutation, useUpdateTaskMutation } from "../features/apiSlice.js";
import { setFilterTaskId } from "../features/taskSlice";

export default function TaskList({tasks}) {
    // eslint-disable-next-line
    const [ addTask ] = useAddTaskMutation()
    const [ updateTask, /*{ isLoading: isUpdating }*/ ] = useUpdateTaskMutation()
    const [group, setGroup] = useState(null);
    const dispatch = useDispatch();
    const filterTaskId = useSelector(state => state.tasks.currentFilter.taskId);
    
    
    const onFilterTask = () => {
        dispatch(setFilterTaskId(undefined));
    }

    return (
        <div className="m-1 ">
            <div className="flex flex-row justify-end space-x-1">
                <CreateTask />
                { filterTaskId && <IconButton onClick={onFilterTask}><TargetIcon /></IconButton>}
                <ShiftAction />
                <TodoAction tasks={tasks}/>
                <label>
                    Regrouper par :
                    <select onChange={(e) => setGroup(e.target.value)} className="m-1">
                        <option value="0">Rien</option>
                        <option value="1">Mois</option>
                        <option value="2">Semaine</option>
                        <option value="3">Jour</option>
                        <option value="4">Heure</option>
                    </select>
                </label>
            </div>
            <table className="w-full">
                <thead>
                <tr>
                    <th></th>
                    <th>Titre</th>
                    <th>Activité</th>
                    <th>Statut</th>
                    <th>Ordre</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                    <TaskGroup tasks={tasks} group={group} api={updateTask}/>
                    <TaskNew api={addTask}/>
                </tbody>
            </table>
            { `${tasks.length} tâche(s)` }
        </div>
    )
}