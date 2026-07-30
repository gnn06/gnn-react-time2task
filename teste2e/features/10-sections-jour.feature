# language: fr
Fonctionnalité: Sections jour rollingDays / weekDays des deux vues
  En tant qu'utilisateur connecté
  Je veux voir mes tâches réparties dans les sections rollingDays et weekDays
  Afin de distinguer les jours relatifs au présent (today/tomorrow) des jours de la semaine

  # Ces scénarios dépendent du `today` STOCKÉ (SnapDates), pas de l'horloge : chaque
  # scénario le fixe explicitement pour un rendu déterministe, puis le restaure.

  Contexte:
    Étant donné que je suis connecté et sur la page principale

  # --- Vue LISTE : axe Past / Present / Future ---

  Scénario: Liste, today mercredi — rollingDays et weekDays sur le present
    Étant donné que le today stocké est un mercredi
    Et que je suis en vue liste
    Alors la ligne "rollingDays" affiche "today" en Present et "tomorrow" en Future
    Et la ligne "weekDays" affiche "mercredi" en Present

  Scénario: Liste, weekDays — seuls les jours Past/Future porteurs de tâche s'affichent
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau "mardi"
    Et qu'une tâche est affectée au créneau "vendredi"
    Et que je suis en vue liste
    Alors la ligne "weekDays" affiche "mardi" en Past et "vendredi" en Future
    Et "lundi" et "jeudi" (vides) ne sont pas affichés

  Scénario: Liste, weekDays — le Present reste affiché même vide
    Étant donné que le today stocké est un mercredi
    Et qu'aucune tâche n'est affectée à un weekday
    Et que je suis en vue liste
    Alors la ligne "weekDays" affiche "mercredi" en Present
    Et les cases Past et Future de "weekDays" sont vides

  Scénario: Liste, week-end — la ligne weekDays est omise, rollingDays reste
    Étant donné que le today stocké est un samedi
    Et qu'aucune tâche n'est affectée à un weekday
    Et que je suis en vue liste
    Alors la ligne "rollingDays" est affichée
    Et la ligne "weekDays" n'est pas affichée

  Scénario: Liste, ligne heure — une tâche sur today matin s'affiche au niveau heure
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau "today matin"
    Et que je suis en vue liste
    Alors la ligne heure rollingDays est affichée et porte la tâche
    Et la tâche n'est pas dupliquée dans la case jour de today (placée au slot le plus précis)

  # --- Vue ARBRE : colonnes weekday + section rollingDays ---

  Scénario: Arbre, today mercredi — today/tomorrow alignés sous leur colonne
    Étant donné que le today stocké est un mercredi
    Et que je suis en vue arbre
    Alors la cellule "today" est alignée sous la colonne "mercredi"
    Et la cellule "tomorrow" est alignée sous la colonne "jeudi"
    Et la section rollingDays est sous la semaine courante uniquement

  Scénario: Arbre, tâche mixte (colonnes différentes) — affichée sous son weekday et sous today
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau mixte "today jeudi"
    Et que je suis en vue arbre
    Alors la tâche apparaît sous la colonne "jeudi" de la ligne weekDays
    Et la tâche apparaît aussi dans la cellule "today" (alignée sous "mercredi") de la ligne rollingDays

  Scénario: Arbre, tâche mixte sur le même jour réel — familles non fusionnées
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau mixte "today mercredi"
    Et que je suis en vue arbre
    Alors la tâche apparaît sous la colonne "mercredi" de la ligne weekDays
    Et la tâche apparaît aussi dans la cellule "today" de la ligne rollingDays
    Et les deux occurrences tombent dans la même colonne "mercredi"

  Scénario: Arbre, week-end — today et tomorrow empilés dans la colonne overflow
    Étant donné que le today stocké est un samedi
    Et que je suis en vue arbre
    Alors "today" et "tomorrow" sont empilés dans la colonne overflow en fin de ligne

  # --- Vérité unique : le filtre courant pilote AUSSI la vue (SlotPanel ≡ TaskPanel) ---
  # Un filtre étranger aux créneaux (statut) doit réduire le contenu de la vue comme
  # celui de la liste des tâches : les deux panneaux affichent le même ensemble.

  Scénario: Liste, vérité unique — le filtre statut masque la tâche dans la vue
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche "en cours" est affectée au créneau "mardi"
    Et qu'une tâche "à faire" est affectée au créneau "jeudi"
    Et que je suis en vue liste
    Quand je filtre sur le statut "en cours"
    Alors la tâche "mardi" reste visible dans la vue et dans la liste des tâches
    Et la tâche "jeudi" disparaît de la vue et de la liste des tâches

  Scénario: Arbre, vérité unique — le filtre statut masque la tâche dans la vue
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche "en cours" est affectée au créneau "mardi"
    Et qu'une tâche "à faire" est affectée au créneau "jeudi"
    Et que je suis en vue arbre
    Quand je filtre sur le statut "en cours"
    Alors la tâche "mardi" reste visible dans la vue et dans la liste des tâches
    Et la tâche "jeudi" disparaît de la vue et de la liste des tâches

  # --- Filtrage par slot : cas cross-famille today + mercredi ---
  # Le filtre par créneau accepte jusqu'à 2 slots (union). today (relatifPresent) et mercredi
  # (relatifParent) désignent le même jour réel quand today est stocké un mercredi, mais restent
  # deux familles distinctes : filtrer sur les deux montre les tâches des deux, pas les autres.

  Scénario: Filtrer par deux slots today et mercredi (cross-famille)
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau "today"
    Et qu'une tâche est affectée au créneau "mercredi"
    Et qu'une tâche témoin est affectée au créneau "jeudi"
    Quand je filtre sur les créneaux "today" et "mercredi"
    Alors la tâche "today" et la tâche "mercredi" restent visibles dans la vue et dans la liste des tâches
    Et la tâche témoin "jeudi" disparaît de la vue et de la liste des tâches

  # --- Bubbling : réduire le niveau max fait remonter la tâche (elle reste visible) ---
  # Une tâche affectée à un slot plus profond que le niveau affiché ne disparaît pas :
  # elle remonte au parent visible le plus proche.

  Scénario: Liste, bubbling — réduire le niveau max au niveau semaine fait remonter la tâche
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau "mardi"
    Et que je suis en vue liste
    Alors la tâche apparaît au niveau jour, sous "mardi"
    Quand je règle le niveau le plus profond sur "semaine"
    Alors la ligne jour n'est plus affichée
    Et la tâche remonte sous "this_week" et reste visible

  Scénario: Arbre, bubbling — réduire le niveau max au niveau semaine fait remonter la tâche
    Étant donné que le today stocké est un mercredi
    Et qu'une tâche est affectée au créneau "mardi"
    Et que je suis en vue arbre
    Alors la tâche apparaît au niveau jour, sous "mardi"
    Quand je règle le niveau le plus profond sur "semaine"
    Alors la ligne jour n'est plus affichée
    Et la tâche remonte sous "this_week" et reste visible
