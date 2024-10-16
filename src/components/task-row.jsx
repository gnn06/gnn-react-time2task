import InputEdit from "./edit-input.jsx";
import SyntaxInput from './syntax-input';
import StatusInput from './status-input.jsx'
import LooksOneIcon from '@mui/icons-material/LooksOneOutlined';

import { getSlotIdAndKeywords } from "../data/slot-id.js";
import { isTaskUnique, isTaskMulti, isTaskRepeat } from "../data/task.js";
import ActivityInput from "./activity-input.jsx";


export default function TaskRow({task, selected, onTitleChange, onSlotExprChange, onOrderChange, onActivityChange, onStatusChange, button}) {

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

        //  console.log('task', task)

    return <tr className={myClassName}>
            <td><InputEdit key={task ? task.title : 'null'} defaultValue={task && task.title} saveHandler={onTitleChange} className="w-full" placeHolder="Titre"/></td>
            <td><ActivityInput task={task} saveHandler={(value) => onActivityChange(value)} isFilter={false}/></td>
            <td>                
                <SyntaxInput key={task && task.slotExpr} initialInputValue={task && task.slotExpr} classNameInput="bg-transparent" items={getSlotIdAndKeywords()}
                    onInputChange={onSlotExprChange} placeHolderInput={ task.id === undefined && "Créneau"}/>
            </td>
            <td><InputEdit key={task.order}    defaultValue={task && task.order} saveHandler={(event) => onOrderChange(event.target.value === '' ? null : Number(event.target.value))} className="w-10" placeHolder={ task.id === undefined && "Ordre"}/></td>
            <td><StatusInput key={task.status} task={task} saveHandler={onStatusChange}/></td>
            <td>{task && isTaskMulti(task)                        && <span className="font-bold">M</span>}
                {task && !isTaskMulti(task) && isTaskUnique(task) && <span className="font-bold">1</span>}
                {task && !isTaskMulti(task) && isTaskRepeat(task) && <span className="font-bold">R</span>}
                </td>
            <td>{button}</td>
        </tr>;
}