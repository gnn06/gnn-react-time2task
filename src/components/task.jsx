import React from "react";
import './task.css'

export default function Task({task}) {
    return <div className="bg-green-200 border-2 border-gray-500 rounded p-1 my-1">{task.title}</div>;
}