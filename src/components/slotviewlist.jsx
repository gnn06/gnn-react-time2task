import { Stack } from "@mui/material";

import { slotViewList } from "../data/slot-view";
import Slot from "./slot";

export default function SlotViewList({tasks}) {
    const row_spacing = 1;
    const line_spacing = 2.0;

    const slots = slotViewList(null);

    return <Stack spacing={line_spacing}>
        {slots.map(item =>
            <Stack direction="row" spacing={row_spacing}>
                {item.map(subitem => <Slot slot={subitem} tasks={tasks} />)}
            </Stack>
        )}
    </Stack>
}