import React from "react";

import { Checkbox, FormControlLabel, FormGroup, IconButton, TextField } from "@mui/material";

import './slot.css';

import SlotTitle from "./slot-title";
import ShiftNextIcon from '@mui/icons-material/ArrowForward';
import ShiftPreviousIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Loop';
import DisableIcon from '@mui/icons-material/Block';

import { getSlotIdLevel } from "../data/slot-id";
import { isInsideSelected } from "../data/selection-tree";

function showRepeat(id) {
    return getSlotIdLevel(id) <= 2
}

export default function SlotSelect({slot, selection, handleSelection, handleShift, handleDelete, handleAdd, handleRepetition, handleDisable}) {
    const { id, title, path, start, end } = slot;
    const selected = selection.get(path) && selection.get(path).selected || false
    const repetition   = selection.get(path) && selection.get(path).repetition || null
    const disable  = selection.get(path) && selection.get(path).disable || false
    const isInside = isInsideSelected(path, selection)

    let slotStyle = "border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 ";
    if (selected) {
        slotStyle += "bg-blue-400 ";
    } else if (isInside) {
        const level = getSlotIdLevel(id)
        if (level > -1) {
            slotStyle += [ "bg-blue-100",
                           "bg-blue-200",
                           "bg-blue-300"
                        ][level-1] + " "
         }
    } else {
        slotStyle += " ";
    }
    // if (selected) {
    //     slotStyle += "hover:bg-gray-300 ";
    // } else {
    //     slotStyle += "hover:bg-blue-100 ";
    // }

    const onSlotClick = (e) => {
        const newSelection = { selected: !selected, repetition: repetition, disable: disable }
        handleSelection && handleSelection(path, newSelection)
    }

    const onDisableChange = (e) => {
        const newSelection = { selected: selected, repetition: repetition, disable: !disable }
        handleSelection && handleSelection(path, newSelection)
    }

    const onRepeatChange = (e) => {
        const repeatvalue = e.target.value !== '' ? Number.parseInt(e.target.value) : 0
        const newSelection = { selected: selected, repetition: repeatvalue, disable: disable }
        handleSelection && handleSelection(path, newSelection)
    }

    return <React.Fragment>
        <div className={slotStyle + " group"} >
            <div className="flex flex-row">
                <SlotTitle slot={slot} />
                <div>                    
                    {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                </div>            
            </div>
            <FormGroup>
                { showRepeat(id) && repetition && <TextField label="Répétition" type="number" variant="standard" value={repetition} onChange={onRepeatChange}/> }
                { disable && <FormControlLabel control={<Checkbox checked={disable} onChange={onDisableChange} />} label="Disable"  />}
            </FormGroup>
            <div className="invisible group-hover:visible">
                <IconButton onClick={(e) => handleShift(path, -1)}><ShiftPreviousIcon /></IconButton>
                <IconButton onClick={(e) => handleShift(path, 1)} ><ShiftNextIcon     /></IconButton>
                <IconButton onClick={(e) => handleAdd(path)}      ><AddIcon           /></IconButton>
                <IconButton onClick={(e) => handleDelete(path)}   ><DeleteIcon        /></IconButton>
                { showRepeat(id) && <IconButton onClick={(e) => handleRepetition(path)}><RepeatIcon /></IconButton>}
                <IconButton onClick={(e) => handleDisable(path)}   ><DisableIcon       /></IconButton>                    
            </div>
            <div className="h-3"/>
        </div>
    </React.Fragment>
}