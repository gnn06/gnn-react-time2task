import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities"

import { IconButton, Menu, MenuItem } from "@mui/material";
import DragIcon from '@mui/icons-material/DragIndicator';
import TargetIcon from '@mui/icons-material/AdsClick';
import MenuIcon from '@mui/icons-material/Menu';

import './task.css'

import InputEdit from "./edit-input.jsx";
import StatusInput from './status-input.jsx'
import ActivityInput from "./activity-input.jsx";
import SyntaxInputWithSelection from "./syntax-input-select.jsx";
import SlotSelectionButton from "./slot-selection-button.jsx";
import FavoriteToggle from "./favorite-toggle";
import IconButtonLink from "./icon-button-link.jsx";

import { editTask, setFilterTaskId, selectTask as selectTaskAction } from "../features/taskSlice";
import { useDeleteTaskMutation, useUpdateTaskMutation } from "../features/apiSlice";

import { getSlotIdAndKeywords } from "../data/slot-id.js";
import { isTaskUnique, isTaskMulti, isTaskRepeat } from "../data/task.js";


export default function TaskRow({ task }) {

    const dispatch = useDispatch();
    const [ updateTask ] = useUpdateTaskMutation()
    const [ deleteTask ] = useDeleteTaskMutation();
    const filterTaskId = useSelector(state => state.tasks.currentFilter.taskId);
    const selected = useSelector(state => state.tasks.selectedTaskId).some(taskId => taskId === task.id);

    const { attributes, listeners, setNodeRef, transform, isDraggingn, active } = useDraggable({ id: task.id })
    const anchorEl = useRef();
    const [showMenu, setShowMenu] = useState(false)

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    const handleSave = (slotExpr) => {
        updateTask({id:task.id, slotExpr})
    }

    const handleTarget = () => {
        if (filterTaskId) {
            dispatch(setFilterTaskId(undefined));
        } else {
            dispatch(setFilterTaskId(task.id));
        }
    }

    const isDraggingCurrent = active?.id === task.id

    const handleMenu = () => {
        setShowMenu(true)
    }

    const handleEdit = () => {
        setShowMenu(false);
        dispatch(editTask(task))
    }

    const handleDelete = () => {
        setShowMenu(false);
        const isConfirm = window.confirm('Supprimer la tâche ?');
        if (isConfirm) {
            deleteTask(task.id)
        }
    }

    const handleCloseMenu = () => {
        setShowMenu(false)
    }

    // handlers internalisés (plus besoin de props externes)
    const onTitleChange = (event) => {
        const title = event.target.value;
        updateTask({ id: task.id, title });
    }

    const onNextActionChange = (event) => {
        const nextAction = event.target ? event.target.value : event;
        updateTask({ id: task.id, nextAction, url: task.url, favorite: task.favorite });
    }

    const onActivityChange = (activity) => {
        if (activity === '' || activity === null) { activity = null } else { activity = Number(activity) }
        updateTask({ id: task.id, activity });
    }

    const onStatusChange = (status) => {
        updateTask({ id: task.id, status });
    }

    const onToggleFavorite = async () => {
        // need to send nextAction and url to avoid clearing them
        updateTask({ id: task.id, favorite: !task.favorite, nextAction: task.nextAction, url: task.url });
    }

    return <tr className={myClassName} style={style}>
                <td><DragIcon  ref={setNodeRef} {...listeners} {...attributes}/>
                    {isDraggingCurrent && <div className="fixed mt-4 p-2 w-40 bg-blue-500 rounded z-1000">Déposez cette tâche sur le créneau où elle doit être réalisée.</div>}</td>
                <td><InputEdit key={task ? task.title : 'null'} defaultValue={task && task.title} saveHandler={onTitleChange} className="w-full" placeHolder="Titre"/></td>
                <td style={{ width: "1%", textAlign: 'center' }}>
                    { task.url && <IconButtonLink href={task?.url} fontSize="small"  /> }
                </td>
                <td><InputEdit key={task ? task.nextAction ?? 'null-next' : 'null'} defaultValue={task && task.nextAction} saveHandler={onNextActionChange} className="w-full" placeHolder="Prochaine action"/></td>
                <td style={{width: "1%" /* width: 1% to prevent the column from widening unnecessarily */}} >
                    <FavoriteToggle favorite={task.favorite} onToggle={onToggleFavorite} size={24} />
                </td>
                <td><ActivityInput activity={task.activity} saveHandler={(value) => onActivityChange(value)} isFilter={false}/></td>
                <td><StatusInput key={task.status} task={task} saveHandler={onStatusChange}/></td>
                <td><SlotSelectionButton task={task} handleSave={handleSave} withText={true}/>
                    {task.id && <IconButton onClick={handleTarget}><TargetIcon  /></IconButton>}</td>
                <td>{task && isTaskMulti(task)                        && <span className="font-bold">M</span>}
                    {task && !isTaskMulti(task) && isTaskUnique(task) && <span className="font-bold">1</span>}
                    {task && !isTaskMulti(task) && isTaskRepeat(task) && <span className="font-bold">R</span>}
                    {task && !task.slotExpr                           && <span className="font-bold">E</span>}</td>
                <td ref={anchorEl} >
                    <IconButton onClick={handleMenu}><MenuIcon/></IconButton>
                    <Menu open={showMenu} anchorEl={anchorEl.current} onClose={handleCloseMenu}>
                        <MenuItem onClick={handleEdit}>Edit</MenuItem>
                        <MenuItem onClick={handleDelete}>Delete</MenuItem>
                    </Menu></td>                
            </tr>
            
    
}