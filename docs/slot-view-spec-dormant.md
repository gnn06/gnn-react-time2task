# Vue des slots — alternatives écartées (code dormant)

> Ce fichier archive des approches **conçues, implémentées, puis désactivées** au passage
> à la « vérité unique ». Elles ne sont plus câblées dans l'UI, mais leur code subsiste
> **dormant** dans `src/data/task.js` (non supprimé, réactivable). La spec en vigueur est
> `docs/slot-view-spec.md` ; ce document n'a de valeur que pour comprendre le code dormant
> ou reprendre une de ces pistes.

---

## 1. Partition par famille — v2

**Statut** : plus appliquée. Le tree ne filtre plus par famille (il dispose toutes les
tâches filtrées, cf. vérité unique). Fonctions dormantes : `getListTasks` /
`getListTasksFiltered` dans `src/data/task.js`.

Chaque vue affichait un sous-ensemble de tâches selon la famille du slot JOUR.

| slotExpr | Tree | List |
|---|---|---|
| `this_week lundi`, `this_week lundi matin` | ✓ | ✗ |
| `today`, `tomorrow`, `today matin` | ✗ | ✓ |
| `this_week` seul, `this_month` seul (imprécis) | ✗ | ✓ |
| `today vendredi` (mixte) | ✓ | ✓ |

- **Tree** : `taskHasRelatifParentDay(t)` — a un jour relatifParent (`lundi`..`vendredi`).
- **List** : `!taskHasRelatifParentDay(t) || taskHasRelatifPresentDay(t)` — pas de jour
  relatifParent, OU a un jour relatifPresent (les mixtes sont dans les deux vues).

Tâches mixtes (`today vendredi`) : Tree sous le weekday `vendredi` (la partie `today` ne
crée pas de colonne) ; List sous `today` via `_chooseSlotForSortBranch` (priorité `today`).

Note famille/weight : `today` (relatifPresent, weight=1) ne matche pas `lundi`
(relatifParent, weight=1) — `isBranchEqualShallow` vérifie la famille avant le weight.

---

## 2. Projection des weekdays dans la list — flag `includeWeekDays`

**Statut** : plus câblée (checkbox retirée, champ retiré de `SlotViewConf`). Primitives
dormantes dans `src/data/task.js` : `taskRelativeParentToPresent`, `slotPathToPresent` ;
câblage `getListTasksFiltered`. Décision reportée : **bubbling** (retenu, cf. spec en
vigueur) vs **projection** (cette section).

Motivation : deux phases de la journée. Le matin on *planifie* (tree par weekday, list par
today/tomorrow) ; une fois la journée lancée on *exécute* et on veut voir d'un coup toutes
les tâches qui tombent aujourd'hui, qu'elles soient arrivées via `today` (relatifPresent)
ou via `lundi` (relatifParent, parce qu'on est lundi).

Le flag `includeWeekDays: boolean` (défaut `false`, **list uniquement**) incluait les
tâches purement relatifParent-day dans la list, après **projection** de leur jour sur le
cadre relatifPresent.

### Règle de projection

Pour un jour weekday relatifParent, soit `offset = weekday(jour) − weekday(aujourd'hui)` :

| offset | Projection du token jour | Colonne |
|---|---|---|
| 0 | jour → `today` | today |
| 1 | jour → `tomorrow` | tomorrow |
| autre (< 0 ou ≥ 2) | troncature du jour (et de l'heure sous-jacente) | `this_week` (Present), via bubbling |

En une ligne : projeter le jour sur `today`/`tomorrow` si `offset ∈ {0,1}` ; sinon tronquer
le jour → remontée à `this_week`.

- La projection est une **réécriture du token jour** ; placement et bubbling font le reste.
- **Niveau heure** : projetable avec le jour (`this_week lundi matin`, offset 0 → `today
  matin`) ; si le jour n'est pas projetable, la troncature emporte l'heure → `this_week`.
- **Troncature** : remonte au parent semaine `this_week`, pas à `this_month`.
- **Périmètre** : seuls les weekdays de `this_week` sont projetables. Un weekday d'une autre
  semaine (`next_week mercredi`) tombe directement en troncature vers son parent
  (`next_week`…), sans comparaison today/tomorrow.
- **Perte de distinction assumée** : retard (offset < 0) et à-venir (offset ≥ 2) atterrissent
  tous deux dans `this_week`. Acceptable tant que `yesterday` n'existe pas.
- **Forward-compatible** : à l'arrivée de `yesterday`, insérer `offset −1 → yesterday` avant
  le fallback.

Quand `includeWeekDays` valait `false`, le routage de la partition v2 (section 1)
s'appliquait inchangé.

---

## Pourquoi bubbling plutôt que projection (rappel)

Le modèle retenu (spec en vigueur) n'écrit **jamais** la donnée `slotExpr` : today/tomorrow
et les weekdays restent des créneaux distincts (familles séparées), positionnés par
alignement de colonne (`getRollingDayColumnId`), pas par réécriture. Le pire cas d'une
incohérence de snapDate est alors un décalage **cosmétique**, jamais une tâche perdue ou
déplacée — au prix d'un affichage éventuel en double (tâche mixte) et de sections
`rollingDays`/`weekDays` distinctes plutôt qu'une fusion.
