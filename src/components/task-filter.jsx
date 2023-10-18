import React from "react";
import { useDispatch } from "react-redux";

import { setTaskFilter } from "../features/taskSlice";

export default function TaskFilter() {
    
    const dispatch = useDispatch();

    const onChange = (e) => {
        const filter = e.target.value;
        dispatch(setTaskFilter({filter}));
    }
    
    return <div>
        <label htmlFor="task-filter">Filtre : </label>
        <input type="text" 
            placeholder="expression"
            className="m-1 p-1"
            onBlur={onChange}/> 'no-filter'
    </div>;
};