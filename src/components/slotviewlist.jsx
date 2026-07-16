import Slot from "./slot";
import { DashedTable, DashedColumnHeader, DashedRowHeader, DashedCell } from "./dashed-table";
import { getSlotsForRow, getHourSlotsForRow, slotViewListSelection, slotViewListDaySections } from "../data/slot-view";
import { getSlotIdLevel } from "../data/slot-id";
import { getBranchHash, branchComplete } from "../data/slot-branch";
import { getCurrentWeekdayId } from "../data/slot-date";
import { findTaskBySlotExpr } from "../data/task";
import { levelLabel } from "./level-label";
import { Parser } from "../data/parser";
import { IDizer } from "../utils/stringUtil";
import React from "react";

const parser = new Parser();

// Libellés de niveau homogènes avec le tree (colonne de titre en chevrons).
const GENERIC_LABEL = { 1: 'Mois', 2: 'Semaine' };

function computeTaskPaths(tasks) {
    return tasks
        .map(t => { const h = getBranchHash(branchComplete(parser.parse(t.slotExpr))); return h ? IDizer(h) : null })
        .filter(Boolean);
}

// Contenu d'une cellule : plusieurs slots empilés (Future des niveaux absolus), un slot
// unique, ou rien (colonne Past des lignes rolling/weekDays, cellule week-end vide).
function cellContent(cell, tasks) {
    if (Array.isArray(cell)) {
        return cell.map((s, i) => <div key={i} className={i > 0 ? "mt-2" : ""}><Slot slot={s} tasks={tasks} /></div>);
    }
    return cell ? <Slot slot={cell} tasks={tasks} /> : null;
}

export default function SlotViewList({ tasks, conf, snapDates }) {
    // Vérité unique : tasks = ensemble filtré (identique au TaskPanel), disposé par bubbling.
    const allListTasks = tasks;
    const taskPaths = computeTaskPaths(allListTasks);
    const maxLevel = conf.levelMaxIncluded;
    const currentWeekday = getCurrentWeekdayId(snapDates);

    // Lignes Mois/Semaine : axe temporel Past/Present/Future (getSlotsForRow). Les weekdays
    // mappés par today/tomorrow sont injectés sous this_week pour que son bubbling les exclue
    // (sinon double affichage : case weekday + remontée à this_week).
    const genericRows = slotViewListSelection(currentWeekday, conf, taskPaths)
        .filter(item => getSlotIdLevel(item[0].id) <= 2)
        .map(item => {
            const depth = getSlotIdLevel(item[0].id);
            return { key: `gen-${depth}`, depth, label: GENERIC_LABEL[depth], cells: getSlotsForRow(item) };
        })
        .sort((a, b) => b.depth - a.depth); // du plus profond au plus superficiel : Semaine (haut) → Mois

    // Niveau jour : deux sections parallèles (rollingDays / weekDays) partageant les colonnes
    // Past/Present/Future, entrelacées par niveau (option B). rollingDays : today → Present,
    // tomorrow → Future (une cellule = un slot). weekDays : today → Present, jours après today
    // → Future (empilés), avant today → Past (empilés). Chaque weekday a sa case, aucun ne
    // remonte à this_week.
    const { rolling, weekday } = slotViewListDaySections(currentWeekday, maxLevel);
    const showDay = !maxLevel || maxLevel >= 3;
    const showHour = !maxLevel || maxLevel >= 4;
    const hasWeekday = weekday.past.length > 0 || weekday.present || weekday.future.length > 0;

    // Seul le jour present d'une section porte matin/aprem en inner (past/future sont
    // strippés, cf. slotViewListDaySections) : la ligne heure d'une section se déduit donc
    // du seul jour present, réparti sur Past/Present/Future par getHourSlotsForRow.
    const rowHasTasks = (cells) => cells.some(c => c && findTaskBySlotExpr(allListTasks, c, false).length > 0);

    const hourRows = [];
    const dayRows = [];

    if (showDay) {
        dayRows.push({ key: 'rolling-jour', depth: 3, label: 'rollingDays', cells: [null, rolling.present, rolling.future] });
        if (hasWeekday) {
            dayRows.push({ key: 'weekdays-jour', depth: 3, label: 'weekDays', cells: [weekday.past, weekday.present, weekday.future] });
        }
        if (showHour) {
            const rollingHourCells = getHourSlotsForRow(rolling.present);
            if (rowHasTasks(rollingHourCells)) {
                hourRows.push({ key: 'rolling-heure', depth: 4, label: 'rollingHours', cells: rollingHourCells });
            }
            if (hasWeekday) {
                const weekdayHourCells = getHourSlotsForRow(weekday.present);
                if (rowHasTasks(weekdayHourCells)) {
                    hourRows.push({ key: 'weekdays-heure', depth: 4, label: 'weekHours', cells: weekdayHourCells });
                }
            }
        }
    }

    // Du plus profond au plus superficiel : heure en haut, puis jour, Semaine, Mois en dernier.
    const rows = [...hourRows, ...dayRows, ...genericRows];

    return (
        <DashedTable columns={3}>
            <DashedColumnHeader>Past</DashedColumnHeader>
            <DashedColumnHeader>Present</DashedColumnHeader>
            <DashedColumnHeader>Future</DashedColumnHeader>

            {rows.map(row => (
                <React.Fragment key={row.key}>
                    <DashedRowHeader data-testid={`row-${row.key}`}>{levelLabel(row.depth, row.label)}</DashedRowHeader>
                    {row.cells.map((cell, cellIdx) => (
                        <DashedCell key={cellIdx}>{cellContent(cell, allListTasks)}</DashedCell>
                    ))}
                </React.Fragment>
            ))}
        </DashedTable>
    );
}
