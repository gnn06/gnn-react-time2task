import { Stack } from "@mui/material";

import CreateTask from "./create-task";
import ShiftAction from "./action-shift";
import TodoAction from "./action-todo";

export default function CommandBar() {
    return <Stack direction={"row"} spacing={1}>
        <CreateTask />
        <ShiftAction />
        <TodoAction />
    </Stack>
}