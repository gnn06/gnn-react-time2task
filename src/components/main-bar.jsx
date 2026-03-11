import { Divider, Stack } from "@mui/material";

import TaskFilter from "./task-filter";
import CommandBar from "./command-bar";

export default function Mainbar() {
    return <Stack direction="row" divider={<Divider orientation="vertical" sx={{ borderRightWidth: 3 }} flexItem />} spacing={1} >
        <CommandBar />
        <TaskFilter />
    </Stack>
}