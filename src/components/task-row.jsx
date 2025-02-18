import { useDispatch, useSelector } from "react-redux";
import { useDraggable } from "@dnd-kit/core";
import InputEdit from "./edit-input.jsx";
import StatusInput from './status-input.jsx'
import DragIcon from '@mui/icons-material/DragIndicator';
import TargetIcon from '@mui/icons-material/AdsClick';
import { IconButton } from "@mui/material";
import { CSS } from "@dnd-kit/utilities"

import ActivityInput from "./activity-input.jsx";
import SyntaxInputWithSelection from "./syntax-input-select.jsx";
import SlotSelectionButton from "./slot-selection-button.jsx";

import { setFilterTaskId } from "../features/taskSlice";
import { useUpdateTaskMutation } from "../features/apiSlice";

import { getSlotIdAndKeywords } from "../data/slot-id.js";
import { isTaskUnique, isTaskMulti, isTaskRepeat } from "../data/task.js";


export default function TaskRow({task, selected, onTitleChange, onSlotExprChange, onOrderChange, onActivityChange, onStatusChange, button, onTaskClick}) {

    const dispatch = useDispatch();
    const [ updateTask ] = useUpdateTaskMutation()
    const filterTaskId = useSelector(state => state.tasks.currentFilter.taskId);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id })

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

        //  console.log('task', task)

    // const dragProps =  { ref: ref,
    //     style: {transform: CSS.Translate.toString(transform)},
    //     ...attributes,
    //    ...listeners}

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

    return <tr className={myClassName} style={style}>
                <td><DragIcon  ref={setNodeRef} {...listeners} {...attributes}/></td>
                <td><InputEdit key={task ? task.title : 'null'} defaultValue={task && task.title} saveHandler={onTitleChange} className="w-full" placeHolder="Titre"/></td>
                <td><ActivityInput task={task} saveHandler={(value) => onActivityChange(value)} isFilter={false}/></td>
                <td><StatusInput key={task.status} task={task} saveHandler={onStatusChange}/></td>
                <td><InputEdit key={task.order}    defaultValue={task && task.order} saveHandler={(event) => onOrderChange(event.target.value === '' ? null : Number(event.target.value))} className="w-10" placeHolder={ task.id === undefined ? "Ordre" : "" }/></td>
                <td><IconButton onClick={handleTarget}><TargetIcon color={filterTaskId === task.id ? "primary" : "text"} /></IconButton>
                    <SlotSelectionButton task={task} handleSave={handleSave}/></td>
                <td>{task && isTaskMulti(task)                        && <span className="font-bold">M</span>}
                    {task && !isTaskMulti(task) && isTaskUnique(task) && <span className="font-bold">1</span>}
                    {task && !isTaskMulti(task) && isTaskRepeat(task) && <span className="font-bold">R</span>}
                    {task && !task.slotExpr                           && <span className="font-bold">E</span>}</td>
                <td>{button}</td>            
            </tr>
    
}