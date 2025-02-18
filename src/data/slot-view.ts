import { S } from "vite/dist/node/types.d-aGj9QkWt";
import { appendWithSpace } from "../utils/stringUtil";
import { getSlotIdCurrent, getSlotIdLevel, SLOTIDS_BY_LEVEL } from "./slot-id";
import { SlotPath } from "./slot-path";

interface SlotViewConf {
  levelMin:         number,
  levelMaxIncluded: number,
  remove: string[],
  collapse: string[]
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