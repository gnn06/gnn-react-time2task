import React from "react";
import { useSelector } from "react-redux";
import Slot from './slot';

export default function SlotList()  {
    const slotRedux = useSelector(state => state.slot.slots);
    return (
        <div className="m-1">
        <h1>Slots</h1>
        {slotRedux.map((slot, index) => {
            return <Slot key={slot.id} slot={slot} />
        })}
        </div>
        )
    }