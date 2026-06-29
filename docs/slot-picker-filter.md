# Spécification — Picker de filtre-créneau

Le bouton **filtre-créneau** (`SlotPickerButton` → `SlotPicker` → `SlotPickerNode` →
`SlotPickerCard`) sert à restreindre la liste des tâches à un créneau. À distinguer du
**picker de tâche** (`slot-select-dialog`, cf. `slot-picker.test.md`), qui construit
l'expression de slot d'une tâche.

## Sélection

- **Mono-sélection** : un seul créneau actif à la fois. Cliquer un créneau remplace la
  sélection courante ; l'icône Clear (ou `onSlotChange(null)`) la vide.
- Pas d'accumulation, pas de répétition, pas de disable, pas de shift — toutes ces
  notions appartiennent au picker de tâche, pas au filtre.
- Le créneau choisi alimente `state.tasks.currentFilter.slot` et filtre via
  `isSlotEqualOrInclude(task.slotExpr, filter.slot)`.
- **SlotPanel — en vue list** : `filter.slot` est projeté via `slotPathToPresent` avant
  application : un weekday (ex. `mercredi`) est converti en `today` ou `tomorrow` si le
  jour correspond. Cela rend les filtres `mercredi` et `today` équivalents quand
  aujourd'hui est mercredi, en symétrie avec la projection des tâches weekday dans
  `getListTasksFiltered`.
- **SlotPanel — en vue tree** : aucune projection du filtre : `today` filtre les tâches
  stockées en `today`, `mercredi` filtre les tâches stockées en `mercredi`.
- **TaskPanel** : le filtre est appliqué directement sur les tâches brutes, sans
  projection et sans dépendance à la configuration de vue (list/tree, levelMaxIncluded,
  includeWeekDays…). Le TaskPanel ne dépend que de `currentFilter`.

## Catalogue affiché

Source : `slotViewPicker(DEFAULT_CONF)` = la grille absolue de `slotViewFilter`
(`SLOTIDS_BY_LEVEL`) **augmentée**, sous `this_week`, des ancres `relatifPresent`
`today`/`tomorrow`.

Sous `this_week`, les deux familles cohabitent côte à côte :

| | jour | heure |
|---|---|---|
| `relatifPresent` | `today`, `tomorrow` | `today matin/aprem`, `tomorrow matin/aprem` |
| `relatifParent`  | `lundi`…`vendredi` | `… matin/aprem` |

Ordre dans `this_week.inner` : `today`, `tomorrow`, puis `lundi`…`vendredi`.

## Sémantique des paths — divergence avec le picker de tâche

Les ancres relatives utilisent des **paths standalone** :

| créneau | path picker **filtre** | path picker **tâche** |
|---|---|---|
| today | `today` | `this_month this_week today` |
| today matin | `today matin` | `this_month this_week today matin` |
| tomorrow matin | `tomorrow matin` | `this_month this_week tomorrow matin` |
| lundi | `this_month this_week lundi` | `this_month this_week lundi` |

Raison : le filtre **matche** un `task.slotExpr` existant (où une tâche `relatifPresent`
est stockée en forme nue `today`), il ne **sauvegarde** pas une expression localisée. Les
weekdays `relatifParent`, eux, conservent leurs paths absolus dans les deux pickers.

## Rendu

Aligné sur le picker de tâche (`SlotSelect`) :

- non sélectionné : `bg-gray-100 hover:bg-gray-50` (carte grise délimitée) ;
- sélectionné : `bg-blue-400 hover:bg-blue-300` ;
- largeur/hauteur : `min-w-[8.5em] min-h-[5.5em]`, disposition `flex flex-row` au niveau
  des enfants de `this_week`.

`SlotPickerCard` ne gère **ni ancêtre** (pas de dégradé bleu sur la remontée) **ni
disable** — uniquement les deux états ci-dessus.
