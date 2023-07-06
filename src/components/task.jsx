import React from "react";
import { useState } from "react";
import './task.css'

export default function Task({task}) {
    
    const [selected, setSelected] = useState(false);

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'hover:bg-gray-300  bg-gray-400  border-gray-500 border-2'
         : 'hover:bg-green-100 bg-green-200 border-gray-500 border-2');

    const onTaskClick = e => setSelected(!selected);


    return <div 
        className={myClassName}
        onClick={onTaskClick}>{task.title}</div>;
}