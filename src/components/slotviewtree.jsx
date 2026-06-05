import Slot from "./slot";
import { DashedTable, DashedColumnHeader, DashedRowHeader, DashedCell } from "./dashed-table";
import { slotViewFilterSelection } from "../data/slot-view";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";
import { IDizer } from "../utils/stringUtil";
import { getBranchHash, branchComplete } from "../data/slot-branch";
import { Parser } from "../data/parser";

const DAY_IDS = SLOTIDS_BY_LEVEL['3']; // ordre canonique des jours
const parser = new Parser();

/**
 *
 * @param {tasks} tasks après filtrage
 * @param {conf} conf issue du store
 * @returns
 */
export default function SlotViewTree({ tasks, selection, handleSelection, conf }) {

    const maxLevel = conf.levelMaxIncluded
    const taskPaths = tasks
        .map(t => { const h = getBranchHash(branchComplete(parser.parse(t.slotExpr))); return h ? IDizer(h) : null })
        .filter(Boolean)
        .map(tokens => maxLevel ? tokens.slice(0, maxLevel) : tokens);
    const moisSlots = slotViewFilterSelection(conf, taskPaths);

    // Colonnes = jours présents dans les données, dans l'ordre canonique
    const presentDayIds = DAY_IDS.filter(id =>
        moisSlots.some(m => (m.inner || []).some(w => (w.inner || []).some(d => d.id === id)))
    );
    const numCols = Math.max(presentDayIds.length, 1);
    const spanAll = { gridColumn: `span ${numCols}` };

    const rows = [];

    for (const moisSlot of moisSlots) {
        rows.push(<DashedRowHeader key={moisSlot.path + "-mois-h"}>Mois</DashedRowHeader>);
        rows.push(<DashedCell key={moisSlot.path + "-mois-c"} style={spanAll}><Slot slot={moisSlot} tasks={tasks} /></DashedCell>);

        for (const semaineSlot of (moisSlot.inner || [])) {
            rows.push(<DashedRowHeader key={semaineSlot.path + "-semaine-h"}>Semaine</DashedRowHeader>);
            rows.push(<DashedCell key={semaineSlot.path + "-semaine-c"} style={spanAll}><Slot slot={semaineSlot} tasks={tasks} /></DashedCell>);

            const daySlots = semaineSlot.inner || [];
            if (daySlots.length === 0) continue;

            const dayById = Object.fromEntries(daySlots.map(d => [d.id, d]));

            // Ligne Jour : une cellule par colonne
            rows.push(<DashedRowHeader key={semaineSlot.path + "-jour-h"}>Jour</DashedRowHeader>);
            presentDayIds.forEach(dayId =>
                rows.push(<DashedCell key={semaineSlot.path + "-jour-" + dayId}>{dayById[dayId] && <Slot slot={dayById[dayId]} tasks={tasks} />}</DashedCell>)
            );

            const matinById = Object.fromEntries(
                daySlots.map(d => [d.id, (d.inner || []).find(h => h.id === 'matin')])
            );
            const apremById = Object.fromEntries(
                daySlots.map(d => [d.id, (d.inner || []).find(h => h.id === 'aprem')])
            );

            // Ligne Matin : alignée par colonne de jour
            if (presentDayIds.some(id => matinById[id])) {
                rows.push(<DashedRowHeader key={semaineSlot.path + "-matin-h"}>Matin</DashedRowHeader>);
                presentDayIds.forEach(dayId =>
                    rows.push(<DashedCell key={semaineSlot.path + "-matin-" + dayId}>{matinById[dayId] && <Slot slot={matinById[dayId]} tasks={tasks} />}</DashedCell>)
                );
            }

            // Ligne Aprem : alignée par colonne de jour
            if (presentDayIds.some(id => apremById[id])) {
                rows.push(<DashedRowHeader key={semaineSlot.path + "-aprem-h"}>Aprem</DashedRowHeader>);
                presentDayIds.forEach(dayId =>
                    rows.push(<DashedCell key={semaineSlot.path + "-aprem-" + dayId}>{apremById[dayId] && <Slot slot={apremById[dayId]} tasks={tasks} />}</DashedCell>)
                );
            }
        }
    }

    return (
        <DashedTable columns={numCols}>
            <DashedColumnHeader style={{ gridColumn: `span ${numCols}` }}>Créneau</DashedColumnHeader>
            {rows}
        </DashedTable>
    );
}
