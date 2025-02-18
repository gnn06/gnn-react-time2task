import { useState } from 'react';
import { useStore } from "react-redux";

import TaskRow from './task-row'
import Button from '../components/button.jsx';
import CreateTask from './create-task';

export default function TaskNew ({api}) {

    const [ title,    setTitle    ] = useState('')
    const [ slotExpr, setExpr     ] = useState('')
    const [ order,    setOrder    ] = useState(null)
    const [ activity, setActivity ] = useState(null)
    const [ status,   setStatus   ] = useState('A faire')
    const store = useStore();

    const handleSaveTask = () => {
        const user = store.getState().tasks.user;
        // console.log('save', 'task field : '/*, user !== undefined ? user.id : 'no user'*/, title, slotExpr, order, status)
        api({title, activity, slotExpr, order, status, user: user.id})            
        setTitle('')
        setExpr('')
        setOrder(null)
        setActivity(null)
        setStatus('A faire')
    };

    const task = { title, slotExpr, order, activity, status }

    const myClassName = 'rounded p-1 my-1 '
        + (false ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');
      
    return <tr className={myClassName} >
        <td></td>
        <td colSpan="8" className='p-2'><CreateTask /></td>
    </tr>
    
}