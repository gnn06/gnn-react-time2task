# Plan d'exécution — vision relative jour (`today`/`tomorrow`)

> Plan d'implémentation par phases. Conception de référence :
> `docs/slot-model-spec.md` (règles), `docs/slot-types-design.md` (types + `SLOT_DEFS`),
> `docs/slot-view-spec.md` (affichage). Branche : `feat_today`.

## Conventions (toutes phases)

- **TDD** : test rouge d'abord, puis implémentation au vert (cf. `CLAUDE.md`).
- Après chaque incrément : `npx tsc --noEmit` + `npx vitest run` verts.
- **Demander avant de committer** ; message une ligne.
- Filet : tests golden `src/data/slot-id.defs.test.js` + suite existante.
- Terminologie : **séquence de navigation** par famille (pas « cycle » :
  `getSlotIdNextPrev` parcourt une liste ordonnée finie + débordement en shift `+ n`).

## Vue d'ensemble des phases

| Phase | Objet | Statut |
|---|---|---|
| **A** | `SLOT_DEFS` source unique + classifieurs famille/rôle | ✅ fait |
| **B** | Modèle : ancre jour `today`/`tomorrow` (valides, stockables, navigables, aliasées) | ✅ fait |
| **C** | Affichage : C1 vue par famille (v1 temporaire) · C2 projection croisée (+ snapDate jour) | ⏳ en cours |
| **D** | Sélecteur : UI de choix relatifPresent / relatifParent | à venir |
| **E** | Roulement : « Démarrer Jour » (`branchShift` famille-aware + snapDate jour roulé) | à venir |
| **F** | Complément relatifParent semaine : `semaine N du mois` | futur |
| **G** | Famille `absolu` : `mars`, `jour N de l'année`, `semaine N de l'année` | futur |

---

## Phase A — `SLOT_DEFS` source unique ✅

Descripteur unique des slots dans `slot-id.js` ; `SLOTIDS_LST`, `SLOTIDS_BY_LEVEL`,
`weight`, `getSlotIdLevel` dérivés ; classifieurs `getSlotIdFamily`/`isAnchor`/
`isComplement`. Golden de caractérisation `slot-id.defs.test.js`.

## Phase B — ancre jour `today`/`tomorrow` ✅

`today`/`tomorrow` = ancres relatifPresent niveau 3, valides/stockables/navigables/
parsables/aliasées. `lundi..vendredi` inchangés. **Vues inchangées** (les tâches
`today` ne s'affichent pas encore — c'est la phase C).

- **B1** ✅ FAIT — Navigation routée **par famille** : `ANCHOR_IDS_BY_LEVEL` /
  `COMPLEMENT_IDS_BY_LEVEL` dérivés ; `getSlotIdNextPrev/Previous/Index` routent via
  `isAnchor`/`isComplement`. `SLOTIDS_BY_LEVEL` ne sert plus qu'au catalogue
  d'affichage / au nombre de niveaux / à `getSlotIdFirstLevel`.
- **B2** ✅ FAIT — Ajout `today`/`tomorrow` dans `SLOT_DEFS` (ancre niveau 3). `SLOTIDS_BY_LEVEL`
  re-dérivé (« compléments du niveau s'ils existent, sinon ancres ») ⇒ `['3']` reste
  `[lundi..vendredi]`.
- **B3** ✅ FAIT — Alias `today + 1` → `tomorrow` dans `_branchAlias`.

---

## Phase C — Affichage ⏳

### C1 — Vue par famille (v1 TEMPORAIRE, partition)

Objectif : *voir* le modèle relatif jour rendu, sans mixage ni projection. Spec :
`docs/slot-view-spec.md` § « Vue par famille — v1 TEMPORAIRE ». Deux incréments, un par
vue (ordre recommandé : C1a puis C1b).

> ⚠️ **CARACTÈRE TEMPORAIRE — invariant cassé** (C1a + C1b) : « toutes les tâches
> visibles » n'est plus vrai par vue ; une tâche n'est visible que dans la vue de sa
> famille (les `this_week`/`this_month` imprécis quittent le tree). Assumé pour la v1,
> **rétabli en C2** (projection croisée). Entre C1a et C1b, certaines tâches peuvent être
> temporairement non placées.

**Routage commun (partition)** par la famille du **slot jour** (heure ignorée) :
complément relatifParent jour (`lundi..vendredi`) → **tree** ; sinon (purement
relatifPresent : `today`/`tomorrow`, ou `this_week`/`this_month` sans jour) → **list**.
⇒ prédicat de routage partagé (ex. `taskHasRelatifParentDay`), testé isolément.

**C1a — vue tree (filtre)** ✅ FAIT
- Introduire le prédicat de routage (testable seul).
- Filtrer le tree pour n'afficher que les tâches à **jour relatifParent** ; structure du
  tree **inchangée**.
- Tests : `this_week mardi` reste ; `today` / `this_week` seul / `this_month` seul
  **disparaissent** du tree.

**C1b — vue list (axe relatifPresent)** ✅ FAIT
- Réécrire `defaultSlotViewList` / `slotviewlist.jsx` : axe **jour** = ancres
  `today`/`tomorrow` (paths standalone) au lieu des weekdays.
- Filtrer la list sur les tâches **purement relatifPresent** (négation du prédicat).
- Fix `getSlotsForRow` : fallback `middle=0` quand le path `today`/`tomorrow` ne correspond
  pas à `getCurrentPathExpr(3)` — `today` atterrit en colonne Present.
- Tests : une tâche `today` rendue sous un slot `today` ; `this_week`/`this_month` seuls
  présents ; `this_week mardi` absente.

**Hors C1** : dates niveau jour (C2), `tomorrow` franchissant le vendredi (C2), marqueur
de nature (C2), filtrage par nature.

### Idée
- Probable intégrer les taches avec répétitions dans la vue Tree. C'est surtout ce discréminant qui a du sens. L'usage des slot relatifParent n'est qu'une conséquence de la répétition
- réfléchir aux tâches hybrique  qui ont du relatifNow et relatifParent. par exemple le cas (every week jeudi et today). Ca correspond à une tache réguliere qui n'a pas été fini sur son jour normal et qui doit être traité en plus. vérifier si on la voit bien
- Afficher simutanement les 2 modes de visualisation tree et list
- on peut rajouter un slot yesterday (ça serait le premier slot dans le passé)

### C2 — Projection croisée (rétablit l'invariant) ⏳

Objectif : toute tâche visible dans **les deux** vues via projection by the snapDate jour.
`getSlotIdCurrent(3)` **reste** le weekday civil — le « jour courant relatif » est
trivialement `today`, géré côté appelant.

**C2a ✅ FAIT — snapDate jour** (`slot-date.js`)
- `getDefaultDates()` ajoute `{slotid:'today', date:<auj.>}`.
- `getDate()` niveau 3 : `today` → snapDate.date ; `tomorrow` → +1j ; weekday →
  `snapDate_semaine + (weight[id] - 1)` jours.
- `shiftDate('day')` → +1 jour.

**C2b ✅ FAIT — Projection tree** (`slotviewtree.jsx`, `task.js`, `slot-branch.js`)
- `branchGetRelatifPresentDayId(branch)` dans `slot-branch.js` : retourne l'ancre level-3
  relatifPresent (`today`/`tomorrow`) ou null (analogue à `branchHasRelatifParentDay`).
- `taskRelativePresentToParent(task, snapDates)` dans `task.js` : projette `today`/`tomorrow`
  → weekday via `getDate` (C2a) ; gère le contexte semaine (this_week/next_week) et mois ;
  préserve l'heure (matin/aprem) ; retourne null pour les weekends.
  Si `today` absent de la DB (avant Phase E), utilise `getDefaultDates()` comme référence
  cohérente — évite l'incohérence entre un `today` fallback et un `this_week` périmé.
- `SlotViewTree` récupère snapDates via `useGetSnapDatesQuery()` ; calcule `projectedTasks`
  (tâches relatifPresent projetées) et les fusionne avec `relatifParentTasks`.
- ⚠️ **À vérifier en Phase E** : une fois `today` stocké en base via « Démarrer Jour »,
  vérifier que la projection se positionne sur le bon slot (snapDate DB vs VITE_FAKE_NOW).

**C2b-bis ✅ FAIT — Tâches imprécises dans le tree** (`slotviewtree.jsx`, `task.js`)
- Décision : `this_week`/`this_month` seuls (et `next_week`/`next_month`) doivent aussi
  apparaître dans le tree (lignes Semaine/Mois), comme `today` apparaît dans la colonne Jour.
- Implémentation finale (refactor) : `treeTasks = tasks.map(t => taskRelativePresentToParent(t, snapDates) ?? t)`.
  Les tâches sans ancre relatifPresent passent directement (fonction retourne null → `?? t`) ;
  `today`/`tomorrow` sont projetés. Si la projection échoue (ex: `tomorrow` un vendredi →
  weekend), la tâche originale est préservée et apparaît dans la ligne Semaine.
- Prédicat `taskHasRelatifPresentDay` disponible dans `task.js` (non utilisé dans le
  composant, sert à la lisibilité et aux tests).

**C2c ✅ FAIT — Projection list** (`slotviewlist.jsx`, `task.js`, `slot-branch.js`)
- `branchGetRelatifParentDayId` dans `slot-branch.js` (symétrique de `branchGetRelatifPresentDayId`).
- `taskRelativeParentToPresent(task, snapDates)` dans `task.js` : projette `mardi`/etc.
  → `today` ou `tomorrow` si leur date correspond ; null sinon (heure préservée).
- `SlotViewList` : `tasks.map(t => taskRelativeParentToPresent(t, snapDates) ?? t)`.
  Invariant maintenu : les weekday ≠ today/tomorrow restent visibles tels quels.
- Les tâches projetées conservent `originalSlotExpr` ; `task-dialog.jsx` et
  `slot-selection-button.jsx` utilisent `originalSlotExpr ?? slotExpr` pour l'affichage.
- ⚠️ **À vérifier** : le double stockage de slotExpr. Vérifier que le bon slotExpr est utilisé partout.

**C2d — Marqueur de nature** (`slot.jsx` ou `slot-title.jsx`) — optionnel, après C2b+C2c
- Indicateur visuel rolling (relatifPresent) / fixe (relatifParent) / récurrent.

**Fichiers par étape** :

| Étape | Fichiers |
|---|---|
| C2a ✅ | `slot-date.js`, `slot-date.test.js` |
| C2b ✅ | `slot-branch.js`, `task.js`, `slotviewtree.jsx` |
| C2b-bis ✅ | `task.js`, `task.test.js`, `slotviewtree.jsx` |
| C2c ✅ | `slotviewlist.jsx`, `task.js`, `slot-branch.js`, `task-dialog.jsx`, `slot-selection-button.jsx` |
| C2d | `slot.jsx` ou `slot-title.jsx` |

**Risques** :
- `weight['today']` (=1) non commensurable au cycle `lundi..vendredi` (1..5) : tri/distance
  inter-familles niveau jour devra passer par projection via snapDate, pas par `weight`.
- **C2b/C2c — originalSlotExpr à vérifier** : la couverture de test de la projection
  (detail dialog, slot-selection-button, getTaskNextSlotLabel) est partielle. À valider
  manuellement sur plusieurs cas (today/tomorrow côté tree, mercredi=today côté list,
  heure préservée) avant de considérer C2 stable.

---

## Phase D — Sélecteur

UI du slot-picker (`slot-picker*.jsx`) pour choisir, à l'affectation d'une tâche, entre
jour **roulant** (`today`/`tomorrow`) et jour **fixe** (`mardi`).

## Phase E — Roulement « Démarrer Jour »

- `branchShift` (`slot-branch++.js`) **conscient de la famille** : un Démarrer de niveau
  L ne roule que les ancres **relatifPresent** de L ; laisse compléments et absolus
  fixes ⇒ « Démarrer Jour » roule `tomorrow→today`, laisse `mardi` fixe.
- `slot-date.js` : `shiftDate('day')` ✅ C2a ; `getSnapDateToSave` niveau jour.
- `action-shift.jsx` : 3ᵉ option `day`.
- Tests : roulement jour ; non-régression `branchShift('week'|'month')` ; **`'day'` ne
  touche pas `mardi`**.

## Phase F — Complément semaine `semaine N du mois` (futur)

Complément relatifParent niveau 2 raffinant le mois. La règle « famille » de
`branchShift` s'appliquera aussi au niveau semaine. Même patron que les weekdays.

## Phase G — Famille `absolu` (futur)

`mars` (mois de l'année), `semaine N de l'année`, `jour N de l'année` : ancres
auto-localisantes **fixes** (ne roulent pas). Exige un niveau année.

## Phase H — Filtre par nature (futur)

Filtrer les vues pour n'afficher que les tâches `isFixed` (complement relatifParent :
`lundi..vendredi`) ou `isRolling` (ancre relatifPresent : `today`/`tomorrow`).
S'appuie sur `taskHasRelatifParentDay` / `taskHasRelatifPresentDay` déjà disponibles.
