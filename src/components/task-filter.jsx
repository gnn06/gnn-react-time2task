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
        const filter = e;
        dispatch(setTaskFilter({filter}));
    }
    
    const filters = slotIdList.concat(['no-filter']);
    
    return <div className="flex flex-row space-x-1 items-baseline">
        <label htmlFor="task-filter">Filtre : </label>        
        <SyntaxInput items={filters}
            placeHolderInput="exmemple : lundi, next_week mardi, OR possible" onInputChange={onChange}/>
    </div>;
};