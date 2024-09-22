import { getSlotIdCurrent, SLOTIDS_BY_LEVEL } from "./slot-id";

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
         let inner = !collapse ? slotViewFilter(conf, level + 1, path) : null
         const node = { id: id, path: path, inner: inner }
         result.push(node)
     }
   };
   return result;
}

