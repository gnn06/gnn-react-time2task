import React from "react";
import { useState } from "react";
import './task.css'

export default function Task({task}) {
    
    const [selected, setSelected] = useState(false);

    const myClassName = 'rounded p-1 my-1 '
        + (selected ? 
           'bg-gray-400  border-gray-700    border-2'
         : 'bg-green-200 border-gray-500 border-2 ');
    

    return <div 
        className={myClassName}>{task.title}</div>;
}