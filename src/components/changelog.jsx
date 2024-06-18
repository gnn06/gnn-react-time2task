import { Link } from "react-router-dom";
import Markdown from 'react-markdown'

export const RELEASE = '15/06/2024'

const text = `
xx/xx/2024
==========
- FIX : shift 'every 2 this_week' = 'every 2 next_week'
- fix : shift 'every 2 this_week lundi matin vendredi aprem' (parsing error)

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