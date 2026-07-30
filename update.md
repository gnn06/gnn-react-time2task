# Fix : slot following_week + N absent de la vue tree

## Problème
Une tâche avec le slot `following_week + 1` apparaissait sous `this_month` dans la vue tree.  
Cause : `slotViewFilter` ne génère des nœuds qu'à partir de `SLOTIDS_BY_LEVEL` — aucun nœud pour les slots décalés (`following_week + N`). La tâche remontait vers son ancêtre le plus proche existant dans l'arbre.

La mécanique pour injecter les nœuds manquants existait déjà (`slotViewFilterSelection` + `slotViewAdd`), mais elle n'était utilisée que dans `slot-select-dialog.jsx` — oubli d'appel dans la vue principale.

## Ce qui a été fait

### Tests (slot-view.test.js)
- `isCleanSlotPath` : 7 tests couvrant les cas valides et les rejets (keyword `every`, nombre pur, séparateur `|`, deux slots de même niveau)
- `slots offset` : 3 tests documentant l'oubli d'appel à `slotViewFilterSelection` (verts)
- `slotViewList — following_week absent` : 1 test rouge intentionnel (vue list, fix différé)

### Fix vue tree (slotviewtree.jsx)
- Remplace `slotViewFilter(conf)` par `slotViewFilterSelection(conf, taskPaths)`
- `taskPaths` = `getBranchHash(branchComplete(parser.parse(t.slotExpr)))` IDizé pour chaque tâche
- `getBranchHash` gère nativement les chemins incomplets (via `branchComplete`), les keywords, les multi-slots et les alias — plus besoin de `isCleanSlotPath` dans ce composant

### isCleanSlotPath (slot-view.ts)
Validateur de chemin IDizé : tous les tokens doivent être des slot IDs valides avec des niveaux strictement croissants.  
Rejette notamment : `["every", "1", ...]`, `[..., "|", ...]`, `["this_month", "next_month"]`.  
Exportée et testée — utile comme garde-fou pour d'autres appelants futurs (ex: vue list).

### Autres
- Commentaire ajouté sur `slotViewFilterSelection`
- Changelog mis à jour
- Commit sur branche `fix_missing_shifted_slot`

## Ce qui reste à faire

### Vue list — following_week absent
`defaultSlotViewList` ne construit que `this_week` + `next_week`. `following_week` et les offsets sont absents.  
Test rouge en place. Fix différé : réflexion UX préalable nécessaire (placement dans la grille Past/Present/Future).

### ~~Doute ouvert sur findTaskBySlotExpr~~ — résolu
`isSlotEqualOrInclude` applique `branchComplete` aux deux arguments : un `slotExpr = "following_week + 1"` (incomplet) est correctement comparé au nœud injecté `"this_month following_week + 1"`. La tâche apparaît bien sous son nœud.  
Invariant documenté dans le JSDoc de `isSlotEqualOrInclude` (`slot-expr.js`).

### ~~Bug : levelMaxIncluded ignoré en vue tree~~ — corrigé
`slotViewFilterSelection` forçait `levelMaxIncluded: null`, écrasant le réglage utilisateur.  
Fix : suppression du forçage dans `slotViewFilterSelection` ; `slot-select-dialog.jsx` passe explicitement `null` ; `slotviewtree.jsx` tronque les chemins injectés au `levelMaxIncluded` du conf.  
Test ajouté avant le fix (`levelMaxIncluded: 2 — les nœuds de niveau 3+ sont exclus`).

### ~~Cas complexes (multi-slot, répétitions)~~ — validé
- **Multi-slot** : couvert par les tests existants (`hashBranch/multi`, `grouping/multi` dans `task.test.js`)
- **Répétition** (`every N`) : `repetition` ignorée par `getBranchHash`, la tâche se groupe sur le slot de base. Nouveau test ajouté dans `slot-branch-basic.test.js`.
