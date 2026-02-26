import { useState } from "react";
import SlotPicker from "../slot-picker";

import { DEFAULT_CONF, slotViewFilter } from "../../data/slot-view";

function TestSlotPicker() {

  const [ currentSlotExpr, setCurrentSlotExpr ] = useState("this_month this_week mercredi")

  const onSlotChange = (slotExpr) => {
    console.log(slotExpr);
    setCurrentSlotExpr(slotExpr);
  };

  const givenSlots = slotViewFilter(DEFAULT_CONF);
  const rootSlot = { id: 'root', slotExpr: '', path: '', inner: givenSlots }

  return (
    <div>
      <h1>Test Filter</h1>
      <SlotPicker selectedSlotExpr={currentSlotExpr} onSlotChange={onSlotChange}/>
    </div>
  );
}

export default TestSlotPicker;