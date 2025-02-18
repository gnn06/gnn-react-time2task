import React from 'react';
import Task from './task';
import { taskGroup } from '../data/task';

export default function TaskList({tasks, group, api}) {
    const groupLst = taskGroup(tasks, group)
    return Object.entries(groupLst).map(([key, value]) => <React.Fragment key={key}>
        { group !== "0" && <tr><td className='pt-2 pb-0.5 text-lg ' colSpan={10}>{key}</td></tr>}
        { value.map(task => <Task key={task.id} task={task} api={api}/>) }
    </React.Fragment>)    
}