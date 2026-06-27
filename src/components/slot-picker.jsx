import SlotPickerNode from "./slot-picker-node";

import { DEFAULT_CONF, slotViewPicker } from "../data/slot-view";

function SlotPicker({selectedSlotExpr, onSlotChange}) {

  const givenSlots = slotViewPicker(DEFAULT_CONF);
  const rootSlot = { id: 'root', slotExpr: '', path: '', inner: givenSlots }

  return (
    <>
      {givenSlots.map((slot, index) => <SlotPickerNode key={index} slot={slot} selectedSlotExpr={selectedSlotExpr} onSlotChange={onSlotChange}/>)}
    </>
  );
}

export default SlotPicker;