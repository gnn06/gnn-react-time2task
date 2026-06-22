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

- **B1** — Navigation routée **par famille** : `ANCHOR_IDS_BY_LEVEL` /
  `COMPLEMENT_IDS_BY_LEVEL` dérivés ; `getSlotIdNextPrev/Previous/Index` routent via
  `isAnchor`/`isComplement`. `SLOTIDS_BY_LEVEL` ne sert plus qu'au catalogue
  d'affichage / au nombre de niveaux / à `getSlotIdFirstLevel`.
- **B2** — Ajout `today`/`tomorrow` dans `SLOT_DEFS` (ancre niveau 3). `SLOTIDS_BY_LEVEL`
  re-dérivé (« compléments du niveau s'ils existent, sinon ancres ») ⇒ `['3']` reste
  `[lundi..vendredi]`.
- **B3** — Alias `today + 1` → `tomorrow` dans `_branchAlias`.

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

**C1a — vue tree (filtre)**
- Introduire le prédicat de routage (testable seul).
- Filtrer le tree pour n'afficher que les tâches à **jour relatifParent** ; structure du
  tree **inchangée**.
- Tests : `this_week mardi` reste ; `today` / `this_week` seul / `this_month` seul
  **disparaissent** du tree.

**C1b — vue list (axe relatifPresent)**
- Réécrire `defaultSlotViewList` / `slotviewlist.jsx` : axe **jour** = ancres
  `today`/`tomorrow` (`ANCHOR_IDS_BY_LEVEL['3']`) au lieu des weekdays.
- Filtrer la list sur les tâches **purement relatifPresent** (négation du prédicat).
- Tests : une tâche `today` rendue sous un slot `today` ; `this_week`/`this_month` seuls
  présents ; `this_week mardi` absente.

**Hors C1** : dates niveau jour (C2), `tomorrow` franchissant le vendredi (C2), marqueur
de nature (C2), filtrage par nature.

### C2 — Projection croisée (rétablit l'invariant)

Toute tâche visible dans **les deux** vues via projection, par le **snapDate jour** :
- **snapDate jour** : `getDefaultDates` ajoute `{slotid:'today', date:<auj.>}` ;
  `getDate` gère le niveau 3 (projette `today`/`tomorrow` et weekday → date). Le slotid
  du snapDate jour = ancre `today` (helper « première ancre du niveau »
  `ANCHOR_IDS_BY_LEVEL[3][0]`).
- **projection** today ↔ weekday : afficher une tâche `today` aussi dans le tree (sur sa
  colonne weekday) et une tâche `mardi` aussi dans la list ; `tomorrow` un vendredi →
  `next_week`.
- marqueur visuel de **nature** (roulant / fixe / récurrent) ; filtrage par nature.

**Question ouverte — `getSlotIdCurrent(3)` doit-il être famille-aware ?** Pas tranché.
Hypothèse : il **reste** le weekday (jour courant absolu), le « jour courant relatif »
étant trivialement `today` géré côté appelant — **sans** modifier `getSlotIdCurrent`. À
trancher ici.

**Risques** :
- `weight['today']` (=1) n'est pas commensurable au cycle `lundi..vendredi` (1..5) : le
  tri/distance inter-familles au niveau jour (`getBranchWeight`, `slot-next-prev`) devra
  passer par une **projection via snapDate** plutôt que par `weight`.
- `getSlotNextPrev` : comparer une tâche `today` au « maintenant » via date projetée.

---

## Phase D — Sélecteur

UI du slot-picker (`slot-picker*.jsx`) pour choisir, à l'affectation d'une tâche, entre
jour **roulant** (`today`/`tomorrow`) et jour **fixe** (`mardi`).

## Phase E — Roulement « Démarrer Jour »

- `branchShift` (`slot-branch++.js`) **conscient de la famille** : un Démarrer de niveau
  L ne roule que les ancres **relatifPresent** de L ; laisse compléments et absolus
  fixes ⇒ « Démarrer Jour » roule `tomorrow→today`, laisse `mardi` fixe.
- `slot-date.js` : `shiftDate('day')` → +1 jour ; `getSnapDateToSave` niveau jour.
- `action-shift.jsx` : 3ᵉ option `day`.
- Tests : roulement jour ; non-régression `branchShift('week'|'month')` ; **`'day'` ne
  touche pas `mardi`**.

## Phase F — Complément semaine `semaine N du mois` (futur)

Complément relatifParent niveau 2 raffinant le mois. La règle « famille » de
`branchShift` s'appliquera aussi au niveau semaine. Même patron que les weekdays.

## Phase G — Famille `absolu` (futur)

`mars` (mois de l'année), `semaine N de l'année`, `jour N de l'année` : ancres
auto-localisantes **fixes** (ne roulent pas). Exige un niveau année.
