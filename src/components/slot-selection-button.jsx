import React, { useState } from "react"
import { useSelector } from "react-redux";
import EditIcon from '@mui/icons-material/Edit';
import { Button, IconButton } from "@mui/material";

import SlotSelectDialog from "./slot-select-dialog";

export default function SlotSelectionButton({task, style, withText = false, handleSave}) {

    const [ showSlotSelect, setShowSlotSelect ] = useState(false)
    const conf = useSelector(state => state.tasks.slotViewFilterConf);

    const onSlotSelect = () => {
        setShowSlotSelect(true)
    }

    const onSlotSelectCancel = () => {
        setShowSlotSelect(false)
    }

    const onSlotSelectConfirm = (e) => {
        const slotExpr = e;
        handleSave(slotExpr)
        setShowSlotSelect(false)
    }

    return <React.Fragment>
        { withText ? <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={onSlotSelect}>Choix créneau</Button> 
        : <IconButton style={style} onClick={onSlotSelect}><EditIcon /></IconButton>}
        
        { showSlotSelect && <SlotSelectDialog selectionExpr={task.slotExpr} title={task.title} conf={conf} onConfirm={onSlotSelectConfirm} onCancel={onSlotSelectCancel}/>}
    </React.Fragment>
}

