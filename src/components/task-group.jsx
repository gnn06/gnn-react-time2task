import React from 'react';

import TaskRow from './task-row';
import { useGetActivitiesQuery } from "../features/apiSlice";

import { taskGroupActivity, taskGroupLevel } from '../data/task';

export default function TaskGroup({ tasks, group }) {
  const { data: activities } = useGetActivitiesQuery();

    if (group === "0") {
        return <>{tasks.map(task => <TaskRow key={task.id} task={task} />)}</>
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
        { value.map(task => <TaskRow key={task.id} task={task} />) }
    </React.Fragment>)    
}