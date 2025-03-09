import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Stack, Typography } from "@mui/material";
import TargetIcon from '@mui/icons-material/AdsClick';

import CreateTask from "./create-task";
import ShiftAction from './action-shift';
import TodoAction from './action-todo';
import TaskList from "./task-list";
import { setFilterTaskId } from "../features/taskSlice";

export default function TaskPanel({tasks}) {
    // eslint-disable-next-line
    const [group, setGroup] = useState(null);
    const dispatch = useDispatch();
    const filterTaskId = useSelector(state => state.tasks.currentFilter.taskId);
    const isDragging  = useSelector(state => state.tasks.isDragging);
    
    
    const onFilterTask = () => {
        dispatch(setFilterTaskId(undefined));
    }

    // temporaly change overflow from hidden to visible to make the task visible on the other panel when drraging
    // panel use overflow:hidden to make panel collapsable.
    const draggingStyle = isDragging ? 'overflow-visible' : " overflow-y-scroll "

    return (
        <div className="m-0 p-1 pb-1 flex flex-col h-full">
            <Stack direction={"row"} spacing={0.5} >
                <CreateTask />
                <ShiftAction />
                <TodoAction tasks={tasks} className="grow"/>
                { filterTaskId && <IconButton onClick={onFilterTask} size="small"><TargetIcon /> <Typography > Filtré</Typography></IconButton>}
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
            </Stack>
            <div className={draggingStyle}><TaskList  tasks={tasks} group={group}/></div>            
        </div>
    )
}