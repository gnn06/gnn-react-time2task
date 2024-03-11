import { useState } from "react";
import { useDispatch } from "react-redux";

import { setTaskFilter } from "../features/taskSlice";
import { slotIdList } from "../data/slot-path";

import SyntaxInput from './syntax-input';
import DialogHelpExpression from "./button-help-expression";
import {FILTER_KEYWORDS, makeFilter} from '../data/filter-engine'

export default function TaskFilter() {
    
    const dispatch = useDispatch();
    const [error, setError] = useState('')

    const onChange = (e) => {
        const filter = e;
        const {func, error} = makeFilter(filter)
        if (error) {
            setError(error)
        } else {
            dispatch(setTaskFilter({filter}));
            setError('')
        }
    }
    
    const filters = slotIdList.concat(FILTER_KEYWORDS);

    return <div className="w-full"> 
        <div className="w-full flex flex-row space-x-1 items-baseline">
            <label htmlFor="task-filter">Filtre&nbsp;:</label>        
                <div className="w-full">
                    <SyntaxInput id="task-filter" items={filters}
                        placeHolderInput={"lundi, next_week mardi, " + FILTER_KEYWORDS.join(', ')} 
                        closeIcon={true}
                        onInputChange={onChange}/>
                    { error && <div className="m-1 text-red-500">{error}</div>}
                </div>
            <DialogHelpExpression/>            
        </div>
    </div>;
};