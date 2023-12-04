import React from "react";
import { useDispatch } from "react-redux";
//import { useSelector } from "react-redux";

import { setTaskFilter } from "../features/taskSlice";
import { slotIdList } from "../services/slot";

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
    
    const filters = slotIdList.concat(['no-filter']);
    
    return <div className="flex flex-row space-x-1 items-baseline">
        <label htmlFor="task-filter">Filtre : </label>        
        <SyntaxInput items={filters}
            placeHolderInput="expression" onBlurInput={onChange}/>
    </div>;
};