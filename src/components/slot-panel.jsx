import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, MenuItem, Paper, Select, Stack, Tooltip } from "@mui/material";
import Typography from '@mui/material/Typography';
import TargetIcon from '@mui/icons-material/AdsClick';
import { JsonEditor } from 'json-edit-react'

import SlotView from "./slotview";
import { setFilterSlot, setSlotViewStrict, setSlotViewFilterConf, setSlotViewFilterConfLevel, setSlotViewFilterConfView, showRepeatAction } from "../features/taskSlice";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";
import SlotViewTree from "./slotviewtree";
import SlotViewList from "./slotviewlist";
import { useUpsertUserConfMutation } from "../features/apiSlice";

export default function SlotPanel({tasks})  {
    const dispatch = useDispatch();
    const [confVisible, setConfVisible] = useState(false);
    const conf   = useSelector(state => state.tasks.slotViewFilterConf);
    const filterPath = useSelector(state => state.tasks.currentFilter.slot);
    const slotStrict = useSelector(state => state.tasks.slotViewFilterConf.slotStrict);
    const showRepeat = useSelector(state => state.tasks.showRepeat);
    const user   = useSelector(state => state.tasks.user);
    const [upsert, { isLoading, error }] = useUpsertUserConfMutation()
    
    const onChangeLevelMax = (event) => {
        const level = event.target.value
        dispatch(setSlotViewFilterConfLevel({level}));
    }

    const onViewChange = async (event) => {
        const view = event.target.value
        dispatch(setSlotViewFilterConfView({view}));
        // persister côté backend si utilisateur connecté
        if (user && user.id) {
            try {
                await upsert({ userId: user.id, conf: 'view', value: view }).unwrap();
            } catch (e) {
                console.warn('Impossible de sauvegarder la conf utilisateur :', e);
            }
        }
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
    }

    const handleSlotStrict = () => {
        dispatch(setSlotViewStrict(!slotStrict))
    }

    return (<Stack sx={{padding:0, height: '100%'}}>
        <Paper sx={{padding:0.5, backgroundColor:'white', width: 'fit-content', ml:'auto', marginBottom: 0.75}}>
            <Stack direction="row" spacing={1}  >
                { filterPath && <IconButton onClick={onClearPathFilter}><TargetIcon /> <Typography > Filtré</Typography> </IconButton>}
                <FormControlLabel control={<Checkbox checked={slotStrict} onClick={handleSlotStrict}/>} label="Slot strict" disabled={!filterPath}/>
                <FormControlLabel control={<Checkbox checked={showRepeat} onClick={handleShowRepeat}/>} label="voir les répétitions" />
                <Button variant="outlined" size="small" onClick={onConf}>Change conf</Button>
                <Dialog open={confVisible} onClose={handleCloseConf}>
                    <DialogTitle id="alert-dialog-title">
                        Changement de l'affichage des créneaux
                    </DialogTitle>
                    <DialogContent>
                        <JsonEditor data={conf} setData={onConfChange} />
                    </DialogContent>
                    <DialogActions>
                        <Button label="OK" onClick={handleCloseConf} >OK</Button>
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
                <Select size="small" value={conf.view} onChange={onViewChange}>
                    <MenuItem value="tree">Tree</MenuItem>
                    <MenuItem value="list">List</MenuItem>
                </Select>
            </Stack>
        </Paper>    
        <SlotView className=" overflow-y-scroll " tasks={tasks} conf={conf} />
    </Stack>)
    }