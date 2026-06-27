import { appendWithSpace } from "../utils/stringUtil";
import { getSlotIdCurrent, getSlotIdLevel, SLOTIDS_BY_LEVEL } from "./slot-id";
import { getCurrentPathExpr, SlotPath } from "./slot-path";

interface SlotViewConf {
  levelMin:         number | null,
    levelMaxIncluded: number | null,
    remove: string[],
    collapse: string[],
    view: "tree" | "list",
    slotStrict: boolean,
    showRepeat: boolean,
    includeWeekDays: boolean
}

export const DEFAULT_CONF:SlotViewConf = {
    collapse: [
        "this_month next_week",
        "this_month following_week",
        "next_month"
    ],
    remove: [],
    levelMin: null,
    levelMaxIncluded: null,
    view: "tree",
    slotStrict: true,
    showRepeat: true,
    includeWeekDays: false
}

interface Slot {
    id: string,
    path: string,
    inner: Slot[]
}

export function transPathToConf(pathS:string) : string {
    const path = new SlotPath(pathS)
    const level = getSlotIdLevel(path.getLast())
    if (level === getSlotIdLevel("day")) {
        path.replace(level, "day")
    }
    if (level === 4) {
        path.replace(3, "day")
        path.truncate(3)
    }
    return path.toExpr()
}

export function reduceCollapseOnConf(conf: SlotViewConf, path: string) : SlotViewConf {
    const collapseSet = new Set(conf.collapse);
    const pathConf = transPathToConf(path)
    if (collapseSet.has(pathConf)) {
        collapseSet.delete(pathConf)
    } else {
        collapseSet.add(pathConf)
    }
    conf.collapse = Array.from(collapseSet)
    return conf
}

export function slotTreeToSlotList(root: Slot): Slot[][] {
    const levels: Slot[][] = [];
    
    // Fonction récursive pour parcourir l'arbre par niveau
    function traverseLevel(nodes: Slot[], depth: number) {
        if (nodes.length === 0) {
            return;
        }
        
        // Initialiser le niveau si nécessaire
        if (!levels[depth]) {
            levels[depth] = [];
        }
        
        // Ajouter tous les nœuds du niveau actuel
        levels[depth].push(...nodes);
        
        // Collecter tous les enfants pour le niveau suivant
        const children: Slot[] = [];
        for (const node of nodes) {
            if (node.inner && node.inner.length > 0) {
                children.push(...node.inner);
            }
        }
        
        // Traiter le niveau suivant
        if (children.length > 0) {
            traverseLevel(children, depth + 1);
        }
    }
    
    // Démarrer la traversée avec les enfants du root
    if (root.inner && root.inner.length > 0) {
        traverseLevel(root.inner, 0);
    }
    
    // Inverser l'ordre des niveaux (du plus profond au plus superficiel)
    return levels.reverse();
}

// v1 C1b : axe jour = ancres relatifPresent today/tomorrow (paths standalone).
// today porte ses créneaux matin/aprem ; tomorrow reste au niveau jour.
function relativePresentDaySlots(): [Slot, Slot] {
    const hours:[Slot, Slot] = [
        { id: "matin",  path: "today matin", inner: [] },
        { id: "aprem",  path: "today aprem", inner: [] },
    ];
    return [
        { id: "today",    path: "today",    inner: hours },
        { id: "tomorrow", path: "tomorrow", inner: [] },
    ];
}

function defaultSlotViewList(): Slot {
    const [todaySlot, tomorrowSlot] = relativePresentDaySlots();
    const thisWeek:Slot     = { id: "this_week", path: "this_month this_week", inner: [todaySlot, tomorrowSlot] };
    const nextWeek:Slot     = { id: "next_week", path: "this_month next_week", inner: [] };
    const thisMonth:Slot    = { id: "this_month", path: "this_month",          inner: [thisWeek, nextWeek] };
    const nextMonth:Slot    = { id: "next_month", path: "next_month",          inner: [] };
    return { id: "root", path: "", inner: [thisMonth, nextMonth] };
}

/**
 * return the slot node matching expr path or node itself if not found
 * @param node 
 * @param expr 
 * @returns 
 */
export function slotFind(node: Slot, expr: string): Slot | null {
    if (node.path === expr) return node;
    if (!node.inner || node.inner.length === 0) return null;
    for (const child of node.inner) {
        const res = slotFind(child, expr);
        if (res) return res;
    }
    return null;
}

export function getSlotsForRow(slots:Slot[]) : [Slot | null, Slot | null, Slot[]] {
    const givenLevel = new SlotPath(slots[0].path).getLevel();
    const currentPath = getCurrentPathExpr(givenLevel);
    const found = slots.findIndex(s => s.path === currentPath);
    // Fallback: today/tomorrow ont des paths standalone sans weekday → middle = 0.
    const middle = found >= 0 ? found : 0;
    const result:[Slot | null, Slot | null, Slot[]] = [null, null, []];
    if (middle >= 1) {
        result[0] = slots[0];
    }
    result[1] = slots[middle];
    if (middle < slots.length - 1) {
        result[2] = slots.slice(middle + 1);
    }
    return result;
}

export function slotHasImpreciseIcon(slotPath: string, slotLevel: number): boolean {
    const currentMonthId = getSlotIdCurrent(1);
    return slotLevel < 4 && (
        slotPath === currentMonthId ||
        slotPath.startsWith(currentMonthId + ' ' + getSlotIdCurrent(2))
    );
}

function truncateToFirstMissing(tokens: string[], slots: Slot[], depth = 0): string[] | null {
    if (!tokens || tokens.length === 0) return null;
    if (depth > 1) return null; // inject au maximum jusqu'au niveau semaine
    const id = tokens[0];
    const found = slots?.find(s => s.id === id);
    if (!found) return tokens.slice(0, 1);
    const sub = truncateToFirstMissing(tokens.slice(1), found.inner ?? [], depth + 1);
    if (!sub) return null;
    return [id, ...sub];
}

function stripInnerAtMaxLevel(slots: Slot[], maxLevel: number): Slot[] {
    return slots.map(slot => {
        if (getSlotIdLevel(slot.id) >= maxLevel) return { ...slot, inner: [] }
        return { ...slot, inner: stripInnerAtMaxLevel(slot.inner, maxLevel) }
    })
}

export function slotViewList(path:string, conf?: Pick<SlotViewConf, 'levelMaxIncluded'>, taskPaths?: string[][]): Slot[][] {
    let tree = defaultSlotViewList();
    if (taskPaths) {
        taskPaths
            .map(p => truncateToFirstMissing(p, tree.inner))
            .filter((p): p is string[] => p !== null)
            .forEach(p => { tree.inner = slotViewAdd(tree.inner, p) });
    }
    if (path) {
        const temp = slotFind(tree, path) || tree;
        tree = { id:'root', path:'', inner:[temp]};
    }
    const result = slotTreeToSlotList(tree);
    if (conf?.levelMaxIncluded) {
        const maxLevel = conf.levelMaxIncluded
        return result
            .filter(row => getSlotIdLevel(row[0].id) <= maxLevel)
            .map(row => stripInnerAtMaxLevel(row, maxLevel))
    }
    return result;
}

/**
 * 
 * @returns [ { id: string, path: string 'id1 id2 id3', inner: recursive result }]
 */

export function slotViewFilter(conf: SlotViewConf, level = 0, parentPath = new SlotPath("")) : Slot[]  {
    const SLOTIDS = Object.values(SLOTIDS_BY_LEVEL);
    if (conf.levelMin && level < conf.levelMin) {
        level = conf.levelMin - 1;
        for (let j = 0; j < conf.levelMin; j++) {
            parentPath.append(getSlotIdCurrent(j))
        }
    }
    if (level >= SLOTIDS.length) return [];
    const IDslevel = SLOTIDS[level]
    let result = []
    if (!conf.levelMaxIncluded || level <= conf.levelMaxIncluded - 1) {
        for (let i = 0; i < IDslevel.length; i++) {
            const id = IDslevel[i];
            const _path = new SlotPath(parentPath.toExpr()).append(id)
            const remove = conf.remove.map(el => new SlotPath(el)).some(el => el.equals(_path));
            if (remove) continue;
            const collapse = conf.collapse.map(el => new SlotPath(el)).some(el => el.equals(_path));
            let inner = !collapse ? slotViewFilter(conf, level + 1, _path) : []
            const node = { id: id, path: _path.toExpr(), inner: inner }
            result.push(node)
        }
    };
    return result;
}

// Ancres jour relatifPresent pour le picker de filtre : today ET tomorrow portent
// leurs créneaux matin/aprem (paths standalone), homogène avec le picker de tâche.
// (La vue liste, elle, garde tomorrow en feuille via relativePresentDaySlots.)
function relativePresentDayPickerSlots(): [Slot, Slot] {
    const dayHours = (day: string): Slot[] => [
        { id: "matin", path: `${day} matin`, inner: [] },
        { id: "aprem", path: `${day} aprem`, inner: [] },
    ];
    return [
        { id: "today",    path: "today",    inner: dayHours("today") },
        { id: "tomorrow", path: "tomorrow", inner: dayHours("tomorrow") },
    ];
}

/** Préfixe l'inner du nœud this_week avec les ancres relatifPresent (today/tomorrow). */
function injectRelativeDaysUnderThisWeek(slots: Slot[]): Slot[] {
    return slots.map(slot => {
        if (slot.id === "this_week") {
            return { ...slot, inner: [...relativePresentDayPickerSlots(), ...(slot.inner ?? [])] };
        }
        return { ...slot, inner: injectRelativeDaysUnderThisWeek(slot.inner ?? []) };
    });
}

/**
 * Arbre de slots du picker de filtre : la grille absolue (weekdays) de slotViewFilter
 * augmentée des ancres relatifPresent today/tomorrow injectées sous this_week, afin de
 * pouvoir filtrer aussi bien sur les weekdays que sur today / today matin / today aprem / tomorrow.
 */
export function slotViewPicker(conf: SlotViewConf): Slot[] {
    return injectRelativeDaysUnderThisWeek(slotViewFilter(conf));
}

/**
 *
 * @param {*} slotView
 * @param {[string]} path
 * @returns
 */
export function slotViewAdd(slotView: Slot[], path:string[], currentPath = "") : Slot[] {

    if (slotView === null) return []
    if (path === null || path.length === 0) return slotView

    const id = path[0]
    const hasId = slotView.length > 0 && slotView.find(node => node.id === id);
    if (hasId) {
    return slotView.map(el => 
      {if (el.id === id) {
        return {...el, inner: slotViewAdd(el.inner, path.slice(1), el.path)}
            } else {
                return el
      }})
    } else {
        return slotView.concat(
      { id: id, 
                path: appendWithSpace(currentPath, id),
                inner: slotViewAdd([], path.slice(1), appendWithSpace(currentPath, id))
            })
    }
}

/**
 * Validates that a tokenized slot path (from IDizer) is a clean hierarchical path:
 * all tokens are valid slot IDs and levels are strictly increasing.
 * Rejects keyword tokens (every, chaque, disable), numbers, multi-slot separators (|),
 * and same-level sequences like ["this_month", "next_month"].
 */
export function isCleanSlotPath(tokens: string[] | null): boolean {
    if (!tokens || tokens.length === 0) return false
    let prevLevel = 0
    for (const token of tokens) {
        const base = token.match(/^(\S+)/)?.[1]
        const level = getSlotIdLevel(base ?? '')
        if (level === -1 || level <= prevLevel) return false
        prevLevel = level
    }
    return true
}

/**
 * Génère une arborescence de slot à afficher 
 * selon la conf spécifiée en y rajoutant les slots nécessaires 
 * aux taches qui ne serait pas affichées.
 * @param paths tableau de sorte de SlotPath à injecter
 */
export function slotViewFilterSelection(conf: SlotViewConf, paths: string[][]) {
  let slotView = slotViewFilter(conf)
  paths.forEach(path => {slotView = slotViewAdd(slotView, path)})
  return slotView
}