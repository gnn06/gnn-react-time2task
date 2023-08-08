import React from "react";
import { useDispatch } from "react-redux";

import { setTaskFilter } from "../features/taskSlice";

export default function TaskFilter() {
    
    const taskFilters= [
        { label: 'aucun filtre',  value: 'no-filter' },
        { label: 'semaine',  value: 'week' },
        { label: 'lundi',    value: 'lundi' },
        { label: 'mardi',    value: 'mardi' },
        { label: 'mercredi', value: 'mercredi' },
        { label: 'jeudi', value: 'jeudi' },
        { label: 'vendredi', value: 'vendredi' },
        { label: 'jour',     value: 'slot1' },
        { label: 'matin',    value: 'slot2' },
        { label: 'aprem',    value: 'slot3' }
    ];
    const dispatch = useDispatch();

    const onChange = (e) => {
        const filter = e.target.value;
        dispatch(setTaskFilter({filter}));
    }
    
    return <div>
        <label htmlFor="task-filter">Filtre : </label>
        <select className="p-2 rounded bg-gray-400 hover:bg-gray-300 " id="task-filter" name="task-filter" onChange={onChange}>
            { taskFilters.map(item => (
                <option key={item.value} value={item.value} label={item.label}/>
            ))}
        </select>
    </div>;
};