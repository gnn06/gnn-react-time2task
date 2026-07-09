import Slot from "./slot";
import { DashedTable, DashedColumnHeader, DashedRowHeader, DashedCell } from "./dashed-table";
import { slotViewTreeSelection, truncatePathAtAnchorDay, getRollingDayColumnId, CURRENT_WEEK_PATH } from "../data/slot-view";
import { SLOTIDS_BY_LEVEL } from "../data/slot-id";
import { IDizer } from "../utils/stringUtil";
import { getBranchHash, branchComplete } from "../data/slot-branch";
import { isSlotEqualOrInclude } from "../data/slot-expr";
import { getCurrentWeekdayId } from "../data/slot-date";
import { findTaskBySlotExpr } from "../data/task";
import { Parser } from "../data/parser";

const DAY_IDS = SLOTIDS_BY_LEVEL['3']; // ordre canonique des jours (lundi..vendredi)
const OVERFLOW = '__rolling_overflow__'; // colonne dédiée pour today/tomorrow hors lundi..vendredi
const parser = new Parser();

/**
 *
 * @param {tasks} tasks après filtrage
 * @param {conf} conf issue du store
 * @returns
 */
export default function SlotViewTree({ tasks, selection, handleSelection, conf, snapDates }) {

    const maxLevel = conf.levelMaxIncluded
    // Vérité unique : le tree dispose toutes les tâches filtrées. Les jours weekday
    // (lundi..vendredi) sont des colonnes ; today/tomorrow sont rendus dans une section
    // rollingDays séparée sous this_week (cf. slotViewTreeSelection), alignée sur la
    // colonne du jour courant. Les tâches imprécises remontent par bubbling.
    const allTreeTasks = tasks
    const taskPaths = allTreeTasks
        .map(t => { const h = getBranchHash(branchComplete(parser.parse(t.slotExpr))); return h ? IDizer(h) : null })
        .filter(Boolean)
        // Jours ancres (today/tomorrow) : pas de colonne weekday → on tronque à la semaine
        // pour la grille weekday. Les nœuds today/tomorrow sont fournis par l'injection
        // de slotViewTreeSelection ; le bubbling y route les tâches.
        .map(truncatePathAtAnchorDay)
        .map(tokens => maxLevel ? tokens.slice(0, maxLevel) : tokens);
    const moisSlots = slotViewTreeSelection(conf, taskPaths);

    // Section rollingDays : today/tomorrow présents dans les données, et colonne weekday
    // d'alignement (ou overflow si week-end). Le jour courant vient du snapDate STOCKÉ
    // (today/this_week), pas de l'horloge système, pour rester cohérent avec les colonnes.
    const currentWeekday = getCurrentWeekdayId(snapDates);
    const todayCol = getRollingDayColumnId('today', currentWeekday);
    const tomorrowCol = getRollingDayColumnId('tomorrow', currentWeekday);
    const hasToday = allTreeTasks.some(t => isSlotEqualOrInclude(t.slotExpr, 'today', false));
    const hasTomorrow = allTreeTasks.some(t => isSlotEqualOrInclude(t.slotExpr, 'tomorrow', false));
    const showRolling = hasToday || hasTomorrow;

    // Colonnes = weekdays présents dans les données, forcées d'inclure la colonne
    // d'alignement de today/tomorrow même si aucune tâche weekday ne l'occupe.
    const forcedCols = new Set();
    if (hasToday && todayCol) forcedCols.add(todayCol);
    if (hasTomorrow && tomorrowCol) forcedCols.add(tomorrowCol);
    const presentDayIds = DAY_IDS.filter(id =>
        forcedCols.has(id) ||
        moisSlots.some(m => (m.inner || []).some(w => (w.inner || []).some(d => d.id === id)))
    );
    const needsOverflow = (hasToday && !todayCol) || (hasTomorrow && !tomorrowCol);
    const columns = needsOverflow ? [...presentDayIds, OVERFLOW] : presentDayIds;
    const numCols = Math.max(columns.length, 1);
    const spanAll = { gridColumn: `span ${numCols}` };

    // Quels nœuds rolling (today/tomorrow) rendre dans une colonne donnée.
    const rollingNodesForColumn = (col, todayNode, tomorrowNode) => {
        const nodes = [];
        if (hasToday && todayNode && (col === todayCol || (col === OVERFLOW && !todayCol))) nodes.push(todayNode);
        if (hasTomorrow && tomorrowNode && (col === tomorrowCol || (col === OVERFLOW && !tomorrowCol))) nodes.push(tomorrowNode);
        return nodes;
    };

    const rows = [];

    for (const moisSlot of moisSlots) {
        rows.push(<DashedRowHeader key={moisSlot.path + "-mois-h"}>Mois</DashedRowHeader>);
        rows.push(<DashedCell key={moisSlot.path + "-mois-c"} style={spanAll}><Slot slot={moisSlot} tasks={allTreeTasks} /></DashedCell>);

        for (const semaineSlot of (moisSlot.inner || [])) {
            rows.push(<DashedRowHeader key={semaineSlot.path + "-semaine-h"}>Semaine</DashedRowHeader>);
            rows.push(<DashedCell key={semaineSlot.path + "-semaine-c"} style={spanAll}><Slot slot={semaineSlot} tasks={allTreeTasks} /></DashedCell>);

            const daySlots = semaineSlot.inner || [];
            if (daySlots.length === 0) continue;

            const dayById = Object.fromEntries(daySlots.map(d => [d.id, d]));

            // Ligne Jour : une cellule par colonne (weekdays + colonne overflow)
            rows.push(<DashedRowHeader key={semaineSlot.path + "-jour-h"}>weekDays</DashedRowHeader>);
            columns.forEach(col =>
                rows.push(<DashedCell key={semaineSlot.path + "-jour-" + col}>{col !== OVERFLOW && dayById[col] && <Slot slot={dayById[col]} tasks={allTreeTasks} />}</DashedCell>)
            );

            const matinById = Object.fromEntries(
                daySlots.map(d => [d.id, (d.inner || []).find(h => h.id === 'matin')])
            );
            const apremById = Object.fromEntries(
                daySlots.map(d => [d.id, (d.inner || []).find(h => h.id === 'aprem')])
            );

            // Ligne Matin : alignée par colonne de jour
            if (columns.some(col => col !== OVERFLOW && matinById[col])) {
                rows.push(<DashedRowHeader key={semaineSlot.path + "-matin-h"}>Matin</DashedRowHeader>);
                columns.forEach(col =>
                    rows.push(<DashedCell key={semaineSlot.path + "-matin-" + col}>{col !== OVERFLOW && matinById[col] && <Slot slot={matinById[col]} tasks={allTreeTasks} />}</DashedCell>)
                );
            }

            // Ligne Aprem : alignée par colonne de jour
            if (columns.some(col => col !== OVERFLOW && apremById[col])) {
                rows.push(<DashedRowHeader key={semaineSlot.path + "-aprem-h"}>Aprem</DashedRowHeader>);
                columns.forEach(col =>
                    rows.push(<DashedCell key={semaineSlot.path + "-aprem-" + col}>{col !== OVERFLOW && apremById[col] && <Slot slot={apremById[col]} tasks={allTreeTasks} />}</DashedCell>)
                );
            }

            // Section rollingDays : uniquement sous this_week, today/tomorrow alignés sous
            // leur colonne weekday (ou colonne overflow au week-end).
            if (showRolling && semaineSlot.path === CURRENT_WEEK_PATH) {
                const todayNode = dayById['today'];
                const tomorrowNode = dayById['tomorrow'];

                const rollingHour = (node, hour) => node && (node.inner || []).find(h => h.id === hour);
                const hourRowHasTasks = (hour) =>
                    [todayNode, tomorrowNode].some(node => {
                        const h = rollingHour(node, hour);
                        return h && findTaskBySlotExpr(allTreeTasks, h, false).length > 0;
                    });

                // Ligne Jour (rolling) : l'en-tête « rollingDays » remplace le séparateur et
                // distingue la section roulante de la grille « weekDays » ci-dessus.
                rows.push(<DashedRowHeader key={semaineSlot.path + "-rolling-jour-h"}>rollingDays</DashedRowHeader>);
                columns.forEach(col => {
                    const nodes = rollingNodesForColumn(col, todayNode, tomorrowNode);
                    rows.push(<DashedCell key={semaineSlot.path + "-rolling-jour-" + col}>
                        {nodes.map((n, i) => <div key={n.id} className={i > 0 ? "mt-2" : ""}><Slot slot={n} tasks={allTreeTasks} /></div>)}
                    </DashedCell>);
                });

                // Ligne Matin (rolling)
                if (hourRowHasTasks('matin')) {
                    rows.push(<DashedRowHeader key={semaineSlot.path + "-rolling-matin-h"}>Matin</DashedRowHeader>);
                    columns.forEach(col => {
                        const nodes = rollingNodesForColumn(col, todayNode, tomorrowNode).map(n => rollingHour(n, 'matin')).filter(Boolean);
                        rows.push(<DashedCell key={semaineSlot.path + "-rolling-matin-" + col}>
                            {nodes.map((n, i) => <div key={n.id} className={i > 0 ? "mt-2" : ""}><Slot slot={n} tasks={allTreeTasks} /></div>)}
                        </DashedCell>);
                    });
                }

                // Ligne Aprem (rolling)
                if (hourRowHasTasks('aprem')) {
                    rows.push(<DashedRowHeader key={semaineSlot.path + "-rolling-aprem-h"}>Aprem</DashedRowHeader>);
                    columns.forEach(col => {
                        const nodes = rollingNodesForColumn(col, todayNode, tomorrowNode).map(n => rollingHour(n, 'aprem')).filter(Boolean);
                        rows.push(<DashedCell key={semaineSlot.path + "-rolling-aprem-" + col}>
                            {nodes.map((n, i) => <div key={n.id} className={i > 0 ? "mt-2" : ""}><Slot slot={n} tasks={allTreeTasks} /></div>)}
                        </DashedCell>);
                    });
                }
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
