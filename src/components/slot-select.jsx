import React from "react";
import { Checkbox, FormControlLabel, FormGroup, IconButton, TextField } from "@mui/material";

import './slot.css';

import SlotTitle from "./slot-title";
import ShiftNextIcon from '@mui/icons-material/ArrowForward';
import ShiftPreviousIcon from '@mui/icons-material/ArrowBack';
import RepeatIcon from '@mui/icons-material/Loop';
import DisableIcon from '@mui/icons-material/Block';

import PushPinIcon from '@mui/icons-material/PushPin';
import { getSlotIdLevel, isComplement } from "../data/slot-id";
import { isInsideSelected } from "../data/selection-tree";
import { IDizer } from "../utils/stringUtil";

function showRepeat(id) {
    return getSlotIdLevel(id) <= 2
}

// Vrai si `path` est le parent DIRECT (un seul niveau au-dessus) d'une sélection
// dont la feuille est un complément relatif (mercredi, matin…). Sert à n'éclaircir
// que le niveau juste au-dessus d'une sélection relative, pas toute la remontée ni
// les ancres seules (this_week, today).
function isDirectParentOfRelativeSelection(path, selection) {
    const pathIds = IDizer(path)
    return Array.from(selection.keys()).some(key => {
        const ids = IDizer(key)
        if (ids.length !== pathIds.length + 1) return false
        if (!pathIds.every((p, i) => ids[i] === p)) return false
        return isComplement(ids[ids.length - 1])
    })
}

/**
 * Affiche un Slot Unitaire avec ses boutons de shift, repetition et disable.
 * @param {*} param0 
 * @returns 
 */
export default function SlotSelect({slot, selection, handleSelection, handleShift, handleClick, handleRepetition, handleDisable}) {
    const { id, title, path, start, end } = slot;
    const selected = selection.get(path) && selection.get(path).selected || false
    const repetition   = selection.get(path) && selection.get(path).repetition || null
    const disable  = selection.get(path) && selection.get(path).disable || false
    const isInside = isInsideSelected(path, selection)

    let slotStyle = "rounded p-1 m-0 mt-1 mr-1 ";
    if (disable) {
        // créneau désactivé temporairement : grisé et atténué, prioritaire sur
        // l'état sélectionné (le gris foncé est réservé à cet état)
        slotStyle += "bg-gray-300 opacity-60 hover:opacity-80 ";
    } else if (selected) {
        // accent : le slot actif est le plus saturé
        slotStyle += "bg-blue-400 hover:bg-blue-300 ";
    } else if (isDirectParentOfRelativeSelection(path, selection)) {
        // teinte bleue légère sur le seul niveau juste au-dessus d'une sélection
        // relative (this_week pour mercredi, mercredi pour matin) : on tend vers
        // la sélection ; pas de teinte pour une ancre seule
        slotStyle += "bg-blue-100 hover:bg-blue-50 ";
    } else {
        // non sélectionné / cliquable : neutre
        slotStyle += "bg-gray-100 hover:bg-gray-50 ";
    }

    const onSlotClick = (e) => {
        handleClick(path)
    }

    const onDisableChange = (e) => {
        const newSelection = { selected: selected, repetition: repetition, disable: !disable }
        handleSelection && handleSelection(path, newSelection)
    }

    const onRepeatChange = (e) => {
        const repeatvalue = e.target.value !== '' ? Number.parseInt(e.target.value) : 0
        const newSelection = { selected: selected, repetition: repeatvalue, disable: disable }
        handleSelection && handleSelection(path, newSelection);
        
    }

    return <React.Fragment>
        <div className={slotStyle + " cursor-pointer min-w-[8.5em] min-h-[5.5em] group"} data-slot-path={path} onClick={onSlotClick} >
            <div className="flex flex-row">
                <SlotTitle slot={slot} />
                { isComplement(id) && getSlotIdLevel(id) === 3 && <PushPinIcon sx={{ fontSize: 14, opacity: 0.5 }} /> }
                <div>
                    {start != null && end != null && <div className="time text-xs">{start} - {end}</div>}
                </div>
            </div>
            <FormGroup>
                { showRepeat(id) && repetition && 
                    <div className="flex flex-row gap-5 items-center ">
                        <TextField  label="Répétition" type="number" variant="standard" value={repetition} onClick={(e) => e.stopPropagation()} onChange={onRepeatChange}/>
                        <RepeatIcon className="cursor-default"  onClick={(e) => e.stopPropagation()} aria-label="repeat" />
                    </div>
                }
                { disable && <FormControlLabel control={<Checkbox checked={disable} onChange={onDisableChange} />} onClick={(e) => e.stopPropagation()} label="Disable"  />}
            </FormGroup>
            <div className="invisible group-hover:visible">
                { isInside && <IconButton onClick={(e) => {handleShift(path, -1);e.stopPropagation()}} ><ShiftPreviousIcon /></IconButton>}
                { isInside && <IconButton onClick={(e) => {handleShift(path, 1);e.stopPropagation()}}  ><ShiftNextIcon     /></IconButton>}
                { showRepeat(id) && <IconButton onClick={(e) => {handleRepetition(path);e.stopPropagation()}}  ><RepeatIcon /></IconButton>}
                { isInside && <IconButton onClick={(e) => {handleDisable(path);e.stopPropagation()}}   ><DisableIcon       /></IconButton>}                    
            </div>
            <div className="h-3"/>
        </div>
    </React.Fragment>
}