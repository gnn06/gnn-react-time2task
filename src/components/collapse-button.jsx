import { useDispatch } from 'react-redux';

import { IconButton, Tooltip } from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { confBranch } from "../features/taskSlice";
import { getSlotIdLevel } from '../data/slot-id';

export default function CollapseButton({slot}) {

    const dispatch = useDispatch(); 
    const level = getSlotIdLevel(slot.id)

    const onCollapse = (path) => {
        dispatch(confBranch({path, mode: "collapse"}))
    }

    if (level >= 4) return

    const Icon = (slot.inner.length > 0 ? <Tooltip title="collapse"><ExpandLessIcon /></Tooltip> : <Tooltip title="expand"><ExpandMoreIcon /></Tooltip>)

    return <IconButton size="small" onClick={(e) => onCollapse(slot.path)}>{Icon}</IconButton>
}