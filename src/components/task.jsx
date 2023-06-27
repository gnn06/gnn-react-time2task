import React from "react";
import './task.css'

export default class Task extends React.Component {
    render() {
        return <div className="bg-green-200 border-2 border-gray-500 rounded p-1 my-1">{this.props.task.title}</div>;
    }
}