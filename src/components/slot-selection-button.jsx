import React, { useState } from "react"
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from "@mui/material";

import SlotViewSelect from "./slot-view-select";

const conf = {
    collapse: [
      "this_month next_week",
      "this_month following_week",
      "next_month"
    ],
    remove: [],
    levelMin: null,
    levelMaxIncluded: null
}

export default function SlotSelectionButton({task, handleSave}) {

    const [ showSlotSelect, setShowSlotSelect ] = useState(false)

    const onSlotSelect = () => {
        setShowSlotSelect(true)
    }

    const onSlotSelectCancel = () => {
        setShowSlotSelect(false)
    }

    const onSlotSelectConfirm = (e) => {
        const slotExpr = e;
        handleSave(slotExpr)
    }

    return <React.Fragment>
        <IconButton onClick={onSlotSelect}><EditIcon /></IconButton>
        { showSlotSelect && <SlotViewSelect selectionExpr={task.slotExpr} title={task.title} conf={conf} onConfirm={onSlotSelectConfirm} onCancel={onSlotSelectCancel}/>}
    </React.Fragment>
}

