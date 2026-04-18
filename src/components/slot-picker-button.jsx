import { useState, useRef } from "react";
import { Button, Popper, Paper, ClickAwayListener, Chip } from "@mui/material";
import { FilterList, Clear, KeyboardArrowDown } from "@mui/icons-material";

import SlotPicker from "./slot-picker";

export default function SlotPickerButton({ selectedSlotExpr, onSlotChange }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);

    const handleClick = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClearSelection = (e) => {
        e.stopPropagation();
        onSlotChange && onSlotChange(null);
    };

    const handleSlotChange = (slotExpr) => {
        onSlotChange && onSlotChange(slotExpr);
    };

    return (
        <>
            <Button
                ref={anchorRef}
                aria-label="filtre-créneau"
                variant="outlined"
                startIcon={<FilterList />}
                endIcon={ selectedSlotExpr ? <Clear onClick={handleClearSelection}/> : <KeyboardArrowDown /> }
                onClick={handleClick}
            >
                {!selectedSlotExpr && "Créneau"}
                {selectedSlotExpr && (
                    <Chip 
                        label={selectedSlotExpr.split(' ').slice(-2).join(' ')} 
                        size="small" 
                        color="secondary"
                        sx={{ ml: 1, height: '20px' }}
                    />
                )}
            </Button>
            
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                style={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={handleClose}>
                    <Paper elevation={8} style={{ padding: '6px', overflow: 'auto' }} data-testid="slot-picker-popper">
                        <SlotPicker 
                            selectedSlotExpr={selectedSlotExpr} 
                            onSlotChange={handleSlotChange}
                        />
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </>
    );
}
