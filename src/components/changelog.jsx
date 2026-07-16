import { Link } from "react-router";
import Markdown from 'react-markdown'

export const RELEASE = 'xx/06/2026';

const text = `
xx/06/2026
==========
- vue tree : ordre des lignes réorganisé — ligne jour weekDays puis ligne jour rollingDays, puis les heures (Matin/Aprem) weekDays, puis les heures rollingDays ; les deux lignes jour sont désormais adjacentes en haut de la section
- vue tree : titres des lignes homogénéisés avec la vue list — les lignes heure portent désormais le libellé de famille (weekHours / rollingHours) au lieu de Matin / Aprem. Source unique des titres (ROW_TITLES / rowLabel) partagée entre les deux vues pour garantir des libellés identiques
- FIX vue list : ordre des lignes rétabli du plus profond au plus superficiel (jour/heure en haut, semaine, mois en dernier), inversé par erreur lors de l'ajout de la section weekDays
- vue list : au niveau jour, deux sections parallèles partageant les colonnes Past/Present/Future — « rollingDays » (today → Present, tomorrow → Future ; une cellule = un slot) et « weekDays » (today → Present ; les weekdays de la semaine après today → Future empilés ; avant today → Past empilés, à l'image de la case Future de la ligne semaine). Chaque weekday a désormais sa case : aucun ne remonte à this_week, qui ne garde donc que les tâches réellement imprécises (marqueur d'imprécision exact). Lignes entrelacées par niveau (rollingDays puis weekDays à chaque niveau Jour/Matin/Aprem) pour lire le même jour réel sous ses deux familles. Bord week-end : Present/Future vides, Past réunit les weekdays passés (ligne weekDays affichée). Sous-lignes Matin/Aprem uniquement si tâches
- vue tree : les tâches sur today / tomorrow s'affichent dans une section « rollingDays » sous la semaine courante (au lieu de remonter à la semaine), alignées sous la colonne du jour réel ; débordement week-end (ex. tomorrow un vendredi, ou today + tomorrow le week-end) dans une colonne dédiée en bout de ligne. Pas de projection : une tâche mixte today+jeudi apparaît dans les deux (colonne jeudi et section rollingDays)
- vue tree : la colonne de titre distingue la grille « weekDays » de la section « rollingDays » (plus de ligne séparateur) et matérialise la profondeur du niveau par des chevrons cumulés (› Mois, ›› Semaine, ››› weekDays / rollingDays, ›››› Matin / Aprem)
- SlotPanel : vérité unique — le SlotPanel affiche désormais exactement le même ensemble de tâches que le TaskPanel (filtre courant partagé). Le tree ne se limite plus aux tâches à jour fixe : toutes les tâches filtrées y sont disposées, celles sans colonne jour (today/tomorrow, imprécises) remontant par bubbling
- SlotPanel : options retirées au profit des filtres par prédicat — « Voir les tâches du jour » (→ filtres isWeekDay / isRelatifPresent), « voir les répétitions » (→ filtre isRepeat / NOREPEAT), « Slot strict » (→ le filtre créneau restreint déjà l'ensemble). La barre ne garde que le niveau et le type de vue
- projection weekday→today/tomorrow mise en pause (code conservé dormant), le placement se fait par bubbling
- filtre-créneau : nouveau filtre « isWeekDay » (n'affiche que les tâches ayant au moins un jour lundi..vendredi)
- filtre-créneau : nouveau filtre « isRelatifPresent » (n'affiche que les tâches ayant au moins un créneau sans jour précis : this_week, today, today aprem, today/jeudi… ; exclut les tâches épinglées à un jour lundi..vendredi comme this_week mercredi ou mercredi aprem)
- filtre-créneau : nouveau filtre « au moins une répétition » (n'affiche que les tâches répétées)
- filtre-créneau : on peut désormais filtrer sur les créneaux relatifs today / tomorrow et leurs créneaux matin / aprem (injectés sous this_week, à côté des weekdays)
- filtre-créneau : rendu des slots harmonisé avec le picker de tâche (fond gris par défaut, bleu pour le créneau sélectionné)
- list : option includeWeekDays — projette les tâches lundi..vendredi sur today/tomorrow (sinon this_week) pour tout voir pendant l'exécution de la journée (flag en base, sans contrôle UI)
- FIX list : avec includeWeekDays actif et un filtre today/tomorrow, les tâches projetées (ex. mardi → today) ne disparaissent plus ; projection appliquée avant le filtre, en amont des deux panneaux (grille slots + task-list synchronisés). Le libellé d'origine (mardi) reste affiché dans la task-list
- FIX filtre-créneau : filtrer par « mercredi » (slot picker) et filtrer par « today » produisent désormais le même résultat quand today est mercredi ; le slot du filtre est projeté vers today/tomorrow avant application (symétrique avec la projection des tâches)
- FIX list : avec includeWeekDays, une tâche d'une autre semaine (ex. next_week mercredi) n'est plus projetée sur today ; la projection vers today/tomorrow ne se fait que depuis this_week (date du weekday calculée dans sa vraie semaine)
- « Démarrer Jour » : roulement today/tomorrow via snapDate jour ; lundi..vendredi inchangés
- slot-picker : sélection multi-créneaux par accumulation (ex. today + un weekday coexistent)
- vues spécialisées : tree = tâches à jour fixe (lundi..vendredi) ; list = tout le reste (today/tomorrow, imprécis) ; tâches mixtes visibles dans les deux
- icône PushPin sur les tâches à jour fixe (lundi..vendredi)
- FIX next_slot = undefined when every 3 this_month
- UI : replace contextual menu of task row by edit button ; delete task moved into edit dialog
- FIX slot view tree : tâche avec following_week + N apparaissait sous this_month au lieu de son propre nœud
- add imprecise icon on task which need to be planified one level more
- add imprecise filter
- refactor slot-id : SLOT_DEFS source unique des définitions de slots + classifieurs famille/rôle (préparation today/tomorrow)

30/05/2026
==========
- add spinners
- fix : use of max level in slot view

29/04/2026
==========
- upgrade

16/04/2026
==========
- Todo action excludes 'terminé' and 'fait-à repositionner' tasks
- UI improvement in login page
- Dashed table in slot view tree
- UI add dashed border in task list

25/03/2026
==========
- tasks in 2 columns
- persist all configuration of slot view (show repeat, level, slot strit)

11/03/2026
==========
- move command with filter

08/03/2026
==========
- change 'list' slot view to grid
- change 'task' list UI (white background, dashed border)
- review app and filter toolbars, global UI improvement


26/02/2026
==========
- add filter menu

28/01/2026
==========
- add nextAction, url and favorite to table view

18/12/2025
==========
- add nextAction, url and favorite to task

07/12/2025
==========
- algn status in slot view
- can create activity directly from select.
- group table rows by activity

28/11/2025
==========
- sort task with mouse in slot view 

21/11/2025
==========
- add slot list view, 3 columns with arrows
- add status color in slot
- text filter ovverride slot filter

16/09/2025
==========
- compute date of nextr_week + 2
- text filtre override slot filter

10/03/2025
==========
- add contextual menu on row
- add sign up (hidden)
- UI lets show or hide repeat task in slot panel
- UI lets choice between strict or not slot filtering
- make slot and task panel scrollable keeping toolbar fixe

02/03/2025
==========
- Todo action limited to status != 'fait'
- add animation in shift dialog
- show repeated slot
- remove add and remove buttons in selection dialog
- filter by title without title:

18/02/2025
==========
- switch view
- add target button on slot to filter one slot and on task row to filter one task
- add drag&drop of task on slot
- add 'creer tâche' button
- remove slot expression field in task list and add 'choix créneau' button on row
- refact task detail dialog

03/02/2025
==========
- create status: filter ; FIX status 'fait-à repositinner' (wihout o)
- slot view conf can be change with json view
- drag and drop
- next_week as row
- add button to open slot selection in slot view
- filter persists over authentification expiration
- add CTRL-K to access filter field
- add collapse/expand in Slot view

09/01/2025
==========
- cleanup js console
- fix 401
- add reference date when shift

20/12/2024
==========
- FIX 'every this_week mardi disable jeudi' ; refactor parser

07/12/2024
==========
- new slot selection window, manage add, remove, repeat, disable, shift command, open with double click
- fix task with disable not showed 

15/10/2024
==========
- fix crash on error expression
- create text filter ERROR

07/10/2024
==========
- create isStatusARepo filter

25/09/2024
==========
- create isMulti filter and isDisable filter
- add 1, M, R for Unique, Multi Repear
- add choose of max level of slot view

29/07/2024
==========
- acitivty with color (except error et UT)
- migrate from create-react-app to vite & vitest + testing library with msw
- fix this_week disappearing when shift of 'every 1 this_week'

15/07/2024
==========
- task without order at end
- fix : crash when a task has no slot
- fix : order 0 not persisted

03/07/2024
==========
- fix : 'jeudi NONE' don't match 'week mardi jeudi' (multi)
- create filter EVERY1 (and rename EVERY2)
- 'every this_week' = 'every 1 this_week'
- fix : 'lundi NONE' matches 'week lundi'

27/06/2024
==========
- FIX : shift 'every 2 this_week' = 'every 2 next_week'
- fix : shift 'every 2 this_week lundi matin vendredi aprem' (parsing error)
- fix : group 'week' with 'this_week'
- fix : 'mercredi  NONE' don't match next_week

15/06/2024
==========
- introduces 'month', 'week' or 'day' ; 'chaque lundi' is deprecated, replace by 'week lundi'. Fix 'chaque lundi' invisible in slot view.

09/06/2024
==========
- fix 'every 2 this_week next_week', Refact Parser.

17/05/2024
==========
- 'every n', 'EVERY2' is deprecated

01/05/2024
==========
- create new task with last row of table

30/04/2024
==========
- create new task with last row of table

25/04/2024
==========
- manage next_(week|month) + 1, sort, filter, slot view, group, shift
- Can choose level to shift

13/04/2024
==========
- add an action to shift slots
- add an action to set task to 'to do'
- add an empty row to create new task

27/03/2024
==========
- when 'jeudi|(caret)', this_month is not automaticaly selected in the drpodown
- when 'title:something|(caret)' show all possible suggestions
- add icon on unique task
- add Group

20/03/2024
==========
- refactor typescript as devDependency
- fix crash when filter 'mardi mercredi' with error message
- fix 'this_month EVERY2 this_week jeudi' don't filtered by 'jeudi'
- unit test TaskFilter with testing-library ; add ID ; need keyCode refactor
- use status color in slot view
- add resizable panels
- better dropdown (filtering, showing)
- edit task in dialog
- enterNumpad

06/03/2024
==========
- create EVERY2 flag. Use it as 'EVERY2 this_week mardi'. At the end of week, change 'EVERY2 this_week' into 'EVERY2 following_week'. NOREPEAT manages EVERY2.
- bug fixes (crash filter 'mardi AND', 'this_month EVERY2 next_week jeudi', 'disable chaque lundi aprem this_week mercredi')
- refactoring

02/03/2024
==========
- create NOREPEAT filter for tasks which don't have 'chaque' (found bug parsing this_week chaque mardi aprem)
- make 'title:' filter case insensitive
- create NONE filter for exact slot equality ('mercredi NONE' doesn't match 'mercredi aprem')

26/02/2024
==========
- rajoute les slots manquants mercredi, jeudi et next_month
- fix parse many spaces
- fix empty slotExpr
- filter 'archivé' (don't use BDD view) with bdd "Etat" default value to 'A faire'
- add help on expression and methodo
- update order and title onBlur and enter key
- add help on expresion nito a dialog
- move methodo help into page, add react-router with error page, use hash  router for github pages
- add changelog page reachable from app menu, using react-markdown

21/02/2024
==========
- Switch to supabase.co with authenticated access
- Manage login with refresh token
- Store user into Redux store and sessionStorage
`

export default function Changelog() {
    return <div>
        <Link to={'/'}>Retour à l'application</Link>
        <Markdown>{text}</Markdown>
    </div>
}