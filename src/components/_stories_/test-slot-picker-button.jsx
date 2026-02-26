import { useState } from "react";
import SlotPickerButton from "../slot-picker-button";

function TestSlotPickerButton() {
    const [currentSlotExpr, setCurrentSlotExpr] = useState("this_month this_week mercredi");

    const onSlotChange = (slotExpr) => {
        console.log("Slot sélectionné:", slotExpr);
        setCurrentSlotExpr(slotExpr);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test SlotPickerButton</h1>
            <div style={{ marginBottom: '20px' }}>
                <p>Slot actuel: <strong>{currentSlotExpr}</strong></p>
            </div>
            
            <SlotPickerButton 
                selectedSlotExpr={currentSlotExpr}
                onSlotChange={onSlotChange}
            />
        </div>
    );
}

export default TestSlotPickerButton;
