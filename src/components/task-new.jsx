import { useState } from 'react';
import { useStore } from "react-redux";

import TaskRow from './task-row'
import Button from '../components/button';

export default function TaskNew ({api}) {

    const [ title,    setTitle  ] = useState('')
    const [ slotExpr, setExpr   ] = useState('')
    const [ order,    setOrder  ] = useState(null)
    const [ status,   setStatus ] = useState('A faire')
    const store = useStore();

    const handleSaveTask = () => {
        const user = store.getState().tasks.user;
        // console.log('save', 'task field : '/*, user !== undefined ? user.id : 'no user'*/, title, slotExpr, order, status)
        api({title, slotExpr, order, status, user: user.id})            
        setTitle('')
        setExpr('')
        setOrder(null)
        setStatus('A faire')
    };

    const task = { title, slotExpr, order, status }
      
    return <TaskRow task={task}
                    onTitleChange={(e) => setTitle(e.target.value)} 
                    onSlotExprChange={(e) => setExpr(e)}
                    onOrderChange={(e) => setOrder(e)}
                    onStatusChange={(e) => setStatus(e)}
                    button={<Button label="Save" clickToto={handleSaveTask} />}/>
    
}