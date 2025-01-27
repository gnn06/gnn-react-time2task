import { Link } from "react-router-dom";
import Markdown from 'react-markdown'

export const RELEASE = 'xx/xx/xxxx'

const text = `
xx/xx/xxxx
==========
- create status: filter ; FIX status 'fait-à repositinner' (wihout o)
- slot view conf can be change with json view
- drag and drop
- next_week as row

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