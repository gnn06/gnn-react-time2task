import { useState } from "react";
import { useDispatch } from "react-redux";

import { setTaskFilter, setActivity, setFilterIsMulti } from "../features/taskSlice";
import { SLOTIDS_LST } from "../data/slot-id";

import SyntaxInput from './syntax-input';
import DialogHelpExpression from "./button-help-expression";
import {FILTER_KEYWORDS, makeFilter} from '../data/filter-engine'
import ActivityInput from "./activity-input";
import { Checkbox, FormControlLabel } from "@mui/material";

export default function TaskFilter() {
    
    const dispatch = useDispatch();
    const [error, setError] = useState('')
    const [isMultiFilter, setIsMultiFilter] = useState(false)

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
    
    const filters = SLOTIDS_LST.concat(FILTER_KEYWORDS);

    const onActivityChange = (activity) => {
        dispatch(setActivity({activity}));
    }

    const onIsMultiFilter = () => {
        dispatch(setFilterIsMulti({filter: !isMultiFilter}))
        setIsMultiFilter(!isMultiFilter)
    }

    return <div className="m-1"> 
        <div className="flex items-baseline space-x-2">
            <label htmlFor="task-filter">Filtre&nbsp;:</label>        
            <div className="flex-grow">
                <SyntaxInput id="task-filter" items={filters}
                    placeHolderInput={"lundi, next_week mardi, " + FILTER_KEYWORDS.join(', ')} 
                    closeIcon={true}
                    onInputChange={onChange}/>
                { error && <div className="m-1 text-red-500">{error}</div>}
            </div>
            <DialogHelpExpression/>            
            <label>Activité&nbsp;:&nbsp;</label>
            <ActivityInput 
                task={null} saveHandler={(value) => onActivityChange(value)}
                 className="w-1/6" isFilter={true} />
            <FormControlLabel control={<Checkbox value={isMultiFilter} onChange={onIsMultiFilter}/>} label="is multi"  />
        </div>
    </div>;
};