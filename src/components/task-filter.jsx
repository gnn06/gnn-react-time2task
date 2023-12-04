import React from "react";
import { useDispatch } from "react-redux";
//import { useSelector } from "react-redux";

import { setTaskFilter } from "../features/taskSlice";
import SyntaxInput from './syntax-input';

export default function TaskFilter() {
    
    const dispatch = useDispatch();
    //const currentTaskFilter = useSelector(state => state.currentTaskFilter);

    const onChange = (e) => {
        const filter = e.target.value;
        dispatch(setTaskFilter({filter}));
    }

    const onKeyDown = (e) => {
        if (e.keyCode === 13) {
            onChange(e)
        }
    }
    
    return <div>
        <label htmlFor="task-filter">Filtre : </label>
        <input type="text" 
            placeholder="expression"
            className="m-1 p-1"
            onBlur={onChange}
            onKeyDown={onKeyDown}/> 'no-filter'
        <SyntaxInput items={['this_month', 'this_week', 'next_week', 'following_week', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'matin', 'aprem']}/>
    </div>;
};