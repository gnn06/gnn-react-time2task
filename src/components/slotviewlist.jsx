import Slot from "./slot";
import { DashedTable, DashedColumnHeader, DashedRowHeader, DashedCell } from "./dashed-table";

import { getSlotsForRow, slotViewList } from "../data/slot-view";
import { GENERIC_SLOTIDS, getSlotIdLevel } from "../data/slot-id";
import React from "react";

function buildRows() {
    const slots = slotViewList(null);
    return slots.map(item => ({
        level: GENERIC_SLOTIDS[getSlotIdLevel(item[0].id) - 1],
        slots: getSlotsForRow(item),
    }));
}

export default function SlotViewList({ tasks }) {
    const rows = buildRows();

    return (
        <DashedTable columns={3}>
            <DashedColumnHeader>Past</DashedColumnHeader>
            <DashedColumnHeader>Present</DashedColumnHeader>
            <DashedColumnHeader>Future</DashedColumnHeader>
            
            { rows.map((row, idx) => (
                <React.Fragment key={idx}>
                    <DashedRowHeader>{row.level}</DashedRowHeader>
                    {row.slots.map((slot, idx) => (
                        <DashedCell key={idx}>
                            <Slot slot={slot} tasks={tasks} />
                        </DashedCell>
                    ))}
                </React.Fragment>
            ))}
        </DashedTable>
    );
}
