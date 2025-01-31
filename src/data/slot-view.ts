import { appendWithSpace } from "../utils/stringUtil";
import { getSlotIdCurrent, SLOTIDS_BY_LEVEL } from "./slot-id";
import { SlotPath } from "./slot-path";

interface SlotViewConf {
  levelMin:         number,
  levelMaxIncluded: number,
  remove: String[],
  collapse: String[]
}

interface Slot {
  id: string,
  path: string,
  inner: Slot[]
}

/**
 * 
 * @returns [ { id: string, path: string 'id1 id2 id3', inner: recursive result }]
 */

export function slotViewFilter(conf: SlotViewConf, level = 0, parentPath = "") : Slot[]  {
    const _parentPath = new SlotPath(parentPath)
    const SLOTIDS = Object.values(SLOTIDS_BY_LEVEL);
    if (conf.levelMin && level < conf.levelMin) { 
      level = conf.levelMin - 1;
      for (let j = 0; j < conf.levelMin; j++) {
        _parentPath.append(getSlotIdCurrent(j))
        parentPath = parentPath + (parentPath === "" ? "" : " ")  + getSlotIdCurrent(j)
      }
    }
    if (level >= SLOTIDS.length) return [];
    const IDslevel = SLOTIDS[level]
    let result = []
    if (!conf.levelMaxIncluded || level <= conf.levelMaxIncluded - 1) {
      for (let i = 0; i < IDslevel.length; i++) {
         const id = IDslevel[i];
         const path = parentPath + (parentPath === "" ? "" : " ") + id;
         const _path = new SlotPath(_parentPath.toExpr()).append(id)
         const remove = conf.remove.indexOf(path) > -1;
         if (remove) continue;
         const collapse = conf.collapse.indexOf(path) > -1;
         let inner = !collapse ? slotViewFilter(conf, level + 1, _path.toExpr()) : []
         const node = { id: id, path: path, inner: inner }
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
  if (path.length === 0) return slotView

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