import SlotPickerNode from "./slot-picker-node";

import { DEFAULT_CONF, slotViewPicker } from "../data/slot-view";

function SlotPicker({selectedSlotExprs, onSlotChange}) {

  const givenSlots = slotViewPicker(DEFAULT_CONF);

  return (
    <>
      {givenSlots.map((slot, index) => <SlotPickerNode key={index} slot={slot} selectedSlotExprs={selectedSlotExprs} onSlotChange={onSlotChange}/>)}
    </>
  );
}

export default SlotPicker;