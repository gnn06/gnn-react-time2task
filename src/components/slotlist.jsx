import { useDispatch, useSelector } from "react-redux";
import { Button as ButtonMUI, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, Tooltip } from "@mui/material";

import ReactJsonView from '@microlink/react-json-view'
import { JsonEditor } from 'json-edit-react'

import { setSlotViewFilterConf, setSlotViewFilterConfLevel } from "../features/taskSlice";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";
import SlotView from "./slotview";
import Button from "./button";
import { useState } from "react";

export default function SlotList({tasks})  {
    const conf   = useSelector(state => state.tasks.slotViewFilterConf);
    const dispatch = useDispatch();
    const [confVisible, setConfVisible] = useState(false);

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

    return (
        <div className="m-1 ">
            <Grid container flexDirection="row" justifyContent="end" alignItems="start" gap="0.25em" minHeight={60}>
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
            <SlotView tasks={tasks} conf={conf} />
        </div>
        )
    }