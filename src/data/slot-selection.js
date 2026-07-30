import { Parser } from './parser';
import { branchComplete, branchToExpr } from './slot-branch';
import { branchToTree, treetoBranch } from './tree';
import {
  selectionToForest, treeToSelection,
  selectionAdd, selectionShift,
} from './selection-tree';
import { IDizer } from '../utils/stringUtil';

// Machine à états du slot-picker : seul point de vérité des transitions de
// `selection` (Map path -> {selected, repetition, disable}). Importé par le
// composant (handlers) et par les tests. Comportement strictement identique à
// l'ancienne logique éclatée entre slot-select.jsx (onSlotClick) et
// slot-select-dialog.jsx (handleAdd/handleRepetition/handleDisable).

const parser = new Parser();

// Vrai si prefixIds est un préfixe strict de ids (lignée ancêtre).
function isStrictPrefix(prefixIds, ids) {
  return ids.length > prefixIds.length && prefixIds.every((id, i) => ids[i] === id);
}

// Aligne la valeur d'une clé sur la forme produite par les clics ({selected:true}
// + répétition/disable seulement si réels). treeToSelection pose `disable:false`,
// ce qui cassait le raffinage de selectionAdd (test `valueEl.disable === undefined`).
function cleanValue(val) {
  return {
    selected: true,
    ...(val && val.repetition ? { repetition: val.repetition } : {}),
    ...(val && val.disable ? { disable: true } : {}),
  };
}

export function exprToSelection(expr) {
  let result = parser.parse(expr);
  if (result === undefined) return new Map();
  result = branchToTree(branchComplete(result, 1));
  result = treeToSelection(result);
  return new Map(result.map(([key, val]) => [key, cleanValue(val)]));
}

export function selectionToExpr(selection) {
  const forest = selectionToForest(selection);
  if (forest.length === 0) return '';
  const branch = forest.length === 1
    ? treetoBranch(forest[0])
    : { type: 'multi', value: forest.map(treetoBranch) };
  return branchToExpr(branch);
}

// Clic sur un slot (accumulation uniforme — cf. docs/slot-picker.test.md) :
// - P est une clé exacte           → désélection (retire P)
// - P est préfixe strict d'une clé  → remontée (retire ces clés, pose P)
// - sinon (raffinage ou disjoint)   → selectionAdd (clé ⊂ P → raffine, sinon ajoute)
export function selectionToggle(selection, path) {
  if (selection.has(path)) {
    const next = new Map(selection);
    next.delete(path);
    return next;
  }
  const pathIds = IDizer(path);
  const descendants = Array.from(selection.keys())
    .filter(key => isStrictPrefix(pathIds, IDizer(key)));
  if (descendants.length > 0) {
    const next = new Map(selection);
    for (const key of descendants) next.delete(key);
    next.set(path, { selected: true });
    return next;
  }
  return selectionAdd(selection, path);
}

export function selectionSetRepetition(selection, path) {
  const next = new Map(selection);
  next.set(path, { ...(selection.get(path) || { selected: true }), repetition: 1 });
  return next;
}

export function selectionSetDisable(selection, path) {
  const next = new Map(selection);
  next.set(path, { ...(selection.get(path) || { selected: true }), disable: true });
  return next;
}

export { selectionShift };
