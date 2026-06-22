# Spécifications fonctionnelles — Vue des slots

## Invariant fondamental

Toutes les tâches doivent être visibles. Aucune tâche ne doit manquer, quel que soit son slotExpr.

> ⚠️ **Exception temporaire** : la « Vue par famille — v1 » (section dédiée ci-dessous)
> **casse volontairement cet invariant** le temps de valider le modèle relatif jour
> (`today`/`tomorrow`). Une tâche n'y est visible que dans **une** des deux vues. À
> rétablir avec la projection croisée (phase ultérieure).

---

## Vue par famille — v1 TEMPORAIRE (validation du modèle relatif jour)

> **Statut : temporaire.** Première version pour *voir* le modèle relatif jour
> (`today`/`tomorrow`) rendu, **sans mixage ni projection**. Elle **casse
> volontairement l'invariant de visibilité** : une tâche n'est visible que dans la vue
> de sa famille — il faut basculer de vue pour tout voir. Sera remplacée par la
> **projection croisée** (toute tâche visible dans les deux vues) dans une phase
> ultérieure. Choix = « Option 2 / partition » (cf. `docs/plan-today.md` phase C).

### Règle de routage (partition stricte)

Par la **famille du slot JOUR** de la tâche (l'heure `matin/aprem` suit le jour et
n'intervient pas dans le routage) :

- la tâche a un **complément relatifParent au jour** (`lundi`…`vendredi`) → **vue tree** uniquement ;
- sinon — purement relatifPresent (`today`/`tomorrow`, ou `this_week`/`this_month`
  **sans** jour) → **vue list** uniquement.

Partition stricte : chaque tâche dans **exactement une** vue, **aucune duplication**.

| slotExpr | Vue |
|---|---|
| `this_week mardi`, `every 1 this_week mardi`, `this_week mardi matin` | tree |
| `today`, `tomorrow`, `today matin` | list |
| `this_week` seul, `this_month` seul (imprécis) | list |

### Vue tree (vision absolue / calendaire)

Structure **inchangée** (mois › semaine › colonnes weekday › matin/aprem). N'affiche
que les tâches à **jour relatifParent**. Conséquence assumée du caractère temporaire :
les tâches imprécises niveau semaine/mois (`this_week`/`this_month` seuls)
**n'apparaissent plus dans le tree** (elles partent en list).

### Vue list (vision relative au présent)

L'axe **jour** passe des weekdays aux **ancres** `today`/`tomorrow`
(`ANCHOR_IDS_BY_LEVEL['3']`). N'affiche que les tâches **purement relatifPresent**.

### Hors périmètre v1 (différé)

- projection croisée (today ↔ weekday) pour rétablir l'invariant ;
- dates au niveau jour (`getDate` niveau 3 / snapDate jour — incrément B5) ;
- franchissement de semaine de `tomorrow` un vendredi (→ `next_week`) ;
- marqueur visuel de nature ; filtrage par nature.

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

