import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, MenuItem, Paper, Select, Stack, Tooltip } from "@mui/material";
import Typography from '@mui/material/Typography';
import TargetIcon from '@mui/icons-material/AdsClick';

import SlotView from "./slotview";
import { setFilterSlot, setSlotViewFilterConf, setSlotViewFilterConfLevel, setSlotViewFilterConfView } from "../features/taskSlice";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";
import { saveUserConfThunk } from "../features/userConfThunk";

export default function SlotPanel({tasks})  {
    const dispatch = useDispatch();
    const [confVisible, setConfVisible] = useState(false);
    const conf   = useSelector(state => state.tasks.slotViewFilterConf);
    const filterPaths = useSelector(state => state.tasks.currentFilter.slots);
    const user   = useSelector(state => state.tasks.user);
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

    return (<Stack sx={{padding:0, height: '100%'}}>
        <Paper sx={{padding:0.5, backgroundColor:'white', width: 'fit-content', ml:'auto', marginBottom: 0.75}}>
            <Stack direction="row" spacing={1}  >
                { filterPaths?.length > 0 && <IconButton onClick={onClearPathFilter}><TargetIcon /> <Typography > Filtré</Typography> </IconButton>}
                <Tooltip title="Choisir le niveau le plus profond inclus dans la vue."  placement="top">
                    <Select size="small" value={conf.levelMaxIncluded === null ? Object.keys(SLOTIDS_BY_LEVEL).length  : conf.levelMaxIncluded} onChange={onChangeLevelMax} SelectDisplayProps={{ "aria-label":"slot-level-max-select"}}>
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