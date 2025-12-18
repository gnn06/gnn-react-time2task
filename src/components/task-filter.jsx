import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHotkeys } from 'react-hotkeys-hook'
import { Checkbox, FormControlLabel } from "@mui/material";

import { setTaskFilter, setActivity, setFilterIsMulti, setFilterIsDisable, setFilterIsStatusARepo } from "../features/taskSlice";
import { SLOTIDS_LST } from "../data/slot-id";

import SyntaxInput from './syntax-input';
import DialogHelpExpression from "./button-help-expression";
import {FILTER_KEYWORDS, makeFilterExpr} from '../data/filter-engine'
import ActivityInput from "./activity-input";

export default function TaskFilter() {
    
    const dispatch = useDispatch();
    const [error, setError] = useState('')
    const [isMultiFilter, setIsMultiFilter] = useState(false)
    const [isDisableFilter, setIsDisableFilter] = useState(false)
    const [isStatusARepo, setIsStatusARepo] = useState(false)
    const filterExpr = useSelector(state => state.tasks.currentFilter.expression);
    const activity = useSelector(state => state.tasks.currentActivity);

    const filterRef = useRef(null);

    const onInputChange = (e) => {
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

    const onCtrlK = () => {
        filterRef.current.focus();
    }
    useHotkeys('ctrl+k', onCtrlK, { preventDefault: true, enableOnFormTags: true })

    return <div className="m-1"> 
        <div className="flex items-baseline space-x-2">
            <label htmlFor="task-filter">Filtre&nbsp;:</label>        
            <div className="flex-grow">
                <SyntaxInput id="task-filter" inputRef={filterRef} items={filters}
                    placeHolderInput={"CTRL-K | lundi, next_week mardi, " + FILTER_KEYWORDS.join(', ')} 
                    closeIcon={true}
                    onInputChange={onInputChange} initialInputValue={filterExpr}/>
                { error && <div className="m-1 text-red-500">{error}</div>}
            </div>
            <DialogHelpExpression/>            
            <label>Activité&nbsp;:&nbsp;</label>
            <ActivityInput 
                activity={activity} saveHandler={(value) => onActivityChange(value)}
                 className="w-1/6" isFilter={true} />
            <FormControlLabel control={<Checkbox value={isMultiFilter} onChange={onIsMultiFilter}/>} label="is multi"  />
            <FormControlLabel control={<Checkbox value={isDisableFilter} onChange={onIsDisableFilter}/>} label="is disable"  />
            <FormControlLabel control={<Checkbox value={isStatusARepo} onChange={onStatusARepoFilter}/>} label="is à repo"  />
        </div>
    </div>;
};