import React from "react"

import TaskGroup from "./task-group";
import TaskNew from './task-row-new';
import { Box } from "@mui/material";

export default function TaskList({tasks, group, className = ''}) {

    if (tasks.length === 0) {
        return <Box   display="flex" minHeight="80vh" justifyContent="center"
        alignItems="center">Créer des tâches puis choisissez les crénaux auxquels vous souhaitez les réaliser.</Box>
    }

    const headStyle = {border:'1px dashed rgb(156 163 175 / 1)', backgroundColor:'rgb(243 244 246 / 1)', fontWeight:400};

    return <React.Fragment>
        <table className={"w-full bg-white border-collapse" + className} style={{border:'1px dashed rgb(156 163 175 / 1)'}}>
            <thead>
            <tr>
                <th style={headStyle}></th>
                <th style={headStyle}>Titre</th>
                <th style={headStyle}></th>
                <th style={headStyle}>Prochaine action</th>
                <th style={headStyle}></th>
                <th style={headStyle}>Activité</th>
                <th style={headStyle}>Statut</th>
                <th style={headStyle}></th>
                <th style={headStyle}></th>
                <th style={headStyle}></th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
                <TaskGroup tasks={tasks} group={group} />
                <TaskNew />
            </tbody>
        </table>
        { `${tasks.length} tâche(s)` }
    </React.Fragment>
}