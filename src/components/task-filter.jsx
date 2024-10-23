import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setTaskFilter, setActivity, setFilterIsMulti, setFilterIsDisable, setFilterIsStatusARepo } from "../features/taskSlice";
import { SLOTIDS_LST } from "../data/slot-id";

import SyntaxInput from './syntax-input';
import DialogHelpExpression from "./button-help-expression";
import {FILTER_KEYWORDS, makeFilterExpr} from '../data/filter-engine'
import ActivityInput from "./activity-input";
import { Checkbox, FormControlLabel } from "@mui/material";

export default function TaskFilter() {
    
    const currentFilter = useSelector(state => state.tasks.currentFilter.expression);
    const [error, setError] = useState('')
    const [isMultiFilter, setIsMultiFilter] = useState(false)
    const [isDisableFilter, setIsDisableFilter] = useState(false)
    const [isStatusARepo, setIsStatusARepo] = useState(false)
    const dispatch = useDispatch();    

    const onChange = (e) => {
        const filter = e;
        const {func, error} = makeFilterExpr(filter)
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

    const onIsDisableFilter = () => {
        dispatch(setFilterIsDisable({filter: !isDisableFilter}))
        setIsDisableFilter(!isDisableFilter)
    }

    const onStatusARepoFilter = () => {
        dispatch(setFilterIsStatusARepo({filter: !isStatusARepo}))
        setIsStatusARepo(!isStatusARepo)
    }

    return <div className="m-1"> 
        <div className="flex items-baseline space-x-2">
            <label htmlFor="task-filter">Filtre&nbsp;:</label>        
            <div className="flex-grow">
                <SyntaxInput id="task-filter" items={filters}
                    placeHolderInput={"lundi, next_week mardi, " + FILTER_KEYWORDS.join(', ')} 
                    closeIcon={true}
                    onInputChange={onChange} initialInputValue={currentFilter}/>
                { error && <div className="m-1 text-red-500">{error}</div>}
            </div>
            <DialogHelpExpression/>            
            <label>Activité&nbsp;:&nbsp;</label>
            <ActivityInput 
                task={null} saveHandler={(value) => onActivityChange(value)}
                 className="w-1/6" isFilter={true} />
            <FormControlLabel control={<Checkbox value={isMultiFilter} onChange={onIsMultiFilter}/>} label="is multi"  />
            <FormControlLabel control={<Checkbox value={isDisableFilter} onChange={onIsDisableFilter}/>} label="is disable"  />
            <FormControlLabel control={<Checkbox value={isStatusARepo} onChange={onStatusARepoFilter}/>} label="is à repo"  />
        </div>
    </div>;
};