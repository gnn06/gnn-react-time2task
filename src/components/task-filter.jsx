import { useDispatch } from "react-redux";
//import { useSelector } from "react-redux";

import { setTaskFilter } from "../features/taskSlice";
import { slotIdList } from "../data/slot-path";

import SyntaxInput from './syntax-input';
import DialogHelpExpression from "./button-help-expression";
import {FILTER_KEYWORDS} from '../data/filter-engine'

export default function TaskFilter() {
    
    const dispatch = useDispatch();
    //const currentTaskFilter = useSelector(state => state.currentTaskFilter);

    const onChange = (e) => {
        const filter = e;
        dispatch(setTaskFilter({filter}));
    }
    
    const filters = slotIdList.concat(FILTER_KEYWORDS);

    return <div className="flex flex-row space-x-1 items-baseline">
        <label htmlFor="task-filter">Filtre : </label>        
        <SyntaxInput items={filters}
            placeHolderInput={"lundi, next_week mardi, " + FILTER_KEYWORDS.join(', ')} onInputChange={onChange}/>
        <DialogHelpExpression/>
    </div>;
};