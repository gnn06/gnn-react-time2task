import { Link } from "react-router-dom";
import Markdown from 'react-markdown'

export const RELEASE = 'xx/xx/2024'

const text = `
21/02/2024
==========
- Switch to supabase.co with authenticated access
- Manage login with refresh token
- Store user into Redux store and sessionStorage

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

02/03/2024
==========
- create NOREPEAT filter for tasks which don't have 'chaque' (found bug parsing this_week chaque mardi aprem)
- make 'title:' filter case insensitive
- create NONE filter for exact slot equality ('mercredi NONE' doesn't match 'mercredi aprem')

06/03/2024
==========
- create EVERY2 flag. Use it as 'EVERY2 this_week mardi'. At the end of week, change 'EVERY2 this_week' into 'EVERY2 following_week'. NOREPEAT manages EVERY2.
- bug fixes (crash filter 'mardi AND', 'this_month EVERY2 next_week jeudi', 'disable chaque lundi aprem this_week mercredi')
- refactoring

xx/xx/xxxx
==========
- refactor typescript as devDependency
- fix crash on filter 'mardi mercredi' with error message
`

export default function Changelog() {
    return <div>
        <Link to={'/'}>Retour à l'application</Link>
        <Markdown>{text}</Markdown>
    </div>
}