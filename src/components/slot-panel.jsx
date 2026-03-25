import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, FormControlLabel, IconButton, MenuItem, Paper, Select, Stack, Tooltip } from "@mui/material";
import Typography from '@mui/material/Typography';
import TargetIcon from '@mui/icons-material/AdsClick';

import SlotView from "./slotview";
import { setFilterSlot, setSlotViewStrict, setSlotViewFilterConf, setSlotViewFilterConfLevel, showRepeatAction, setSlotViewFilterConfView } from "../features/taskSlice";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";
import { useUpsertUserConfMutation } from "../features/apiSlice";
import { saveUserConfThunk } from "../features/userConfThunk";

export default function SlotPanel({tasks})  {
    const dispatch = useDispatch();
    const [confVisible, setConfVisible] = useState(false);
    const conf   = useSelector(state => state.tasks.slotViewFilterConf);
    const filterPath = useSelector(state => state.tasks.currentFilter.slot);
    const slotStrict = useSelector(state => state.tasks.slotViewFilterConf.slotStrict);
    const showRepeat = useSelector(state => state.tasks.slotViewFilterConf.showRepeat);
    const user   = useSelector(state => state.tasks.user);
    const [upsert, { isLoading, error }] = useUpsertUserConfMutation()
    
    const onChangeLevelMax = (event) => {
        const level = event.target.value
        dispatch(setSlotViewFilterConfLevel({level}));
        dispatch(saveUserConfThunk());
    }

    const onViewChange = async (event) => {
        const view = event.target.value
        dispatch(setSlotViewFilterConfView({view}));
        dispatch(saveUserConfThunk());
    }

    const onConf = () => {
        setConfVisible(true)
    }
    
    const onConfChange = (obj) => {
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
        dispatch(saveUserConfThunk());
    }

    const handleSlotStrict = () => {
        dispatch(setSlotViewStrict(!slotStrict))
        dispatch(saveUserConfThunk());
    }

    return (<Stack sx={{padding:0, height: '100%'}}>
        <Paper sx={{padding:0.5, backgroundColor:'white', width: 'fit-content', ml:'auto', marginBottom: 0.75}}>
            <Stack direction="row" spacing={1}  >
                { filterPath && <IconButton onClick={onClearPathFilter}><TargetIcon /> <Typography > Filtré</Typography> </IconButton>}
                <FormControlLabel control={<Checkbox checked={slotStrict} onClick={handleSlotStrict}/>} label="Slot strict" disabled={!filterPath}/>
                <FormControlLabel control={<Checkbox checked={showRepeat} onClick={handleShowRepeat}/>} label="voir les répétitions" />
                <Tooltip title="Choisir le niveau le plus profond inclus dans la vue."  placement="top">
                    <Select size="small" value={conf.levelMaxIncluded === null ? Object.keys(SLOTIDS_BY_LEVEL).length  : conf.levelMaxIncluded} onChange={onChangeLevelMax}>
                        <MenuItem value={1}>Month</MenuItem>
                        <MenuItem value={2}>Week</MenuItem>
                        <MenuItem value={3}>Day</MenuItem>
                        <MenuItem value={4}>Hour</MenuItem>
                    </Select>
                </Tooltip>
                <Select size="small" value={conf.view} onChange={onViewChange} SelectDisplayProps={{ "aria-label":"slot-view-select"}}  >
                    <MenuItem value="tree" >Tree</MenuItem>
                    <MenuItem value="list" >List</MenuItem>
                </Select>
            </Stack>
        </Paper>    
        <SlotView className=" overflow-y-scroll " tasks={tasks} conf={conf} />
    </Stack>)
    }