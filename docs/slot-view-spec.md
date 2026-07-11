# Spécifications fonctionnelles — Vue des slots

Deux vues présentent les mêmes tâches sous deux dispositions : le **mode arbre** (hiérarchie
mois > semaine > jour > heure) et le **mode liste** (grille temporelle Past / Present /
Future).

Le **vocabulaire** ci-dessous définit les termes du modèle (sans trancher de choix). La
**table de loi** énonce ensuite les décisions, une règle atomique par ligne — chaque règle
peut être violée par une implémentation, donc testée. Le **détail** en donne les
justifications. En cas de doute, la table de loi fait foi.

> Les alternatives conçues puis écartées (partition par famille, projection des weekdays)
> sont archivées dans `docs/slot-view-spec-dormant.md`.

---

## Vocabulaire

> Définitions du modèle. Elles clarifient, elles ne décident pas — on ne peut que les
> comprendre, pas y désobéir.

- **Famille du jour** : un créneau jour est soit **relatifParent** (`lundi`..`vendredi`,
  relatif à sa semaine), soit **relatifPresent** (`today`/`tomorrow`, relatif au présent).
- **Créneau mixte** : un créneau portant les deux familles à la fois (ex. `today jeudi`).
- **Tâche imprécise** : dont le créneau est exactement le slot affiché (pas de sous-niveau
  plus précis). **Tâche remontée** : dont le créneau pointe vers un slot plus profond, non
  visible dans la vue courante.
- **Grille de la vue liste** : lignes = niveaux (mois, semaine, jour), colonnes = **Past**
  (slot précédent), **Present** (slot courant), **Future** (slots futurs).

---

## Table de loi

### Vérité unique

- Le filtre courant seul décide quelles tâches sont visibles.
- Le panneau des créneaux et le panneau des tâches affichent le même ensemble.
- La configuration de vue décide la disposition, jamais la présence d'une tâche.
- Le tri des tâches se fait dans le filtre, pas dans la vue.

### Familles du jour

- Les deux familles ne fusionnent ni ne se réécrivent jamais : un même jour réel reste deux créneaux distincts.
- `today`/`tomorrow` sont ancrés sur le `today` stocké, pas sur l'horloge.
- Une tâche mixte apparaît sous chaque famille.

### Placement

- Une tâche s'affiche au slot le plus précis qui la contient et qui est visible.
- Si ce slot n'est pas visible, la tâche remonte au parent visible le plus proche.
- Le placement ne réécrit jamais le créneau de la tâche.

### Distinction imprécis / remonté

- Les tâches imprécises et remontées sont distinguables visuellement.
- Le marqueur d'imprécision n'apparaît que sous `this_month`, hors niveau heure.

### Construction

- La vue part d'une vue par défaut des slots proches.
- Un slot absent requis par une tâche est injecté.

### Mode arbre

- Les colonnes jour sont les weekdays `lundi`..`vendredi`.
- `today`/`tomorrow` s'affichent dans une section `rollingDays` séparée, sous la semaine courante seulement.
- `today`/`tomorrow` restent affichés même au week-end (quand leur jour tombe hors `lundi`..`vendredi`).
- Une tâche mixte est affichée deux fois : sous son weekday et sous `today`.

### Mode liste

- La case Future réunit tous les slots futurs (nextWeek, followingWeek, nextWeek+3).
- Au niveau jour, deux sections parallèles `rollingDays` et `weekDays` partagent les colonnes.
- `rollingDays` : `today` → Present, `tomorrow` → Future.
- `weekDays` : le jour de `today` → Present, le jour de `tomorrow` → Future.
- Les autres weekdays ne sont pas affichés et remontent à `this_week`.
- Une cellule `weekDays` hors `lundi`..`vendredi` est vide.
- La ligne `weekDays` est omise si ses deux cellules sont vides ; la ligne `rollingDays` reste.
- Les sous-lignes Matin/Aprem ne sont émises que si elles portent des tâches.

### Mise en forme (secondaire)

> Règles de présentation pure : elles règlent l'agencement visuel, jamais la visibilité
> d'une tâche ni sa position temporelle/hiérarchique.

- La colonne de titre matérialise la profondeur du niveau par des chevrons cumulés.
- Dans le tree, il n'y a pas de séparateur entre `weekDays` et `rollingDays` ; leurs en-têtes suffisent à distinguer les deux sections.
- Dans le tree, `today` est aligné sur la colonne de son jour stocké et `tomorrow` sur le lendemain — repère visuel, jamais une projection.
- Dans le tree au week-end, une cellule rolling sans colonne weekday va dans une colonne overflow en fin de ligne ; si `today` et `tomorrow` y tombent tous deux, ils sont empilés.
- En liste, les lignes vont du plus profond (heure, en haut) au plus superficiel (mois, en bas).
- En liste, les sections `rollingDays`/`weekDays` sont entrelacées par niveau (`rollingDays` puis `weekDays`), ce qui aligne verticalement le même jour réel sous ses deux familles.
- En liste au niveau jour, chaque cellule ne contient qu'un seul slot (ni empilement, ni overflow).

---

## Détail et justifications

### Vérité unique

Le **filtre courant est la seule source de vérité**. Le panneau des créneaux montre le même
ensemble que le panneau des tâches — tous deux affichent le résultat du même filtre. La
configuration de vue (mode, profondeur, nœuds réduits ou masqués) ne règle que la
**disposition**, jamais la présence d'une tâche.

Le tri (par famille de jour, par répétition, par créneau) se fait donc **en amont**, dans le
filtre. Les anciennes options de vue qui filtraient (inclure les weekdays, afficher les
répétitions, créneau strict) ont été retirées : elles violaient cet invariant.

### Familles du jour

- **relatifParent** : `lundi`..`vendredi`, relatifs à la semaine qui les contient.
- **relatifPresent** : `today`/`tomorrow`, relatifs à l'instant présent, ancrés sur le
  `today` **stocké** (pas l'horloge — sinon décalage si les jours ont été roulés manuellement).

Les familles restent distinctes même quand elles désignent le même jour réel : `today` stocké
un mercredi ≠ le mercredi de la semaine courante. La famille prime : un relatifPresent n'est
jamais assimilé au weekday de même rang. Une tâche mixte apparaît sous chaque famille (voir
chaque vue).

### Placement — remontée (bubbling)

Une tâche s'affiche au slot S si son créneau est égal à S ou contenu dans S, et n'est contenu
dans aucun sous-slot visible de S. Si le sous-slot d'accueil n'est pas visible (niveau trop
profond ou nœud réduit), la tâche remonte au parent visible le plus proche. Le placement ne
réécrit **jamais** le créneau : une tâche sans colonne dédiée remonte, elle n'est pas projetée
ailleurs.

### Distinction imprécis / remonté

Distinguer visuellement ces deux catégories permet de repérer les tâches pas encore assez
précisément planifiées. Le marqueur d'imprécision ne concerne que la branche `this_month`
(mois courant, `this_week` et ses jours) : le manque de précision n'est pas un problème pour
des slots non actionnables à court terme. Le niveau heure est exclu.

### Construction — injection dynamique

La vue par défaut couvre les slots courants et proches (mois en cours, semaines en cours et
suivantes, jours proches), mais pas tous les slots possibles. Un slot requis par une tâche et
absent de la vue par défaut est injecté — slots ordinaires (`following_week`) comme shiftés
(`following_week+1`, `next_month+1`).

### Mode arbre — section `rollingDays`

`today`/`tomorrow` n'ont pas de colonne weekday. Plutôt que de les projeter ou de les laisser
remonter à la semaine, ils occupent une section `rollingDays` séparée, sous la semaine
courante uniquement, avec ses sous-lignes Jour / Matin / Aprem.

La cellule `today` est positionnée dans la colonne du jour du `today` stocké, `tomorrow` dans
celle du lendemain. C'est un positionnement de colonne, pas une projection : le pire cas d'une
incohérence est un décalage cosmétique, jamais une tâche perdue.

Débordement week-end (app ouverte le week-end) : un jour hors `lundi`..`vendredi` va dans une
colonne overflow dédiée en fin de ligne. `today` un vendredi → `tomorrow` (samedi) déborde
seul ; `today` un samedi/dimanche → les deux débordent et sont empilés. Une tâche mixte
(`today jeudi`) est placée dans la colonne `jeudi` **et** dans la cellule `today` → deux fois.

Présentation : pas de séparateur entre `weekDays` et `rollingDays` ; la colonne de titre
distingue les sections par leurs libellés et matérialise la profondeur par des chevrons
cumulés (`› Mois`, `›› Semaine`, `››› weekDays`/`rollingDays`, `›››› Matin`/`Aprem`).

### Mode liste — sections `rollingDays` / `weekDays`

Miroir de la section `rollingDays` du tree, adapté à l'axe temporel. Les colonnes étant déjà
temporelles, today/tomorrow y tombent naturellement ; une seconde ligne accueille les
weekdays. Deux sections parallèles partagent les colonnes Present/Future :

- `rollingDays` : `today` → Present, `tomorrow` → Future.
- `weekDays` : le jour de `today` → Present, le jour de `tomorrow` → Future. Les autres
  weekdays ne sont pas affichés ; leurs tâches remontent à `this_week`.

L'ordre entrelacé par niveau (`rollingDays Matin`, `weekDays Matin`, puis Aprem, puis jour)
fait lire **le même jour réel sous ses deux familles** verticalement, puisque les sections
partagent les colonnes. Contrairement au tree : pas de projection ni de fusion, une cellule =
un seul slot (ni empilement, ni overflow). Bord week-end : une cellule `weekDays` hors
`lundi`..`vendredi` est vide, et la ligne `weekDays` est omise si ses deux cellules le sont.

---

## Exemples — mode liste

### Semaine courante, today stocké = mercredi (→ tomorrow = jeudi)

| Niveau | Past | Present | Future |
|--------|------|---------|--------|
| rollingDays | — | today | tomorrow |
| weekDays | — | mercredi | jeudi |
| semaine | — | this_week | next_week · following_week |
| mois | — | this_month | next_month · next_month+1 |

lundi, mardi, vendredi non affichés → remontent à `this_week`. Matin/Aprem s'ajoutent
au-dessus quand des tâches les occupent, dans l'ordre entrelacé.

### Affichage limité au niveau mois

Seule la ligne mois est affichée ; les sous-slots sont absents → toutes les tâches d'un mois
remontent à ce mois.

| Niveau | Past | Present | Future |
|--------|------|---------|--------|
| mois | — | this_month (↑ this_week, next_week, following_week) | next_month · next_month+1 |
