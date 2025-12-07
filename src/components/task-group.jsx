import React from 'react';
import Task from './task';
import { taskGroupActivity, taskGroupLevel } from '../data/task';
import { useGetActivitiesQuery } from '../features/apiSlice';

export default function TaskGroup({tasks, group, api}) {
    const { data:activities, isLoading, isSuccess } = useGetActivitiesQuery();

    if (group === "0") {
        return <>{tasks.map(task => <Task key={task.id} task={task} api={api}/>)}</>
    }

    function gettaskGroup() {
        if (group === "activity") {
            return taskGroupActivity(tasks);
        } else {
            return taskGroupLevel(tasks, group);
        }
    }   
    const groupLst = gettaskGroup();

    function getGroupLabel(key) {
        function getGroupLabelActivity(key) {
            return activities && activities.find(item => item.id.toString() === key)?.label || 'Aucune activité';
        }

        function getGroupLabelLevel(key) {
            return key === "undefined" ? "Sans créneau" : key;
        }
        if (group === "activity") {
            return getGroupLabelActivity(key);
        } else {
            return getGroupLabelLevel(key);
        }        
    }

    return Object.entries(groupLst).map(([key, value]) => <React.Fragment key={key}>
        <tr><td className='pt-2 pb-0.5 text-lg ' colSpan={10}>{getGroupLabel(key) }</td></tr>
        { value.map(task => <Task key={task.id} task={task} api={api}/>) }
    </React.Fragment>)    
}