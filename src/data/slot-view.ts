import { S } from "vite/dist/node/types.d-aGj9QkWt";
import { appendWithSpace } from "../utils/stringUtil";
import { getSlotIdCurrent, getSlotIdLevel, getSlotIdNextPrev, SLOTIDS_BY_LEVEL } from "./slot-id";
import { SlotPath } from "./slot-path";

interface SlotViewConf {
  levelMin:         number | null,
    levelMaxIncluded: number | null,
    remove: string[],
    collapse: string[],
    view: "tree" | "list",
    slotStrict: boolean
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
    slotStrict: true
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

function defaultSlotViewList(): Slot {
    let today = getSlotIdCurrent(3);
    if (today === "samedi" || today === "dimanche") {
        today = "lundi";
    }
    let tomorrow = getSlotIdNextPrev(today, 1);
    if (tomorrow === "samedi" || tomorrow === "dimanche") {
        tomorrow = "lundi";
    }
    let yesterday = getSlotIdNextPrev(today, -1);
    if (yesterday === "samedi" || yesterday === "dimanche") {
        yesterday = "vendredi";
    }
    
    const hours:[Slot, Slot] = [
        { id: "Ce matin", path: `this_month this_week ${today} matin`, inner: [] },
        { id: "Cet arpès-midi", path: `this_month this_week ${today} aprem`, inner: [] },
    ]
    
    const todaySlot:Slot = { id: `${today}`, path: `this_month this_week ${today}`, inner: hours };
    const tomorrowSlot:Slot = { id: `${tomorrow}`, path: `this_month this_week ${tomorrow}`, inner: [] };
    const yesterdaySlot:Slot = { id: `${yesterday}`, path: `this_month this_week ${yesterday}`, inner: [] };
    
    const thisWeek:Slot = { id: "Cette semaine", path: "this_month this_week", inner: [yesterdaySlot, todaySlot, tomorrowSlot] };
    const nextWeek:Slot = { id: "Semaine prochaine", path: "this_month next_week", inner: [] };
    
    const thisMonth:Slot = { id: "Ce mois-ci", path: "this_month", inner: [thisWeek, nextWeek] };
    const nextMonth:Slot = { id: "Mois prochain", path: "next_month", inner: [] };
    
    const root:Slot = { id: "root", path: "", inner: [thisMonth, nextMonth] };
    return root;
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

export function slotViewList(path:string): Slot[][] {
    let tree = defaultSlotViewList();
    if (path) {
        const temp = slotFind(tree, path) || tree;
        tree = { id:'root', path:'', inner:[temp]};
    }
    const result = slotTreeToSlotList(tree);
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

/**
 * 
 * @param {*} slotView 
 * @param {[string]} path 
 * @returns 
 */
export function slotViewAdd(slotView: Slot[], path:string, currentPath = "") : Slot[] {

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

export function slotViewFilterSelection(conf: SlotViewConf, paths: string[]) {
  let  slotView = slotViewFilter(conf)
  paths.forEach(path => {slotView = slotViewAdd(slotView, path)})
    return slotView
}