# Spécifications fonctionnelles — Vue des slots

## Invariant fondamental

Cette spec décrit uniquement le **SlotPanel** (vues tree et list). Le TaskPanel est indépendant : il affiche toutes les tâches correspondant au `currentFilter`, sans partition ni projection liée à la vue.

Dans le SlotPanel, chaque tâche est visible dans au moins une vue. La partition v2 (ci-dessous) casse volontairement cet invariant : une tâche n'est visible que dans la vue correspondant à sa famille.

---

## Partition par famille — v2

Chaque vue affiche un sous-ensemble de tâches selon la famille du slot JOUR.

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

## Projection des weekdays dans la list — flag `includeWeekDays`

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

## Mode liste

- Grille 2D : lignes = niveaux (mois, semaine, jour), colonnes = position temporelle
- **Past** : slot current-1
- **Present** : slot current
- **Future** : tous les slots futurs sont visibles dans la case Future
- Tout slot absent de la vue par défaut est injecté si une tâche le requiert
- Chaque ligne affiche les slots de son niveau. Les tâches assignées à un niveau plus profond que celui de la ligne remontent au slot de cette ligne (bubbling). Exemple : en vue limitée au mois, les tâches de `this_week` ou `following_week` remontent à `this_month`.
- La distinction imprécis / remonté s'applique aux slots Present de `this_month`, `this_week` et ses jours (sauf heure)

---

## Exemple — mode liste, semaine courante = `this_week`

Slots disponibles au niveau semaine : `this_week`, `next_week`, `following_week`

| Niveau | Past | Present | Future |
|--------|------|---------|--------|
| mois   | —    | this_month | next_month · next_month+1 |
| semaine | —   | this_week | next_week · following_week |
| jour   | hier | aujourd'hui | demain |

## Exemple — mode liste, affichage limité au niveau mois

Seule la ligne mois est affichée. Les sous-slots (`this_week`, `next_week`, `following_week`, jours) sont absents de la vue → toutes les tâches à l'intérieur d'un mois remontent à ce mois.

| Niveau | Past | Present | Future |
|--------|------|---------|--------|
| mois   | —    | this_month (↑ this_week, next_week, following_week) | next_month · next_month+1 |

