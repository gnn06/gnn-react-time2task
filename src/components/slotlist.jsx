import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, MenuItem, Select, Tooltip } from "@mui/material";

import Slot from './slot';
import { setSlotViewFilterConf } from "../features/taskSlice";
import { slotViewFilter } from "../data/slot-view";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";

export default function SlotList({tasks})  {
    const conf   = useSelector(state => state.tasks.slotViewFilterConf);
    const dispatch = useDispatch();

    const slotRedux = slotViewFilter(conf)

    const onChange = (event) => {
        const level = event.target.value
        dispatch(setSlotViewFilterConf({level}));
    }

    return (
        <div className="m-1 ">
            <Grid container flexDirection="row" justifyContent="end" alignItems="start" gap="0.25em" minHeight={60}>
                <Tooltip title="Choisir le niveau le plus profond inclus dans la vue.">
                    <Select size="small" defaultValue={conf.levelMaxIncluded === null ? Object.keys(SLOTIDS_BY_LEVEL).length  : conf.levelMaxIncluded} onChange={onChange}>
                        <MenuItem value={1}>Month</MenuItem>
                        <MenuItem value={2}>Week</MenuItem>
                        <MenuItem value={3}>Day</MenuItem>
                        <MenuItem value={4}>Hour</MenuItem>
                    </Select>
                </Tooltip>
            </Grid>
            {slotRedux.map((slot, index) => {
                return <Slot key={slot.id} slot={slot} tasks={tasks} />
            })}
        </div>
        )
    }