# Feature : Prochain slot

Afficher le prochain slot d'une tâche dans la TaskDialog et dans une colonne du panel task (lecture seule).

---

## Décisions de conception

### Fonction centrale : `getSlotNextPrev`

```js
getSlotNextPrev(slot: SlotBranch, slotPath: SlotPath, direction: number, comparison?: 'strict'|'inclusive'): SlotPath | null
```

- **`slot`** : `SlotBranch` — la tâche peut être unique, multi ou repeat (issu du parser)
- **`slotPath`** : `SlotPath` — chemin linéaire représentant le "maintenant"
- **`direction`** : entier — seul `+1` est traité pour l'instant
- **`comparison`** : `'strict'` (défaut) ou `'inclusive'` — `'inclusive'` : le créneau courant compte (`>=`) ; `'strict'` : uniquement l'avenir (`>`)
- **Retour** : `SlotPath | null` — homogène avec le 2ème argument ; `SlotPath` ne porte pas de `repetition`/`flags`, ce qui supprime naturellement les modificateurs repeat du résultat
- **`null`** signifie "pas de prochain slot" (tâche unique ou multi dont tous les slots sont passés)
- **Pureté temporelle** : le "maintenant" est toujours passé via `slotPath` — pas de lecture de la date courante dans la fonction

> Cas `chaque` (ex: `"chaque lundi"`) : non traité en v1.

### Logique de comparaison slot vs slotPath

La comparaison descend niveau par niveau (mois → semaine → jour → heure). Le SlotPath retourné inclut l'heure quand elle est présente dans le slot.

| condition | résultat |
|-----------|----------|
| mois du slot > mois du slotPath | slot futur → retourner le slot |
| mois du slot = mois du slotPath | `'inclusive'` → retourner ; `false` → `null` |
| semaine du slot > semaine du slotPath | slot futur → retourner le slot |
| semaine du slot < semaine du slotPath | passé → `null` (unique/multi) ou avancer de N semaines (repeat) |
| même semaine, pas de jour dans le slot | semaine entière encore valide → retourner le slot |
| même semaine, jour du slot > jour du slotPath | retourner le slot (avec heure si présente) |
| même semaine, jour du slot = jour du slotPath, pas d'heure dans le slot | `'inclusive'` → retourner ; `false` → `null` ou avancer |
| même semaine, même jour, heure du slot > heure du slotPath | retourner le slot avec heure |
| même semaine, même jour, heure du slot = heure du slotPath | `'inclusive'` → retourner ; `false` → `null` ou avancer |
| même semaine, même jour, heure du slot < heure du slotPath | passé → `null` ou avancer (repeat) |
| même semaine, jour du slot < jour du slotPath | passé → `null` ou avancer (repeat) |

### `comparison` et statut de la tâche

`getTaskNextSlotLabel` détermine `comparison` selon `task.status` :

- **`'inclusive'`** (aujourd'hui compte) : `'A faire'`, `'en cours'`
- **`'strict'`** (strictement futur) : tous les autres statuts (`'fait'`, `'terminé'`, `'archivé'`, `'reprendre …'`, etc.)

Rationale : une tâche non faite planifiée aujourd'hui a encore son créneau devant elle ; une tâche faite ou reportée doit afficher la prochaine occurrence réelle.

Pour avancer : `getSlotIdNextPrev(weekSlotId, repetition)` — existant dans `slot-id.js`.

### Cas multi
- **Multi-jours** : `this_week mardi jeudi` → `{type:'branch', value:['this_week', {type:'multi', value:[...]}]}` (multi imbriqué). Chaque sous-branche peut porter un jour ET une heure : `{type:'branch', value:['mardi','matin']}`. Tri par (jour, heure), retourner le premier valide.
- **Multi-heures même jour** : `mercredi matin aprem` → `{type:'branch', value:['mercredi', {type:'multi', value:[branch('matin'), branch('aprem')]}]}`. Le `dayId` est présent au niveau de la branche ; le multi ne contient que des heures.
- **Multi-mois au niveau racine** : `this_month next_month` → `{type:'multi', value:[branch(this_month), branch(next_month)]}`. `getNextPrevBranch` itère les sous-branches dans l'ordre et retourne le premier résultat non-null.
- Si tous les items sont passés → `null`.

### Complétion de la branche avant appel (`branchComplete`)
- `getTaskNextSlotLabel` appelle `branchComplete(branch, 1)` avant `getSlotNextPrev` pour gérer les slots incomplets (ex: `'lundi'` → `'this_week lundi'`)
- `branchComplete` avec `targetLevel=1` emballe les branches `repeat` dans une couche mois : `{type:'branch', value:['this_month', <inner_branch_with_repetition>]}`
- `getNextPrevBranch` gère ce cas par récursion : si `weekId` absent au premier niveau, cherche un sous-branch imbriqué et y descend

---

## Tableau des cas (direction = +1)

| type | slot | slotPath | résultat |
|------|------|----------|----------|
| unique | `this_week lundi` | `this_week mercredi` | `null` |
| unique | `this_week vendredi` | `this_week mercredi` | `SlotPath('this_week vendredi')` |
| unique | `this_week mercredi` | `this_week mercredi` | `null` |
| unique | `this_week` | `this_week mercredi` | `SlotPath('this_week')` |
| unique | `next_week` | `this_week mercredi` | `SlotPath('next_week')` |
| unique | `this_week` | `next_week lundi` | `null` |
| multi | `this_week mardi jeudi` | `this_week mercredi` | `SlotPath('this_week jeudi')` |
| multi | `this_week jeudi vendredi` | `this_week mercredi` | `SlotPath('this_week jeudi')` |
| multi | `this_week lundi mardi` | `this_week mercredi` | `null` |
| multi | `this_week mardi mercredi` | `this_week mercredi` | `null` |
| multi | `this_week mercredi jeudi` | `this_week mercredi` | `SlotPath('this_week jeudi')` |
| repeat ×1 | `every 1 this_week lundi` | `this_week mercredi` | `SlotPath('next_week lundi')` |
| repeat ×2 | `every 2 this_week lundi` | `this_week mercredi` | `SlotPath('following_week lundi')` |
| repeat ×2 | `every 2 this_week vendredi` | `this_week mercredi` | `SlotPath('this_week vendredi')` |
| repeat ×2 | `every 2 next_week lundi` | `this_week mercredi` | `SlotPath('next_week lundi')` |
| sans semaine | `vendredi` (complété → `this_week vendredi`) | `this_week mercredi` | `SlotPath('this_week vendredi')` |
| mois futur | `next_month` | `this_month this_week mercredi` | `SlotPath('next_month')` |
| mois courant, actif | `this_month` | `this_month this_week mercredi` | `SlotPath('this_month')` (`'inclusive'`) |
| mois courant, fait | `this_month` | `this_month this_week mercredi` | `null` (`'strict'`) |
| multi-mois, fait | `this_month next_month` | `this_month this_week mercredi` | `SlotPath('next_month')` (`'strict'`) |
| heure future | `this_week mercredi aprem` | `this_week mercredi matin` | `SlotPath('this_week mercredi aprem')` |
| heure passée | `this_week mercredi matin` | `this_week mercredi aprem` | `null` |
| même heure, actif | `this_week mercredi matin` | `this_week mercredi matin` | `SlotPath('this_week mercredi matin')` (`'inclusive'`) |
| même heure, fait | `this_week mercredi matin` | `this_week mercredi matin` | `null` (`'strict'`) |
| jour futur avec heure | `this_week vendredi matin` | `this_week mercredi aprem` | `SlotPath('this_week vendredi matin')` |
| multi-heures, première passée | `this_week mercredi matin aprem` | `this_week mercredi matin` | `SlotPath('this_week mercredi aprem')` |

---

## État d'avancement — feature complète ✅

| Fichier | État |
|---------|------|
| `src/data/slot-next-prev.js` | ✅ implémenté — niveaux mois/semaine/jour/heure, multi-jours, multi-heures, multi-mois, repeat, `comparison` |
| `src/data/slot-next-prev.test.js` | ✅ 34 tests |
| `src/data/task.js` | ✅ `getTaskNextSlotLabel` — `comparison` selon `task.status` ; `getCurrentPathExpr(4)` |
| `src/data/task.test.js` | ✅ 8 tests pour `getTaskNextSlotLabel` (dont 4 avec status) |
| `src/data/slot-id.js` | ✅ `getSlotIdNextPrev` utilisé tel quel |
| `src/data/slot-path.ts` | ✅ `SlotPath.toExpr()` utilisé pour l'affichage |
| `src/components/task-dialog.jsx` | ✅ champ lecture seule "Prochain créneau" |
| `src/components/task-list.jsx` | ✅ en-tête de colonne "Prochain slot" |
| `src/components/task-row.jsx` | ✅ cellule correspondante |
