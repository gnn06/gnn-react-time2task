# Plan d'exécution — vision relative jour (`today`/`tomorrow`)

> Plan d'implémentation par phases. Conception de référence :
> `docs/slot-model-spec.md` (règles), `docs/slot-types-design.md` (types + `SLOT_DEFS`),
> `docs/slot-view-spec.md` (affichage). Branche : `feat_today`.

## Conventions (toutes phases)

- **TDD** : test rouge d'abord, puis implémentation au vert (cf. `CLAUDE.md`).
- Après chaque incrément : `npx tsc --noEmit` + `npx vitest run` verts.
- **Demander avant de committer** ; message une ligne.
- Filet : tests golden `src/data/slot-id.defs.test.js` + suite existante.

## Vue d'ensemble des phases

| Phase | Objet | Statut |
|---|---|---|
| **A** | `SLOT_DEFS` source unique + classifieurs famille/rôle | ✅ fait |
| **B** | Modèle : ancre jour `today`/`tomorrow` (valides, stockables, navigables, aliasées) | ✅ fait |
| **C** | Affichage : projection croisée (tree + list) + marqueur de nature | ✅ fait |
| **D** | Sélecteur : UI de choix relatifPresent / relatifParent | ✅ fait (D5 pureté vue + `disables aux limites` + répétition/disable sur `today` : TODO différés) |
| **E** | Roulement : « Démarrer Jour » (`branchShift` famille-aware + snapDate jour roulé) | ✅ fait (label bouton cosmétique : TODO différé) |
| **F** | Complément relatifParent semaine : `semaine N du mois` | futur |
| **G** | Famille `absolu` : `mars`, `jour N de l'année`, `semaine N de l'année` | futur |
| **H** | Filtre par nature (isFixed / isRolling) | futur |

---

## Phase A — `SLOT_DEFS` source unique ✅

`SLOT_DEFS` source unique dans `slot-id.js`. Classifieurs `getSlotIdFamily`/`isAnchor`/`isComplement`.
`ANCHOR_IDS_BY_LEVEL` / `COMPLEMENT_IDS_BY_LEVEL` dérivés. Navigation `getSlotIdNextPrev` routée par famille.
Golden `slot-id.defs.test.js`.

## Phase B — ancre jour `today`/`tomorrow` ✅

`today`/`tomorrow` = ancres relatifPresent niveau 3 dans `SLOT_DEFS`. Valides/stockables/navigables/parsables.
Alias `today + 1` → `tomorrow`. `SLOTIDS_BY_LEVEL['3']` reste `[lundi..vendredi]` (compléments en priorité).

## Phase C — Affichage ✅

Toute tâche visible dans les **deux** vues par projection croisée via snapDate jour.

- **C2a** — `getDefaultDates()` ajoute `today` ; `getDate()` niv. 3 gère today/tomorrow/weekdays.
- **C2b/C2b-bis** — `taskRelativePresentToParent` projette today/tomorrow → weekday dans le tree.
  `tasks.map(t => fn(t, snapDates) ?? t)` — invariant garanti, tâches imprécises incluses.
- **C2c** — `taskRelativeParentToPresent` projette weekday → today/tomorrow dans la list.
  Tâches projetées portent `originalSlotExpr` ; dialog/slot-button utilisent `originalSlotExpr ?? slotExpr`.
- **C2d** — Icône `PushPin` sur tâches à jour fixe (`taskHasRelatifParentDay` sur `originalSlotExpr ?? slotExpr`).

**Risques restants** :
- `originalSlotExpr` à vérifier dans `getTaskNextSlotLabel` et autres composants.
- En Phase E : vérifier projection vs snapDate DB après « Démarrer Jour ».

---

## Phase D — Sélecteur

### Objectif

Permettre à l'utilisateur d'affecter `today`/`tomorrow` à une tâche via le slot-picker
graphique (bouton "Choix créneau"). Actuellement le picker n'affiche que les weekdays.

### Spec UI — Option B : intégrés sous `this_week`

`today`/`tomorrow` apparaissent **aux côtés des weekdays** sous le nœud `this_week` du
picker, avec sous-slots `matin`/`aprem`. L'utilisateur voit les deux familles sans toggle.

```
this_month
  this_week
    [today]   [tomorrow]   [lundi]   [mardi]   [mercredi]   [jeudi]   [vendredi]
  next_week …
next_month …
```

**Contrainte clé** : `today`/`tomorrow` ont des **chemins autonomes** (`path: 'today'`),
pas hiérarchiques. Même affichés sous `this_week`, leur `path` doit rester `'today'` pour
que `selectionMapToExpr` produise l'expression `today` (et non `this_month this_week today`).
`selectionToTree` ignore les clés vides, et `isInsideSelected` est compatible avec les
chemins standalone — aucune modification de ces fonctions n'est nécessaire.

Conséquence : quand `today` est sélectionné, `this_week` ne s'affiche pas en bleu clair
(les chemins ne sont pas hiérarchiquement liés). Comportement correct et assumé.

### Séquence d'étapes

**D1 — Injection dans le picker** (1 fichier, résultat visuel + fonctionnel immédiat)

Dans `src/components/slot-select-dialog.jsx`, post-traitement de `slotsFromConf` :

1. Définir hors composant :
```jsx
const PRESENT_DAY_SLOTS = [
    { id: 'today',    path: 'today',    inner: [
        { id: 'matin', path: 'today matin',    inner: [] },
        { id: 'aprem', path: 'today aprem',    inner: [] },
    ]},
    { id: 'tomorrow', path: 'tomorrow', inner: [
        { id: 'matin', path: 'tomorrow matin', inner: [] },
        { id: 'aprem', path: 'tomorrow aprem', inner: [] },
    ]},
]
```

2. Post-traitement qui injecte ces slots sous `this_week` et filtre le niveau racine
   (évite la duplication quand `makeSlotWithSelection` injecte `today` à la racine) :
```jsx
function withPresentDaySlots(slots) {
    return slots
        .filter(s => s.id !== 'today' && s.id !== 'tomorrow')
        .map(slot => {
            if (slot.id !== 'this_month') return slot
            return {
                ...slot,
                inner: slot.inner.map(week => {
                    if (week.id !== 'this_week') return week
                    return { ...week, inner: [...PRESENT_DAY_SLOTS, ...week.inner] }
                })
            }
        })
}
```

3. Remplacer dans le rendu :
```jsx
{withPresentDaySlots(slotsFromConf).map((slot, index) => <SlotTreeSelect .../>)}
```

**D2 — Tests** : `src/components/slot-select-dialog.test.jsx` (nouveau)

- `today` et `tomorrow` présents dans le picker (`[data-slot-path="today"]`)
- `today matin` / `today aprem` présents
- Quand `selectionExpr = 'today'` : nœud `today` sélectionné (classe `bg-blue-400`)

**Fichiers par étape** :

| Étape | Fichiers |
|---|---|
| D1 | `src/components/slot-select-dialog.jsx` |
| D2 | `src/components/slot-select-dialog.test.jsx` (nouveau) |

Pas de changement dans `slot-view.ts`, `SLOTIDS_BY_LEVEL`, `slotViewFilter`, `selection-tree.js`.

**D3 — Couverture complète des transitions d'état** ✅

Réducteur pur `src/data/slot-selection.js` (seul point de vérité, importé par le composant
ET les tests) : `exprToSelection`/`selectionToExpr`/`selectionToggle` (+ répétition, disable,
shift). Tests `src/data/slot-selection.test.js` couvrant ouverture, raffinage, accumulation,
remontée/désélection, récurrence + today, shift d'un motif récurrent.

> D3 avait d'abord modélisé `today`/`tomorrow` en **ancres autonomes** (accumulation
> multi-racine). Voir **D4** : revu en feuilles localisées.

**D4 — `today`/`tomorrow` en feuilles localisantes** ✅

Pour que le raffinage de `this_week` en `today` soit **homogène** avec le raffinage de
`this_month` en `this_week`, `today`/`tomorrow` deviennent des **feuilles localisées niveau 3**
sous `this_week` (`this_month this_week today`), comme un weekday — au lieu d'ancres autonomes.

- `slot-select-dialog.jsx` : `PRESENT_DAY_SLOTS` à chemins localisés.
- `slot-selection.js` : `normalizePresentDayKeys` / `orderForest` / `PRESENT_DAY_IDS` supprimés ;
  `selectionToggle` générique gère le raffinage `this_week`→`today` sans cas particulier.
- `this_week` + clic `today` → `this_month this_week today` (raffinage) ; `today` + `mardi` →
  `this_month this_week today mardi` (multi niveau 3).
- Impact vérifié : projection (`task.js`) robuste au préfixe ; `branchComplete` localise déjà
  `today` ; roulement (Phase E) non implémenté. Spec maj (`slot-model-spec.md` §4/§5).
- **Reste** : `test.todo` *disables aux limites*.

**D5 — Pureté de la vue (TODO TECHNIQUE plus tard)**

Comportement du picker : couvert via `docs/slot-picker.test.md` + `src/data/slot-selection.test.js`.

Reste : la UI de `slot-select.jsx` n'est pas pure par rapport au modèle `isInside` — elle
reconstruit l'état d'affichage (`selected`/`isInside`/`isDirectParentOfRelativeSelection`/`disable`)
depuis la Map brute, et `isInside` est recalculé en double dans `slot-tree-select.jsx`.
Direction : extraire ces dérivations (sélecteur dans `slot-selection.js` ou props calculées
depuis le dialog).

---

## Phase E — Roulement « Démarrer Jour »

### E0 — Stockage DB du snapDate jour ✅ (actionnable sans code)

Row `SnapDates` : `{slotid: 'today', date: 'YYYY-MM-DD'}`.
`getDate()` et `getDefaultDates()` le lisent déjà (Phase C). L'utilisateur peut insérer
la ligne manuellement dans Supabase pour gérer le snap à la main.

### E1 — Bugs à corriger (prérequis au bouton « Démarrer Jour »)

**E1a — `getSlotIdFirstLevel(3)` retourne `'lundi'`** (au lieu de `'today'`).
`SLOTIDS_BY_LEVEL['3']` = weekdays (compléments en priorité).
Fix : ajouter `getSnapSlotId(levelID)` dans `slot-date.js` → `'this_month'`/`'this_week'`/`'today'`
(s'appuie sur `ANCHOR_IDS_BY_LEVEL`), et l'utiliser dans `action-shift.jsx:63` à la place de
`getSlotIdFirstLevel(getSlotIdLevel(level.value))`.

**E1b — `getDateString` ne gère pas le niveau 3** → `getSnapDateToShow('day', …)` retourne `""`.
Fix : ajouter `else if (level === 3) { return getISODate(date) }` dans `slot-date.js:133`.

**E1c — `branchShift` non conscient de la famille au niveau 3** (`slot-branch++.js:107`).
Avec `levelToShift = 'day'`, les compléments `lundi..vendredi` (level 3) seraient décalés
(`mardi → lundi`) alors qu'ils doivent rester fixes.
Fix : n'appliquer le shift que sur les slots `relatifPresent` quand `levelToShift` est générique :
```js
const shouldShift = getSlotIdLevel(branch) === getSlotIdLevel(levelToShift)
    && (getSlotIdFamily(levelToShift) !== 'generic'
        || getSlotIdFamily(branch) === 'relatifPresent');
```

### E2 — Implémentation (non prioritaire)

| Fichier | Modification |
|---------|-------------|
| `src/data/slot-date.js` | `getDateString` (E1b) + `getSnapSlotId` (E1a) |
| `src/data/slot-branch++.js` | `branchShift` family-aware (E1c) |
| `src/data/task.js` | `taskShiftFilter` cas `'day'` (filtrer `tomorrow`) |
| `src/components/action-shift.jsx` | Option `{value:'day'}` + `getSnapSlotId` (E1a) |

Tests TDD :
- `branchShift('tomorrow', 'day')` → `'today'`
- `branchShift('today', 'day')` → `'today'` (plancher)
- `branchShift('this_week mardi', 'day')` → inchangé
- `getSnapSlotId('day')` → `'today'`
- `getSnapDateToSave('day', '2026-06-22')` → `'2026-06-23'`

## Phase F — Complément semaine `semaine N du mois` (futur)

Complément relatifParent niveau 2 raffinant le mois. Même patron que les weekdays.

## Phase G — Famille `absolu` (futur)

`mars`, `semaine N de l'année`, `jour N de l'année` : ancres fixes, ne roulent pas.

## Phase H — Filtre par nature (futur)

Filtrer les vues pour n'afficher que les tâches `isFixed` ou `isRolling`.
S'appuie sur `taskHasRelatifParentDay` / `taskHasRelatifPresentDay` déjà disponibles.
