import { Stack } from "@mui/material";

import Slot from "./slot";

import { slotViewList } from "../data/slot-view";

export default function SlotViewList({tasks}) {
    const row_spacing = 1;
    const line_spacing = 2.0;

    const slots = slotViewList();

    return <Stack spacing={line_spacing}>
        {slots.map(item =>
            <Stack direction="row" spacing={row_spacing}>
                {item.map(subitem => <Slot slot={subitem} tasks={tasks} />)}
            </Stack>
        )}
    </Stack>
}