import React from "react";

import './task.css'

export default function TaskLight({task}) {
    
    const myClassName = 'rounded p-1 my-1 '
        + 'hover:bg-green-100 bg-green-200 border-gray-500 border-2';

    return <div className={myClassName}>{task.title}</div>;
}