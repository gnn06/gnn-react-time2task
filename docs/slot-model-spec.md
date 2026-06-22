# Spécification — Modèle de données des créneaux (`slotExpr`)

> Statut : **modèle validé** (conception 2026-06-16/17). Décrit la cible.
> Périmètre d'implémentation immédiat : ajout de l'ancre **jour** `relatifPresent`
> (`today`/`tomorrow`). Compléments `relatifParent` semaine (`semaine N du mois`) et
> famille `absolu` (mars, jour de l'année…) : **prévus**, même patron, hors premier
> build. Voir § « Périmètre ».

## 1. Invariant fondamental

Un créneau se décrit par une **ancre** (qui se localise seule) éventuellement
**raffinée** par des **compléments** (positions dans la période parente). Plusieurs
familles coexistent en permanence : aucune n'est déductible des autres.

- Le `relatifPresent` (`today`, `this_week`, `this_month`) exprime des tâches
  *roulantes* ancrées au présent.
- Le `relatifParent` (`lundi..vendredi`, à venir `semaine N du mois`, `matin/aprem`)
  est **indispensable** pour la récurrence verrouillée au calendrier
  (`every 1 this_week mardi` = « chaque mardi ») — impossible à exprimer en
  `relatifPresent` (une ancre relative au présent n'a pas d'identité calendaire).
- Le `absolu` (futur : `mars`, `semaine N de l'année`, `jour N de l'année`) pinne un
  point **fixe** du calendrier civil.

Conséquence : **pas de migration, pas de réduction** d'une famille vers une autre.

## 2. Deux rôles, trois familles

Chaque identifiant joue l'un de deux **rôles** :

| Rôle | Position | Se localise… | Familles |
|---|---|---|---|
| **Ancre** | en tête, auto-localisante | toute seule | `relatifPresent` (réf = maintenant, **roule**) · `absolu` (réf = année, **fixe**) |
| **Complément** | sous une ancre/complément | dans son parent | `relatifParent` (réf = la période parente) |

Critère `relatifParent` vs `absolu` — **quel est le parent ?**
- parent **relatif / sélectionnable** (semaine, jour, mois) → `relatifParent` :
  « jour **de la** semaine » (`mardi`), « semaine **du** mois », « heure **du** jour ».
- parent = **l'année** (cadre fixe) → `absolu` : « mois **de l'année** » (`mars`),
  « semaine **de l'année** », « jour **de l'année** ».

Comportement au roulement (§ 8) : `relatifPresent` roule ; `absolu` est fixe ;
`relatifParent` ne roule pas par lui-même (il suit son parent).

## 3. Niveaux et identifiants

| Niveau | `relatifPresent` *(ancre, roule)* | `relatifParent` *(complément)* | `absolu` *(ancre, fixe — futur)* |
|---|---|---|---|
| 1 — Mois | `this_month`, `next_month` (=`this_month + 1`) | — | `mars` (mois de l'année) |
| 2 — Semaine | `this_week`, `next_week` (=+1), `following_week` (=+2) | `semaine1..N` **du mois** *(prévu)* | `semaine N` **de l'année** |
| 3 — Jour | `today`, `tomorrow` (=`today + 1`) | `lundi`…`vendredi` (**de la** semaine) | `jour N` **de l'année** |
| 4 — Heure | — | `matin`, `aprem` (**du** jour) | — |

- `tomorrow` est l'**alias** de `today + 1`, comme `next_week` = `this_week + 1` et
  `following_week` = `this_week + 2`.
- Une ancre `absolu` peut elle aussi porter des compléments `relatifParent`
  (`mars semaine1 lundi` = le 1ᵉʳ lundi de mars).

## 4. Ossature d'une expression

> **Exactement UNE ancre en tête** (`relatifPresent` ou `absolu`), au niveau du grain
> le plus grossier que l'on veut localiser, **suivie de 0..n compléments
> `relatifParent`** aux niveaux plus fins, dans l'ordre des niveaux croissants.

- `multi` (plusieurs valeurs au même niveau) autorisé **à tout rang** : ancres
  (`today tomorrow`, `this_week next_week`) comme compléments (`this_week mardi jeudi`).
- `every N` (récurrence) porté par **l'ancre**, à **tout niveau**.
- `+ n` (shift) porté par **l'ancre** `relatifPresent`.

### Représentation AST (`slot-branch.js`)

- `branch` = `{ value:[anchorId, ...compléments], shift?, repetition?, flags? }`
- `multi` = `{ type:'multi', value:[branch, …] }`
- `anchorId` = chaîne en tête ; compléments = chaînes ou sous-`branch`/`multi`.

## 5. Règles de validité (complétude)

1. **Une seule ancre**, en tête. Jamais deux ancres dans une même branche linéaire
   (interdit : `this_week today`).
2. **Un complément `relatifParent` n'est jamais seul** : il exige au-dessus un slot
   localisé du niveau parent, en chaîne descendante contiguë.
   - `mardi` seul est **incomplet** → normalisé en préfixant l'ancre courante
     (`branchComplete` : `mardi` → `this_week mardi`).
3. **Pas de saut de niveau** dans la chaîne de compléments.
4. **`multi` homogène** : un `multi` regroupe des éléments de **même rôle et même
   niveau**. Mélanger ancre et complément dans un même `multi` est hors modèle.
5. `+ n` et `every N` **uniquement sur l'ancre**.

## 6. Shift et alias

| Ancre | Shift | Alias |
|---|---|---|
| `this_month` | `this_month + n` | `next_month` = `this_month + 1` |
| `this_week` | `this_week + n` | `next_week` = +1, `following_week` = +2 |
| `today` | `today + n` | `tomorrow` = `today + 1` |

- Les ancres `relatifPresent` sont routées par le **chemin shift** (offset ouvert),
  **pas** par un cycle fermé. En particulier `today`/`tomorrow` **ne sont pas** dans
  `SLOTIDS_BY_LEVEL['3']` (qui reste le cycle des 5 jours) ; sinon `next(tomorrow)`
  renverrait `lundi`.
- Les compléments `relatifParent` sont des **cycles fermés** indexés (`lundi..vendredi`
  = 1..5 ; `matin/aprem` = 1..2 ; à venir `semaine1..N`).

## 7. Récurrence (`every N`)

- Portée par l'ancre, sens « toutes les N périodes du niveau de l'ancre » :
  `every 2 today` (2 jours), `every 2 this_week` (2 semaines), `every 2 this_month`
  (2 mois).
- Combinée à un complément, répète **le motif complet** :
  - `every 1 this_week mardi` = chaque mardi
  - `every 2 this_week vendredi` = un vendredi sur deux
  - `every 1 this_month semaine1 lundi` = le 1ᵉʳ lundi de chaque mois *(futur)*

## 8. Roulement — « Démarrer Mois / Semaine / Jour »

Chaque niveau possède un **snapDate** (date calendaire concrète de son ancre
`relatifPresent` courante) et un déclencheur de roulement explicite.

| Déclencheur | Effet sur les ancres `relatifPresent` du niveau | snapDate | Autres |
|---|---|---|---|
| Démarrer Mois | `next_month`→`this_month`, `this_month + n`→`+ (n-1)`, `this_month` reste (plancher) | mois + 1 | inchangés |
| Démarrer Semaine | `next_week`→`this_week`, `following_week`→`next_week`, … `this_week` reste | semaine + 7 j | inchangés |
| Démarrer Jour | `tomorrow`→`today`, `today + n`→`+ (n-1)`, `today` reste (plancher) | jour + 1 j | inchangés |

**Règle clé — `branchShift` conscient de la famille** : un roulement de niveau L roule
uniquement les ancres **`relatifPresent`** de niveau L. Il **ne touche jamais** les
compléments `relatifParent` ni les ancres `absolu`, même de même niveau. En
particulier « Démarrer Jour » roule `today`/`tomorrow` mais laisse `lundi..vendredi`
**fixes** (sinon `mardi`→`lundi` casserait « chaque mardi »).

**Comportement roulant** : une tâche `today` non faite reste `today` au Démarrer Jour
(plancher) → elle « colle » au jour courant ; pas de jour passé en `relatifPresent`.

## 9. Projection entre familles (via snapDate)

Le snapDate de niveau est le **pont** : connaissant la date concrète de
`today`/`this_week`/`this_month`, on projette une ancre `relatifPresent` vers son nom
calendaire (`today` → `mercredi`, `this_month` → `janvier`) et réciproquement. C'est un
**service d'affichage** ; il ne modifie pas le stockage.

> L'affichage des familles dans chaque vue (arbre / liste) et l'UI de sélection
> (relatifPresent vs relatifParent vs absolu) font l'objet d'une spec séparée —
> **à concevoir**.

## 10. Exemples canoniques

| Expression | Ancre | Compléments | Sens |
|---|---|---|---|
| `this_month` | this_month *(relPresent)* | — | ce mois |
| `next_month` | this_month +1 | — | le mois prochain |
| `this_week` | this_week | — | cette semaine |
| `this_week mardi` | this_week | mardi *(relParent)* | mardi de cette semaine |
| `this_week mardi jeudi` | this_week | multi(mardi, jeudi) | mardi et jeudi |
| `this_week mardi matin` | this_week | mardi, matin | mardi matin |
| `today` | today | — | aujourd'hui (roulant) |
| `tomorrow` | today +1 | — | demain (roulant) |
| `today matin` | today | matin | matin du jour roulant |
| `today tomorrow` | multi(today, today+1) | — | aujourd'hui et demain |
| `every 1 this_week mardi` | this_week (×1) | mardi | chaque mardi |
| `every 2 today` | today (×2) | — | tous les 2 jours |
| `this_month semaine1 lundi` *(futur)* | this_month | semaine1, lundi | 1ᵉʳ lundi du mois |
| `mars semaine1 lundi` *(futur)* | mars *(absolu)* | semaine1, lundi | 1ᵉʳ lundi de mars |

## 11. Périmètre d'implémentation

**Build immédiat — ancre jour `relatifPresent` `today`/`tomorrow`** :
- `slot-id.js` : `today`/`tomorrow` niveau 3, routés chemin **shift** (hors cycle des
  weekdays) ; `weight` ; `getSlotIdCurrent(3)` conscient de la famille.
- `slot-branch.js` : `_branchAlias` → `today + 1` ⇒ `tomorrow`.
- `slot-date.js` : **snapDate jour** (`getDefaultDates`, `getDate` niveau 3,
  `shiftDate('day')`).
- `slot-branch++.js` / `action-shift.jsx` : `branchShift` **conscient de la famille**
  + **« Démarrer Jour »** (3ᵉ option).
- TDD : shift/alias/récurrence sur `today`, snapDate jour, roulement jour ;
  **non-régression** des formes `relatifParent` (multi, `every N this_week mardi`).

**Prévu, même patron, hors premier build** :
- compléments `relatifParent` semaine : `semaine1..N du mois` (la règle § 8 « famille »
  s'appliquera aussi au niveau semaine) ;
- famille **`absolu`** : `mars` (mois de l'année), `semaine N de l'année`,
  `jour N de l'année` — ancres auto-localisantes **fixes** (ne roulent pas).

**Hors périmètre de cette spec** : représentation dans les vues + UI du sélecteur.

## Voir aussi

- `docs/slot-view-spec.md` — affichage des slots (vues arbre / liste)
- `docs/next-slot.md` — calcul du prochain créneau (`getSlotNextPrev`)
