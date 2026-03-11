import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, MenuItem, Paper, Select, Stack, Tooltip, Typography } from "@mui/material";
import TargetIcon from '@mui/icons-material/AdsClick';

import TaskList from "./task-list";
import { setFilterTaskId } from "../features/taskSlice";

export default function TaskPanel({tasks}) {
    // eslint-disable-next-line
    const [group, setGroup] = useState("0");
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
        <div className="m-0 p-0 pb-0 flex flex-col h-full">
            <Paper sx={{padding:0.5, backgroundColor:'white', width: 'fit-content', ml:'auto' , height:'44.85px', marginBottom:0.75}}>
                <Stack direction={"row"} spacing={1} >
                    { filterTaskId && <IconButton onClick={onFilterTask} size="small"><TargetIcon /> <Typography > Filtré</Typography></IconButton>}
                    <Tooltip title="Regrouper par" placement="top">
                        <FormControl size="small" >
                            <Select
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                            >
                                <MenuItem value="0">Rien</MenuItem>
                                <MenuItem value="1">Mois</MenuItem>
                                <MenuItem value="2">Semaine</MenuItem>
                                <MenuItem value="3">Jour</MenuItem>
                                <MenuItem value="4">Heure</MenuItem>
                                <MenuItem value="activity">Activité</MenuItem>
                            </Select>
                        </FormControl>
                    </Tooltip>
                </Stack>
            </Paper>
            <div className={draggingStyle + " h-full"}>
                <TaskList  tasks={tasks} group={group}/>
            </div>            
        </div>
    )
}