# Spécifications fonctionnelles — Vue des slots

## Invariant fondamental — vérité unique

Le **filtre courant (`currentFilter`) est la seule source de vérité** : il décide QUELLES tâches sont visibles. Le **SlotPanel affiche exactement le même ensemble que le TaskPanel** — les deux panneaux sont alimentés par `filterSlotExpr(tasks, currentFilter)`.

La conf de vue (`SlotViewConf` : `view`, `levelMaxIncluded`, `collapse`, `remove`) ne décide que la **disposition** (comment ranger ces tâches dans les créneaux), jamais leur présence ou absence. Aucune option de vue ne doit ajouter/retirer une tâche.

Le **placement se fait par bubbling** (voir plus bas) : une tâche va dans le slot le plus précis qui la contient et qui existe dans la vue ; sinon elle remonte. En tree, les colonnes jour restent les weekdays (`lundi`..`vendredi`) ; une tâche `today`/`tomorrow` ou imprécise (`this_week` seul) n'a pas de colonne jour dédiée et remonte au niveau semaine/mois.

Les options `includeWeekDays`, `showRepeat` et `slotStrict` ont été retirées de la barre du SlotPanel : elles sont couvertes par les filtres par prédicat (`isWeekDay`/`isRelatifPresent`, `isRepeat`/`NOREPEAT`, filtre créneau).

---

## Partition par famille — v2 (SUSPENDU / dormant)

> **Statut** : cette partition n'est plus appliquée depuis le passage à la vérité unique. Le tree ne filtre plus par famille (il dispose toutes les tâches filtrées). Les fonctions `getListTasks`/`getListTasksFiltered` sont conservées dormantes dans `src/data/task.js`. La section ci-dessous documente ce code dormant, à réactiver seulement si l'on tranche pour la projection plutôt que le bubbling.

Chaque vue affichait un sous-ensemble de tâches selon la famille du slot JOUR.

### Règle de routage

| slotExpr | Tree | List |
|---|---|---|
| `this_week lundi`, `this_week lundi matin` | ✓ | ✗ |
| `today`, `tomorrow`, `today matin` | ✗ | ✓ |
| `this_week` seul, `this_month` seul (imprécis) | ✗ | ✓ |
| `today vendredi` (mixte) | ✓ | ✓ |

- **Tree** : `taskHasRelatifParentDay(t)` — a un jour relatifParent (`lundi`..`vendredi`)
- **List** : `!taskHasRelatifParentDay(t) || taskHasRelatifPresentDay(t)` — pas de jour relatifParent, OU a un jour relatifPresent (tâches mixtes incluses dans les deux vues)

Les tâches mixtes (ex. `today vendredi`) apparaissent dans les deux vues :
- **Tree** : positionnée sous le weekday relatifParent (`vendredi`). La partie `today` ne crée pas de colonne supplémentaire.
- **List** : positionnée sous `today` via `_chooseSlotForSortBranch` qui sélectionne `today` en priorité.

Note : `today` (relatifPresent, weight=1) ne matche pas `lundi` (relatifParent, weight=1) — le matching vérifie la famille avant le weight (`isBranchEqualShallow`).

---

## Projection des weekdays dans la list — flag `includeWeekDays` (SUSPENDU / dormant)

> **Statut** : la projection et le flag `includeWeekDays` ne sont plus câblés (checkbox retirée, champ retiré de `SlotViewConf`). Les primitives (`taskRelativeParentToPresent`, `slotPathToPresent`) et le câblage (`getListTasksFiltered`) restent dormants dans `src/data/task.js`. Décision reportée : bubbling (actuel) vs projection. La section ci-dessous documente le comportement dormant.

La partition v2 sépare deux **phases** de la journée : le matin on *planifie* (tree par weekday, list par today/tomorrow), une fois la journée lancée on *exécute* et on veut voir d'un seul coup toutes les tâches qui tombent aujourd'hui — qu'elles soient arrivées via `today` (relatifPresent) ou via `lundi` (relatifParent, parce qu'on est lundi).

Le flag `includeWeekDays: boolean` de `SlotViewConf` (défaut `false`, **list uniquement**) active ce mode : les tâches purement relatifParent-day sont **incluses** dans la list après projection de leur jour sur le cadre relatifPresent.

### Règle de projection

Pour une tâche dont le jour est un weekday relatifParent (`lundi`..`vendredi`), soit `offset = weekday(jour) − weekday(aujourd'hui)` :

| offset | Projection du token jour | Colonne de placement |
|---|---|---|
| 0 | jour → `today` | today |
| 1 | jour → `tomorrow` | tomorrow |
| autre (< 0 ou ≥ 2) | troncature du jour (et de tout ce qui est en dessous) | `this_week` (Present), via bubbling |

En une ligne :

> Projeter le jour relatifParent sur `today`/`tomorrow` si `offset ∈ {0,1}` ; sinon tronquer le jour → remontée à `this_week`.

La projection est une **réécriture du token jour** ; le placement et le bubbling existants font le reste (aucune colonne Past/Future nouvelle).

- **Niveau heure** : projetable avec le jour. `this_week lundi matin`, offset 0 → `today matin`. Si le jour n'est pas projetable, la troncature emporte aussi l'heure → `this_week`.
- **Troncature** : remonte au parent semaine `this_week` (les weekdays concernés sont ceux de `this_week`), pas à `this_month`.
- **Périmètre de la projection** : seuls les weekdays de `this_week` sont projetables sur `today`/`tomorrow`. Un weekday d'une autre semaine (`next_week mercredi`, etc.) tombe directement en troncature vers son parent semaine (`next_week`, `following_week`…), sans passer par la comparaison today/tomorrow.
- **Perte de distinction assumée** : un weekday en retard (offset < 0) et un weekday à venir (offset ≥ 2) atterrissent tous deux dans `this_week`. Acceptable tant que `yesterday` n'existe pas ; l'invariant « toujours visible » reste respecté.
- **Forward-compatible** : à l'arrivée de `yesterday`, insérer `offset −1 → yesterday` avant le fallback ; le « sinon parent » reste le filet de sécurité final.

Quand `includeWeekDays` est `false`, le routage v2 ci-dessus s'applique inchangé (les tâches relatifParent-day restent hors list).

---

## Mécanisme de remontée (bubbling)

La vue est limitée à une profondeur d'affichage. Un slot peut avoir des sous-slots visibles (`inner`) ou non.

**Règle :** une tâche s'affiche au slot S si :
1. son slotExpr est égal à S, ou contenu dans S
2. ET son slotExpr n'est contenu dans aucun sous-slot visible de S

Si le sous-slot qui devrait accueillir la tâche n'est pas visible (absent de `inner`, niveau trop profond, ou nœud réduit), la tâche remonte au slot parent le plus proche visible.

## Distinction visuelle imprécis / remonté

Un slot peut afficher deux catégories de tâches :

- **Tâches imprécises** : le slotExpr est exactement égal au slot courant — la tâche n'est pas affectée à un sous-niveau plus précis
- **Tâches remontées** : le slotExpr pointe vers un slot plus profond, non visible dans la vue courante

Ces deux catégories doivent être **visuellement distinctes** pour permettre de repérer les tâches pas encore assez précisément planifiées.

L'icône `FileDownloadOff` marque les tâches imprécises, uniquement pour les slots de la branche **`this_month`** (le mois courant, `this_week` et ses jours). Les slots futurs (`next_week`, `following_week`, `next_month`, etc.) n'affichent pas l'icône — le manque de précision n'est pas un problème pour des slots non actionnables à court terme. Le niveau heure est également exclu.

## Construction de la vue

La vue est construite à partir d'une **vue par défaut** qui couvre les slots courants et proches (mois en cours, semaines en cours et suivantes, jours proches). Cette vue par défaut ne couvre pas tous les slots possibles.

Si une tâche est assignée à un slot absent de la vue par défaut, ce slot est **injecté dynamiquement** pour garantir l'invariant de visibilité. Cela concerne aussi bien les slots ordinaires absents (ex : `following_week`) que les slots shiftés (ex : `following_week+1`, `next_month+1`).

---

## Mode arbre

- Vue hiérarchique : mois > semaine > jour > heure
- Chaque nœud est développable/réductible
- Le collapse d'un nœud vide son `inner` → les tâches enfants remontent au nœud
- Tout slot absent de la vue par défaut est injecté dynamiquement si une tâche le requiert
- La distinction imprécis / remonté s'applique aux nœuds `this_month`, `this_week` et ses jours (sauf heure)

### Section `rollingDays` (today / tomorrow) — sans projection

Les colonnes jour de l'arbre sont les weekdays `relatifParent` (`lundi`..`vendredi`). Les
jours `relatifPresent` (`today`/`tomorrow`) n'y ont pas de colonne. Plutôt que de les
projeter sur un weekday (réécriture de `slotExpr`, cf. section dormante ci-dessus) ou de
les laisser remonter à la semaine par bubbling, ils s'affichent dans une **section
`rollingDays` séparée**, sous la **semaine courante uniquement** (`this_month this_week`).

Règles :
- **Familles distinctes** : `today` et `mardi` restent deux créneaux différents même s'ils
  désignent le même jour réel — aucune fusion, aucune réécriture de donnée.
- **Sous-lignes Jour / Matin / Aprem** propres à la section, miroir de la grille weekday.
- **Alignement visuel** : la cellule `today` est positionnée dans la colonne du jour du
  `today` **stocké** (`getCurrentWeekdayId(snapDates)`, dérivé des snapDates `today`/
  `this_week` — **pas** de l'horloge système, sinon décalage si les snaps ont été roulés
  manuellement), `tomorrow` dans la colonne du lendemain. C'est un positionnement de
  colonne (helper `getRollingDayColumnId`), **pas** une projection : le pire cas d'une
  incohérence de snapDate est un décalage cosmétique, jamais une tâche perdue ou déplacée.
  La colonne d'alignement est forcée présente même vide.
- **Débordement week-end** : si `today`/`tomorrow` tombe hors `lundi`..`vendredi`, la cellule
  va dans une **colonne dédiée** (sans en-tête) ajoutée en fin de ligne. Cas atteignable
  naturellement quand l'app est ouverte le week-end (`today` stocké = `now` par défaut) :
  - `today` un **vendredi** → `tomorrow` (samedi) déborde seul ;
  - `today` un **samedi/dimanche** → `today` ET `tomorrow` débordent tous deux et sont
    **empilés** dans la même colonne overflow (pas de collision).
- **Tâche mixte** (`today jeudi`) : le bubbling la place à la fois dans la colonne `jeudi`
  (grille weekday) et dans la cellule `today` (section rollingDays) → **affichée deux fois**.
- Construction data : `slotViewTreeSelection` injecte les nœuds today/tomorrow (+ matin/
  aprem) sous la semaine courante ; le placement des tâches reste le bubbling
  (`findTaskBySlotExpr`). Périmètre : **vue tree** (la déclinaison list reste à concevoir).

**Présentation (colonne de titre)** : il n'y a **pas de ligne séparateur** entre grille
weekday et section rollingDays. La colonne de titre porte le niveau de chaque ligne et,
au niveau jour, distingue les deux sections : en-tête **`weekDays`** pour la grille,
**`rollingDays`** pour la section roulante. La **profondeur** du niveau est matérialisée
par des **chevrons cumulés** (`› Mois`, `›› Semaine`, `››› weekDays`/`rollingDays`,
`›››› Matin`/`Aprem`). L'en-tête étant en `writing-mode: sideways-lr` (texte de bas en
haut), les chevrons sont rendus **au-dessus** du texte et **pointent vers le bas**.

## Mode liste

- Grille 2D : lignes = niveaux (mois, semaine, jour), colonnes = position temporelle
- **Ordre des lignes = du plus profond au plus superficiel** : heure (Matin/Aprem) en haut, puis jour (rollingDays/weekDays), semaine, mois en dernier
- **Past** : slot current-1
- **Present** : slot current
- **Future** : tous les slots futurs sont visibles dans la case Future
- Tout slot absent de la vue par défaut est injecté si une tâche le requiert
- Chaque ligne affiche les slots de son niveau. Les tâches assignées à un niveau plus profond que celui de la ligne remontent au slot de cette ligne (bubbling). Exemple : en vue limitée au mois, les tâches de `this_week` ou `following_week` remontent à `this_month`.
- La distinction imprécis / remonté s'applique aux slots Present de `this_month`, `this_week` et ses jours (sauf heure)

### Niveau jour — deux sections `rollingDays` / `weekDays`

Miroir de la section `rollingDays` du tree, adapté à l'axe temporel de la list. Les colonnes
étant déjà temporelles (Present/Future), today/tomorrow y tombent naturellement ; on ajoute
une seconde ligne pour les weekdays. Deux **sections parallèles** partagent les colonnes
Present/Future :

- **`rollingDays`** : `today` → Present, `tomorrow` → Future (chacun avec ses sous-lignes
  Matin/Aprem).
- **`weekDays`** : le weekday que **mappe** today → Present, celui que mappe tomorrow →
  Future (via `getCurrentWeekdayId(snapDates)` + `getRollingDayColumnId`). Les **autres**
  weekdays (lundi, mardi, vendredi… hors jour de today/tomorrow) ne sont **pas affichés** :
  leurs tâches remontent à `this_week` par bubbling (vérité unique préservée).

Règles :
- **Ordre = entrelacé par niveau** (option B), du plus profond au plus superficiel :
  `rollingDays Matin` → `weekDays Matin`, puis `rollingDays Aprem` → `weekDays Aprem`
  (niveau heure), puis `rollingDays`(jour) → `weekDays`(jour). Comme les deux sections
  partagent les colonnes, ce rapprochement fait lire le **même jour réel sous ses deux
  familles** (relatifPresent vs relatifParent) verticalement. Ce bloc jour/heure est
  placé **avant** les lignes semaine/mois (ordre global du plus profond au plus superficiel).
- **Pas de projection ni de fusion** : today et son weekday (ex. mercredi) restent des
  créneaux distincts. Chaque cellule = un seul slot (pas d'empilement, pas de colonne
  overflow — contrairement au tree).
- **Anti-doublon** : les weekdays mappés sont injectés sous `this_week` (bubbling), pour que
  leurs tâches n'apparaissent pas aussi remontées à `this_week`.
- **Bord week-end** : si le weekday mappé est hors `lundi`..`vendredi` (today=vendredi →
  tomorrow=samedi, ou today=samedi/dimanche), la cellule `weekDays` correspondante est **vide** ;
  si les deux le sont, la ligne `weekDays` est **omise**. La ligne `rollingDays` reste.
- Les sous-lignes **Matin/Aprem** ne sont émises que si elles **portent des tâches**.
- **Présentation** : colonne de titre en chevrons de profondeur (`levelLabel`, partagé avec le
  tree), libellés `rollingDays` / `weekDays` / `Matin` / `Aprem`.

Construction data : `slotViewListDaySections(currentWeekday)` fournit les nœuds de rendu
(today/tomorrow + weekdays mappés) ; `slotViewListSelection` injecte les weekdays mappés sous
`this_week` pour le bubbling. Le placement des tâches reste `findTaskBySlotExpr`.

---

## Exemple — mode liste, semaine courante = `this_week`

Slots disponibles au niveau semaine : `this_week`, `next_week`, `following_week`

Semaine courante, today stocké = mercredi (→ tomorrow = jeudi) :

| Niveau | Past | Present | Future |
|--------|------|---------|--------|
| rollingDays | — | today | tomorrow |
| weekDays | — | mercredi | jeudi |
| semaine | —   | this_week | next_week · following_week |
| mois   | —    | this_month | next_month · next_month+1 |

(lundi, mardi, vendredi non affichés → remontent à `this_week` ; sous-lignes Matin/Aprem
ajoutées **au-dessus** de `rollingDays`/`weekDays` quand des tâches les occupent, dans
l'ordre entrelacé — ex. `rollingDays Matin`, `weekDays Matin`, puis `rollingDays`, `weekDays`.)

## Exemple — mode liste, affichage limité au niveau mois

Seule la ligne mois est affichée. Les sous-slots (`this_week`, `next_week`, `following_week`, jours) sont absents de la vue → toutes les tâches à l'intérieur d'un mois remontent à ce mois.

| Niveau | Past | Present | Future |
|--------|------|---------|--------|
| mois   | —    | this_month (↑ this_week, next_week, following_week) | next_month · next_month+1 |

