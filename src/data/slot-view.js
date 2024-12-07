import { appendWithSpace } from "../utils/stringUtil";
import { getSlotIdCurrent, SLOTIDS_BY_LEVEL } from "./slot-id";

/**
 * 
 * @returns [ { id: string, path: string 'id1 id2 id3', inner: recursive result }]
 */

export function slotViewFilter(conf, level = 0, parentPath = "") {
    const SLOTIDS = Object.values(SLOTIDS_BY_LEVEL);
    if (conf.levelMin && level < conf.levelMin) { 
      level = conf.levelMin - 1;
      for (let j = 0; j < conf.levelMin; j++) {
         parentPath = parentPath + (parentPath === "" ? "" : " ")  + getSlotIdCurrent(j)
      }
    }
    if (level >= SLOTIDS.length) return null;
    const IDslevel = SLOTIDS[level]
    let result = []
    if (!conf.levelMaxIncluded || level <= conf.levelMaxIncluded - 1) {
      for (let i = 0; i < IDslevel.length; i++) {
         const id = IDslevel[i];
         const path = parentPath + (parentPath === "" ? "" : " ") + id;
         const remove = conf.remove.indexOf(path) > -1;
         if (remove) continue;
         const collapse = conf.collapse.indexOf(path) > -1;
         let inner = !collapse ? slotViewFilter(conf, level + 1, path) : []
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
export function slotViewAdd(slotView, path, currentPath = "") {
 
  if (slotView === null) return null
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

export function slotViewFilterSelection(conf, paths) {
  let  slotView = slotViewFilter(conf)
  paths.forEach(path => {slotView = slotViewAdd(slotView, path)})
  return slotView
}