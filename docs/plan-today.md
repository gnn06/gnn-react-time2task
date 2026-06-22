# Plan d'exécution — vision relative jour (`today`/`tomorrow`)

> Plan d'implémentation par phases. Conception de référence :
> `docs/slot-model-spec.md` (règles) et `docs/slot-types-design.md` (types + `SLOT_DEFS`).
> Branche : `feat_today`.

## Conventions (toutes phases)

- **TDD** : test rouge d'abord, puis implémentation au vert (cf. `CLAUDE.md`).
- Après chaque incrément : `npx tsc --noEmit` + `npx vitest run` doivent être verts.
- **Un commit par incrément** (message une ligne).
- Filet : tests golden `src/data/slot-id.defs.test.js` + suite existante.
- Terminologie : on parle de **séquence de navigation** par famille (et non de
  « cycle » : `getSlotIdNextPrev` parcourt une **liste ordonnée finie + débordement
  en shift `+ n`**, ça ne boucle pas).

## Vue d'ensemble des phases

| Phase | Objet | Statut |
|---|---|---|
| **A** | `SLOT_DEFS` source unique + classifieurs famille/rôle | ✅ fait (`7e68b32`) |
| **B** | Modèle de données : ancre jour `today`/`tomorrow` (+ snapDate jour, Démarrer Jour) | ⏳ à faire |
| **C** | Affichage : rendu des familles dans les vues arbre / liste | à concevoir |
| **D** | Sélecteur : UI de choix relatifPresent / relatifParent (/ absolu) | à concevoir |
| **E** | Complément relatifParent semaine : `semaine N du mois` | futur |
| **F** | Famille `absolu` : `mars`, `jour N de l'année`, `semaine N de l'année` (exige niveau année) | futur |

Périmètre **modèle** = phases A+B. Périmètre **UX** = phases C+D. Extensions = E+F.

---

## Phase B — ancre jour `today`/`tomorrow` (modèle de données)

Objectif : `today`/`tomorrow`/`today + n` valides, parseables, stockables, navigables,
ancrés à un **snapDate jour**, roulés par **« Démarrer Jour »**. L'absolu
`lundi..vendredi` reste **inchangé**. **Aucun changement de vue** (phase C).

### Point structurel clé

`SLOTIDS_BY_LEVEL` cumule aujourd'hui plusieurs usages (cf. `slot-types-design.md` §7) :
1. **séquence de navigation** (`getSlotIdNextPrev/Previous/Index` font `indexOf`),
2. **catalogue d'affichage** (slotviewtree `DAY_IDS`, slotViewFilter),
3. **nombre de niveaux** (slot-panel),
4. **id par défaut/ancre du niveau** (`getSlotIdFirstLevel(level)` = `[level][0]`,
   consommé par `slot-date.js` et `getBranchHash`).

`today`/`tomorrow` (ancres, séquence propre) ne peuvent pas cohabiter avec
`lundi..vendredi` (compléments) dans **une seule** liste niveau 3
(`getSlotIdNextPrev('vendredi',+1)` renverrait `today`).

⇒ Découplage :
- **usage 1 (navigation) → EXTRAIT** vers `ANCHOR_IDS_BY_LEVEL` /
  `COMPLEMENT_IDS_BY_LEVEL` ; `getSlotIdNextPrev/Previous/Index` routent par famille
  (`isAnchor`/`isComplement`). `SLOTIDS_BY_LEVEL` n'est **plus lu** par la navigation.
- **usages 2 et 3 → conservés** sur `SLOTIDS_BY_LEVEL` (valeur inchangée en phase B).
- **usage 4 (`getSlotIdFirstLevel`)** : renvoie `lundi` au niveau 3, alors que le
  **snapDate jour (B5)** veut l'ancre `today`. ⇒ introduire un helper « première ancre
  du niveau » (`ANCHOR_IDS_BY_LEVEL[level][0]`) et l'utiliser pour le snapDate jour ;
  laisser `getSlotIdFirstLevel` inchangé pour ses consommateurs actuels.

Comportement identique pour les ids existants : avant `today`, chaque niveau n'a
qu'une famille, donc `ANCHOR_IDS_BY_LEVEL[L]` / `COMPLEMENT_IDS_BY_LEVEL[L]`
reproduisent l'ancien `SLOTIDS_BY_LEVEL[L]`.

### Incréments TDD

**B1 — Séquences de navigation par famille (refactor interne, sans `today`)**
- Dériver de `SLOT_DEFS` : `ANCHOR_IDS_BY_LEVEL` `{1:[this_month,next_month], 2:[this_week,next_week,following_week]}` et `COMPLEMENT_IDS_BY_LEVEL` `{3:[lundi..vendredi], 4:[matin,aprem]}`.
- `getSlotIdNextPrev`/`getSlotIdPrevious`/`getSlotIdIndex` : router via `isAnchor(id)`/`isComplement(id)` vers la bonne séquence (au lieu de `SLOTIDS_BY_LEVEL[level]`).
- `SLOTIDS_BY_LEVEL` conservé pour vues/panel (valeur identique).
- Tests : non-régression navigation existante (this_week→next_week, lundi→mardi, débordements) + tests de routage. Golden inchangé.
- *Comportement identique → filet = suite verte.*

**B2 — Ajout `today`/`tomorrow` dans `SLOT_DEFS`**
- 2 lignes : `today` (anchor, relatifPresent, level 3), `tomorrow` (alias `today + 1`).
- `ANCHOR_IDS_BY_LEVEL[3] = [today, tomorrow]` (dérivé). `SLOTIDS_BY_LEVEL[3]` **reste** `[lundi..vendredi]` (ajuster la dérivation : catalogue d'affichage = compléments si présents au niveau, sinon ancres).
- Tests rouge→vert : `getSlotIdLevel('today')===3`, `getSlotIdFamily('today')==='relatifPresent'`, `isAnchor('today')`, `getSlotIdNextPrev('today',+1)==='tomorrow'`, `getSlotIdNextPrev('tomorrow',+1)==='tomorrow + 1'`, `getSlotIdPrevious('tomorrow')==='today'`, parser accepte `today`/`tomorrow`.
- Golden **mis à jour** (changement *intentionnel*) : `SLOTIDS_LST` et `weight` gagnent `today`/`tomorrow` ; assertion explicite que `SLOTIDS_BY_LEVEL[3]` est inchangé.
- ⚠️ Décider `weight['today']` : axe distinct des weekdays — voir « Risques ».

**B3 — Alias `today + 1` → `tomorrow`**
- `_branchAlias` (slot-branch.js) : ajouter le cas, comme `this_week + 1 → next_week`.
- Tests : `branchToExpr`/`getBranchHash` rendent `tomorrow` pour `today + 1`.

**B4 — `getSlotIdCurrent` conscient de la famille** ⚠️ incrément délicat
- Aujourd'hui `getSlotIdCurrent(3)` renvoie le **weekday** (utilisé par `branchComplete`/`getBranchCurrentPath` pour comparer aux jours absolus).
- Cible : distinguer **jour courant relatif** (`today`) du **jour courant absolu** (weekday projeté via snapDate). Probablement deux fonctions séparées, l'appelant choisit.
- Tests : ne pas casser `getSlotNextPrev` (comparaisons), ni `branchComplete`.

**B5 — snapDate jour**
- `slot-date.js` : `getDefaultDates` ajoute `{slotid:'today', date:<auj.>}` ; `getDate` gère niveau 3 (projette `today`/`tomorrow` et weekday → date) ; `shiftDate('day')` → +1 jour ; `getSnapDateToSave/Show` niveau 3.
- Le slotid du snapDate jour = **ancre** `today` (helper « première ancre du niveau »
  `ANCHOR_IDS_BY_LEVEL[3][0]`), **pas** `getSlotIdFirstLevel(3)` (qui renvoie `lundi`).
- Tests avec `getNow` mocké.

**B6 — `branchShift` conscient de la famille + « Démarrer Jour »**
- `slot-branch++.js` `branchShift` : un Démarrer de niveau L ne roule que les **ancres relatifPresent** de L ; laisse compléments et absolus **fixes**. ⇒ « Démarrer Jour » roule `tomorrow→today`, laisse `mardi` fixe.
- `action-shift.jsx` : 3ᵉ option `day` ; `getSnapDateToSave` niveau jour.
- Tests : `branchShift(today-branch,'day')`, non-régression `branchShift('week'|'month')`, et **`branchShift('day')` ne touche pas `mardi`**.

### Critère de fin de phase B
Suite verte + tsc ; changelog ; specs à jour si décisions prises ; **vues inchangées**
(les tâches `today` ne s'affichent pas encore — c'est la phase C).

### Risques / points ouverts (phase B)
- **`weight['today']`** : l'axe relatif jour n'est pas commensurable au cycle
  `lundi..vendredi` (1..5). Le tri/distance inter-familles au niveau jour (`getBranchWeight`,
  `slot-next-prev`) devra sans doute passer par une **projection via snapDate** plutôt
  que par `weight`. À cadrer ; peut déborder en phase C (prochain slot / tri).
- **`getSlotNextPrev`** : comparer une tâche `today` au « maintenant » — via date projetée.

---

## Phase C — Affichage (à concevoir, spec dédiée)

Comment rendre, dans **chaque** vue (arbre `slotviewtree`, liste `slotviewlist`),
les tâches selon leur famille de stockage :
- projeter `today` → weekday (vue arbre) ; afficher `aujourd'hui`/`demain` (vue liste) ;
- placer une tâche absolue/récurrente (`every 1 this_week mardi`) ;
- marqueur visuel de nature ; filtrage éventuel par nature.
Produira `docs/slot-view-spec.md` (mise à jour) + impl TDD.

## Phase D — Sélecteur (à concevoir)

UI du slot-picker pour choisir, à l'affectation d'une tâche, entre jour **roulant**
(`today`/`tomorrow`) et jour **fixe** (`mardi`), puis plus tard l'absolu.

## Phase E — Complément semaine `semaine N du mois` (futur)

Complément relatifParent niveau 2 raffinant le mois. La règle « famille » de
`branchShift` (B6) s'appliquera aussi au niveau semaine. Même patron que les weekdays.

## Phase F — Famille `absolu` (futur)

`mars` (mois de l'année), `semaine N de l'année`, `jour N de l'année` : ancres
auto-localisantes **fixes** (ne roulent pas). Exige un niveau année. Même rôle
« ancre » que relatifPresent mais référence = calendrier civil.
