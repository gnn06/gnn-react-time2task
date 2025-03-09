import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button as ButtonMUI, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, MenuItem, Select, Tooltip } from "@mui/material";
import Typography from '@mui/material/Typography';
import TargetIcon from '@mui/icons-material/AdsClick';
import { JsonEditor } from 'json-edit-react'

import SlotView from "./slotview";
import Button from "./button";
import { setFilterSlot, setFilterSlotStrict, setSlotViewFilterConf, setSlotViewFilterConfLevel, showRepeatAction } from "../features/taskSlice";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";

export default function SlotPanel({tasks})  {
    const dispatch = useDispatch();
    const [confVisible, setConfVisible] = useState(false);
    const conf   = useSelector(state => state.tasks.slotViewFilterConf);
    const filterPath = useSelector(state => state.tasks.currentFilter.slot);
    const slotStrict = useSelector(state => state.tasks.currentFilter.slotStrict);
    const showRepeat = useSelector(state => state.tasks.showRepeat);
    
    const onChangeLevelMax = (event) => {
        const level = event.target.value
        dispatch(setSlotViewFilterConfLevel({level}));
    }

    const onConf = () => {
        setConfVisible(true)
    }

    const onConfChange = (obj) => {
        // console.log(obj)
        dispatch(setSlotViewFilterConf({conf: obj}));
    }

    const handleCloseConf = () => {
        setConfVisible(false);
    };

    const onClearPathFilter = () => {
        dispatch(setFilterSlot(""));
    }

    const handleShowRepeat = () => {
        dispatch(showRepeatAction(!showRepeat))
    }

    const handleSlotStrict = () => {
        dispatch(setFilterSlotStrict(!slotStrict))
    }

    return (
        <div className="m-0 pl-1 pb-1 flex flex-col h-full">
            <Grid className="p-1" container flexDirection="row" justifyContent="flex-end" alignItems={"flex-start"} gap="0.25em" >
                { filterPath && <IconButton onClick={onClearPathFilter}><TargetIcon /> <Typography > Filtré</Typography> </IconButton>}
                <FormControlLabel control={<Checkbox checked={slotStrict} onClick={handleSlotStrict}/>} label="créneau strict" disabled={!filterPath}/>
                <FormControlLabel control={<Checkbox checked={showRepeat} onClick={handleShowRepeat}/>} label="voir les répétitions" />
                <Button label="Change conf" clickToto={onConf}/>
                <Dialog open={confVisible} onClose={handleCloseConf}>
                    <DialogTitle id="alert-dialog-title">
                        Changement de l'affichage des créneaux
                    </DialogTitle>
                    <DialogContent>
                        <JsonEditor data={conf} setData={onConfChange} />
                    </DialogContent>
                    <DialogActions>
                        <ButtonMUI label="OK" onClick={handleCloseConf} >OK</ButtonMUI>
                    </DialogActions>
                </Dialog>
                <Tooltip title="Choisir le niveau le plus profond inclus dans la vue."  placement="top">
                    <Select size="small" value={conf.levelMaxIncluded === null ? Object.keys(SLOTIDS_BY_LEVEL).length  : conf.levelMaxIncluded} onChange={onChangeLevelMax}>
                        <MenuItem value={1}>Month</MenuItem>
                        <MenuItem value={2}>Week</MenuItem>
                        <MenuItem value={3}>Day</MenuItem>
                        <MenuItem value={4}>Hour</MenuItem>
                    </Select>
                </Tooltip>
            </Grid>
            <SlotView className=" overflow-y-scroll " tasks={tasks} conf={conf} />
        </div>
        )
    }