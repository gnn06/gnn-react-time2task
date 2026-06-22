# Conception — Types de base du modèle de créneaux

> Document de conception. Décrit les **types manipulés** et leurs **opérations**.
> Complète `docs/slot-model-spec.md` (règles métier). Les types reflètent le code
> actuel (`src/data/`) ; les **ajouts** du modèle relatif jour sont marqués 🆕.

## 0. Vue d'ensemble

| Type | Rôle | Fichier | Forme |
|---|---|---|---|
| `SlotId` | identifiant atomique d'une période | `slot-id.js` | `string` (+ offset `+ n`) |
| `SlotTree` (`Branch` \| `Multi`) | expression complète (AST) | `slot-branch.js`, parser | objet arborescent |
| `SlotPath` | chemin **linéaire** (sans répétition/flags) | `slot-path.ts` | classe `{ IDs: string[] }` |
| `SnapDate` | ancrage calendaire d'un niveau | `slot-date.js` | `{ slotid, date }` |
| `Slot` (vue) | nœud d'arbre d'affichage | `slot-view.ts` | `{ id, path, inner }` |

Flux : `slotExpr: string` ──parser──▶ `SlotTree` ──(complétion/shift/hash)──▶
projeté en `SlotPath` / dates via `SnapDate` pour comparaison et affichage.

## 1. Types primitifs

```ts
// Niveau hiérarchique
type Level = 1 | 2 | 3 | 4            // 1 mois · 2 semaine · 3 jour · 4 heure

// Rôle d'un identifiant dans l'ossature (cf. spec §2)
type Role = 'anchor' | 'complement'

// Famille (cf. spec §2)
type Family = 'relatifPresent' | 'relatifParent' | 'absolu'

// Identifiant de slot : chaîne, éventuellement suffixée d'un offset "+ n"
// ex: 'this_week', 'next_week', 'today', 'today + 2', 'mardi', 'matin'
type SlotId = string
```

### Taxonomie des `SlotId`

| `SlotId` | `Level` | `Role` | `Family` | Notes |
|---|---|---|---|---|
| `this_month`, `next_month` | 1 | anchor | relatifPresent | `next_month` = `this_month + 1` |
| `this_week`, `next_week`, `following_week` | 2 | anchor | relatifPresent | `next_week`=+1, `following_week`=+2 |
| 🆕 `today`, `tomorrow` | 3 | anchor | relatifPresent | `tomorrow` = `today + 1` |
| `lundi`…`vendredi` | 3 | complement | relatifParent | cycle fermé 1..5 (jour de la semaine) |
| `matin`, `aprem` | 4 | complement | relatifParent | cycle fermé 1..2 (heure du jour) |
| `semaine1..N` *(futur)* | 2 | complement | relatifParent | semaine du mois |
| `mars`, `jour N année`, `semaine N année` *(futur)* | 1/3/2 | anchor | absolu | point fixe du calendrier |
| `month`, `week`, `day`, `hour` | 1..4 | — | générique | `GENERIC_SLOTIDS` (joker de niveau) |

**Invariant de routage** : les ancres `relatifPresent` sont gérées par le **chemin
shift** (offset ouvert) ; les compléments `relatifParent` par un **cycle fermé**
indexé. ⇒ `today`/`tomorrow` **ne sont pas** dans `SLOTIDS_BY_LEVEL['3']` (qui reste
`['lundi'..'vendredi']`).

### Opérations sur `SlotId` (`slot-id.js`)

- Tables : `weight`, `SLOTIDS_BY_LEVEL`, `SLOTIDS_LST`, `GENERIC_SLOTIDS`, `EXPR_KEYWORDS`.
- `getSlotIdLevel(id) → Level | -1`
- `getSlotIdCurrent(level) → SlotId` — slot courant (🆕 niveau 3 conscient de la famille)
- `getSlotIdNextPrev(id, dir)`, `getSlotIdPrevious(id, repetition?)` — navigation
- `getSlotIdIndex(id)`, `getSlotIdDistance(a, b)`, `isSlotIdEquals(a, b)`, `isSlotIdGeneric(id)`
- 🆕 **classifieur famille/rôle** à introduire : `getSlotIdFamily(id) → Family`,
  `isAnchor(id)` / `isRelatifPresent(id)` — requis par `branchShift` conscient de la
  famille (spec §8) et par `getSlotIdNextPrev` (routage shift vs cycle).

## 2. `SlotTree` — l'AST (`Branch` | `Multi`)

Sortie du parser (`parser.js`) ; manipulé par `slot-branch.js` / `slot-branch++.js`.

```ts
type Flag = 'disable' | 'chaque'      // (mot-clé 'every' → repetition)

interface Branch {
  type: 'branch'
  value: (SlotId | Branch | Multi)[]  // value[0] = ANCRE (SlotId) ; suite = compléments
  shift?: number                      // offset "+ n" porté par l'ancre
  repetition?: number                 // "every N" porté par l'ancre
  flags?: Flag[]
}

interface Multi {                     // plusieurs valeurs de même niveau
  type: 'multi'
  value: (Branch | Multi)[]
  flags?: Flag[]
}

type SlotTree = Branch | Multi
```

Correspondance avec la spec :
- `value[0]` = **ancre** ; `value[1..]` = **compléments** (chaînes ou sous-arbres).
- `shift` / `repetition` **uniquement sur l'ancre** (règle de validité §5.5).
- `Multi` représente le multi à tout rang (`this_week mardi jeudi`, `today tomorrow`).

Exemples :
```
'this_week mardi jeudi'      → branch{ value:['this_week', multi{value:[branch['mardi'], branch['jeudi']]}] }
'every 2 this_week vendredi' → branch{ repetition:2, value:['this_week', branch['vendredi']] }
'next_week'                  → branch{ value:['this_week'], shift:1 }   (alias via _branchAlias)
'today matin'           🆕   → branch{ value:['today', 'matin'] }
```

### Opérations sur `SlotTree`

`slot-branch.js` : `branchComplete` (préfixe l'ancre courante au-dessus d'un complément
orphelin), `branchTruncate`, `branchToExpr`, `getBranchHash`, `_branchAlias`
(🆕 `today + 1` ⇒ `tomorrow`), `getBranchWeight/Distance`, `isBranchMulti/Repeat1/Repeat2/Unique/Disable`,
`branchRemoveDisable`, `getBranchFirstSlot/Lower/Head/Tail`, `getBranchCurrentPath`.
`slot-branch++.js` : `branchShift` (🆕 **conscient de la famille** : ne roule que les
ancres `relatifPresent` du niveau visé), `branchCompare`, `isBranchEqualOrInclude`.

## 3. `SlotPath` — chemin linéaire (`slot-path.ts`)

Représente un chemin **sans** répétition/flags/multi : « un mois, une semaine, un
jour, une heure ». Utilisé comme « maintenant » et comme résultat de `getSlotNextPrev`.

```ts
class SlotPath {
  IDs: string[]                       // ex: ['this_month','this_week','mardi','matin']
  shift(level, dir): SlotPath
  append(id): SlotPath ; delete(id): SlotPath ; truncate(level): SlotPath
  replace(level, id): SlotPath
  getLevel(): Level ; getLast(): SlotId
  equals(other): boolean ; equalsOrInclude(other): boolean
  getDistanceTo(other): number
  firstDivergingId(current): SlotId | null ; mostInformativeId(current): SlotId
}
getCurrentPathExpr(level): string     // chemin courant "this_month this_week …"
```

> 🆕 Impact relatif jour : `getCurrentPathExpr`/`getSlotIdCurrent(3)` doivent décider
> quelle famille représente « le jour courant » (ancre `today` vs complément weekday)
> selon le contexte d'usage (comparaison de prochain slot vs projection d'affichage).

## 4. `SnapDate` — ancrage calendaire (`slot-date.js`)

Pont entre les familles et les dates réelles (cf. spec §9).

```ts
interface SnapDate {
  slotid: string   // 'this_month' | 'this_week' | 🆕 'today'
  date: string     // 'YYYY-MM' (mois) | 'YYYY-MM-DD' (semaine, jour)
}
type SnapDates = SnapDate[]
```

- Un `SnapDate` par niveau possédant une ancre `relatifPresent` : mois, semaine,
  🆕 **jour**. `slotid` = premier id du niveau (`getSlotIdFirstLevel`).
- Opérations : `getDefaultDates()` (🆕 ajoute le jour), `getDate(slot, snapDates)`
  (🆕 gère le niveau 3), `shiftDate(date, level)` (🆕 `'day'` → +1 j),
  `getSnapDateToSave/Show`.

## 5. Types dérivés (vue) — pour mémoire

`slot-view.ts` (couche affichage, hors périmètre du build modèle) :

```ts
interface Slot { id: string; path: string; inner: Slot[] }   // nœud d'arbre de vue
interface SlotViewConf { levelMin, levelMaxIncluded, remove[], collapse[],
                         view:'tree'|'list', slotStrict, showRepeat }
```

## 6. Récapitulatif des ajouts 🆕 (build immédiat)

1. `SlotId` : `today`/`tomorrow` (ancre relatifPresent niveau 3) + classifieur
   famille/rôle.
2. `getSlotIdCurrent(3)` / routage `getSlotIdNextPrev` conscients de la famille.
3. `_branchAlias` : `today + 1` ⇒ `tomorrow`.
4. `branchShift` : conscient de la famille (roule l'ancre, pas les compléments).
5. `SnapDate` jour + `getDate`/`shiftDate`/`getDefaultDates` niveau 3.

## 7. Analyse des structures de définition (état actuel)

Les niveaux et slots disponibles à l'exécution sont définis par **5 structures**,
toutes dans `slot-id.js` :

| Structure | Forme | Rôle | Consommateurs externes |
|---|---|---|---|
| `SLOTIDS_BY_LEVEL` | `{ '1':[…], '2':[…], '3':['lundi'..'vendredi'], '4':['matin','aprem'] }` | slots **par niveau** | `slotviewtree` (`DAY_IDS = ['3']`), `slot-panel` (`Object.keys().length` = nb niveaux), `slot-view.ts` (`Object.values()` = grille `slotViewFilter`) |
| `weight` | map plate `id → number` | tri / distance / comparaison | `slot-branch` (`getBranchWeight`, ancre only), `slot-next-prev` (jour/heure), `slot-branch++` (`branchCompare`) |
| `SLOTIDS_LST` | liste plate de tous les ids (+ génériques) | tokens valides | `parser`, `task-filter` (autocomplétion) |
| `GENERIC_SLOTIDS` | `['month','week','day','hour']` | noms de niveau / joker | `slotviewlist` (libellé de ligne) |
| `EXPR_KEYWORDS` | `['disable','chaque','every']` | mots-clés | `parser` |

### Duplications cachées (définitions NON dérivées des structures)

Endroits qui ré-encodent l'information à la main → toute évolution doit les toucher
un par un :

- `getSlotIdLevel` (slot-id.js) : `if/else` qui **re-liste** chaque id au lieu de lire
  `SLOTIDS_BY_LEVEL` ⚠️ ;
- `getSlotIdCurrent(3)` : tableau `['dimanche'..'samedi']` en dur ;
- `slot-view.ts` `defaultSlotViewList` : `'lundi'` (week-end) en dur ;
- `action-shift.jsx` : `options = [{week},{month}]` — **pas de jour** ;
- `button-help-expression.jsx` : liste des ids dans l'aide.

### Problème central : `SLOTIDS_BY_LEVEL` surchargé et aveugle à la famille

`SLOTIDS_BY_LEVEL['3']` sert **trois** usages incompatibles avec le nouveau modèle :
1. **cycle de compléments** à indexer (`getSlotIdNextPrev/Index/Previous` font
   `slots.indexOf(id)`) ;
2. **catalogue des slots à afficher** (`slotviewtree`, `slotViewFilter`) ;
3. **énumération du niveau** (`Object.keys`).

Conséquences pour le modèle :
- `today`/`tomorrow` sont des **ancres** routées par **shift** (offset ouvert), pas des
  membres d'un cycle fermé → les mettre dans `['3']` casse `getSlotIdNextPrev`
  (`next(tomorrow)` → `lundi`, piège `feat_today`) ;
- mais ils doivent rester **connus du parser** (`SLOTIDS_LST`) et **affichables** ;
- **aucune** structure n'encode la **famille** ni le **rôle**, dont dépendent
  `branchShift` conscient de la famille (spec §8) et le routage shift/cycle.

⇒ il faut **séparer** « cycle de compléments » (indexable) du « catalogue des slots »
(parser + vues) et **ajouter la dimension famille/rôle**.

## 8. Cible : source de vérité unique `SLOT_DEFS`

Plutôt que d'ajouter un slot à 5 endroits, **un descripteur par slot** dont on
**dérive** les 5 structures et les classifieurs :

```ts
interface SlotIdDef {
  id: string
  level: Level                                       // 1..4
  role: 'anchor' | 'complement'
  family: 'relatifPresent' | 'relatifParent' | 'absolu'
  order?: number      // index dans le cycle (compléments) → alimente `weight`
  alias?: string      // ex: 'tomorrow' = 'today + 1', 'next_week' = 'this_week + 1'
}

const SLOT_DEFS: SlotIdDef[] = [
  { id:'this_month',     level:1, role:'anchor',     family:'relatifPresent' },
  { id:'next_month',     level:1, role:'anchor',     family:'relatifPresent', alias:'this_month + 1' },
  { id:'this_week',      level:2, role:'anchor',     family:'relatifPresent' },
  { id:'next_week',      level:2, role:'anchor',     family:'relatifPresent', alias:'this_week + 1' },
  { id:'following_week', level:2, role:'anchor',     family:'relatifPresent', alias:'this_week + 2' },
  { id:'today',          level:3, role:'anchor',     family:'relatifPresent' },          // 🆕
  { id:'tomorrow',       level:3, role:'anchor',     family:'relatifPresent', alias:'today + 1' }, // 🆕
  { id:'lundi',          level:3, role:'complement', family:'relatifParent', order:1 },
  { id:'mardi',          level:3, role:'complement', family:'relatifParent', order:2 },
  { id:'mercredi',       level:3, role:'complement', family:'relatifParent', order:3 },
  { id:'jeudi',          level:3, role:'complement', family:'relatifParent', order:4 },
  { id:'vendredi',       level:3, role:'complement', family:'relatifParent', order:5 },
  { id:'matin',          level:4, role:'complement', family:'relatifParent', order:1 },
  { id:'aprem',          level:4, role:'complement', family:'relatifParent', order:2 },
  // futur : semaine1..N (relatifParent, level 2) ; mars / jour N année / semaine N année (absolu)
]
```

### Structures dérivées

| Dérivé | Dérivation |
|---|---|
| `SLOTIDS_BY_LEVEL[L]` (cycles indexables) | `SLOT_DEFS.filter(d => d.level===L && d.role==='complement').sort(order).map(id)` |
| catalogue (parser, vues, autocomplétion) | tous les `SLOT_DEFS.map(id)` (+ génériques + keywords) |
| `weight[id]` | `order` (compléments) ; base par niveau pour les ancres |
| `getSlotIdLevel(id)` | lookup `SLOT_DEFS` (+ génériques) |
| `getSlotIdFamily(id)` / `isAnchor(id)` 🆕 | lookup `SLOT_DEFS` |
| aliases (`_branchAlias`, shift) | champ `alias` |

### Propriété

Refactor **« source unique » sans changement de comportement** : on extrait
`SLOT_DEFS`, on fait dériver les 5 structures + `getSlotIdLevel`, on couvre par les
tests existants — **avant** d'ajouter `today`/`tomorrow` (qui devient alors l'ajout
de 2 lignes). Supprime les duplications du §7.

## Voir aussi

- `docs/slot-model-spec.md` — règles métier du modèle
- `docs/slot-view-spec.md` — affichage · `docs/next-slot.md` — prochain créneau
