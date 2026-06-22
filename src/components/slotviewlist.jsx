import Slot from "./slot";
import { DashedTable, DashedColumnHeader, DashedRowHeader, DashedCell } from "./dashed-table";
import { getSlotsForRow, slotViewList } from "../data/slot-view";
import { GENERIC_SLOTIDS, getSlotIdLevel } from "../data/slot-id";
import { getBranchHash, branchComplete } from "../data/slot-branch";
import { Parser } from "../data/parser";
import { IDizer } from "../utils/stringUtil";
import React from "react";
import { taskRelativeParentToPresent } from "../data/task";
import { useGetSnapDatesQuery } from "../features/apiSlice";

const parser = new Parser();

function computeTaskPaths(tasks) {
    return tasks
        .map(t => { const h = getBranchHash(branchComplete(parser.parse(t.slotExpr))); return h ? IDizer(h) : null })
        .filter(Boolean);
}

function buildRows(conf, tasks) {
    const taskPaths = computeTaskPaths(tasks);
    const slots = slotViewList(null, conf, taskPaths);
    return slots.map(item => ({
        level: GENERIC_SLOTIDS[getSlotIdLevel(item[0].id) - 1],
        slots: getSlotsForRow(item),
    }));
}

export default function SlotViewList({ tasks, conf }) {
    const { data: snapDates = [], isSuccess: snapDatesReady } = useGetSnapDatesQuery()
    // C2c : weekday tasks projetés en today/tomorrow si leur date correspond.
    // Si la projection échoue (autre jour), la tâche originale est préservée via ?? t.
    const listTasks = snapDatesReady
        ? tasks.map(t => taskRelativeParentToPresent(t, snapDates) ?? t)
        : tasks;
    const rows = buildRows(conf, listTasks);

    return (
        <DashedTable columns={3}>
            <DashedColumnHeader>Past</DashedColumnHeader>
            <DashedColumnHeader>Present</DashedColumnHeader>
            <DashedColumnHeader>Future</DashedColumnHeader>

            { rows.map((row, idx) => (
                <React.Fragment key={idx}>
                    <DashedRowHeader>{row.level}</DashedRowHeader>
                    {row.slots.map((slot, cellIdx) => (
                        <DashedCell key={cellIdx}>
                            { cellIdx < 2
                                ? <Slot slot={slot} tasks={listTasks} />
                                : slot.map((s, i) => <div key={i} className={i > 0 ? "mt-2" : ""}><Slot slot={s} tasks={listTasks} /></div>)
                            }
                        </DashedCell>
                    ))}
                </React.Fragment>
            ))}
        </DashedTable>
    );
}
