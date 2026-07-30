raisonnement :
- sur le modèle de données et les changements d'états possibles.
- d'un point de vue fonctionnel-UI et non technique.
- pas de cas orienté UI comme utiliser cancel

hors scope : shift de vendredi ; en dehors des limites

modèle : `today`/`tomorrow` sont des **feuilles localisées niveau 3** sous `this_week`
(comme les weekdays). Un clic sur un créneau **contenu** raffine (`this_week` + today →
`this_month this_week today`) ; un créneau **disjoint** s'ajoute (today + mardi →
`this_month this_week today mardi`). Le retrait se fait par re-clic : clic sur une clé
exacte → désélection ; clic sur un ancêtre → remontée.

remarque : dans la suite "je remplace" cible une action utilise et non pas une attente fonctionnelle. Cela veut dire que l'utilisateur retire un créneau et en ajout un à son niveau.

# Les tests principaux

J'ouvre le picker sur une tâche qui a déjà un slot (this_week mardi, today, today matin…) → le slot apparaît sélectionné (gris), les ancêtres en gris clair

J'ouvre le picker sur une tâche tomorrow → tomorrow apparaît sélectionné

Je choisis un slot localisant comme this_month

Je choisis tomorrow depuis un état vide

Je raffine un this_month en this_week

Je remonte de this_week mardi vers this_week (this_week mardi sélectionné → clic this_week)

Je choisis this_week mardi

Je rajoute jeudi a thisWeek mardi

Je retire jeudi a thisWeek mardi jeudi

Je déselectionne le seul slot sélectionné (this_week mardi) → sélection vide, tous les slots repassent en bleu

Je choisis thisWeek mardi en repetitif

Je raffine this_week en today (today contenu dans this_week → `this_month this_week today`)

Je rajoute mardi à today (jours disjoints → `this_month this_week today mardi`)

Je raffine today en today matin

Je raffine thisWeek mardi en thisWeek mardi matin

Je remonte de today matin vers today (today matin sélectionné → clic today)

Je choisis today en repetitif

Je rajoute today à every thisWeek mardi

Je retire today à every thisWeek mardi

Je shift every thisWeek tout court ou avec mardi

Je shift today → tomorrow

Je shift tomorrow → today

Je rajoute today à every thisWeek 

Je retire today a every thisWeek 

Je remplace today par mardi dans every thisWeek 

Je raffine tomorrow en tomorrow matin

Je choisis tomorrow en répétitif

Je rajoute today quand tomorrow est sélectionné (accumulation → `this_month this_week tomorrow today`)

Je rajoute tomorrow quand today est sélectionné

Je rajotue today quand tomorrow est sélectionné

Les disables (dont disable sur today)

# Les tests secondaires

Je rajoute today aprem à today matin (accumulation, pas de remplacement)

