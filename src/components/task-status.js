import Color from 'color';

function myColor(color) {
    return Color(color).lighten(0.4).string()
}

export const STATUS_LST = [
    {value: 'A faire' ,               color: myColor('#ef4444'), colorTail: 'red' },
    {value: 'en cours',               color: myColor('#eab308'), colorTail: 'yellow' },
    {value: 'fait'    ,               color: myColor('#22c55e'), colorTail: 'green' },
    {value: 'fait-à repositionner'  , color: myColor('#10b981'), colorTail: 'emerald' },
    {value: 'terminé' ,               color: myColor('#14b8a6'), colorTail: 'teal' },
    {value: 'archivé' ,               color: myColor('#6B7280'), colorTail: 'gray' },
    {value: 'reprendre aujourd\'hui', color: myColor('#a855f7'), colorTail: 'purple' },
    {value: 'reprendre demain'      , color: myColor('#d946ef'), colorTail: 'fuchsia' },
    {value: 'reprendre semaine'     , color: myColor('#ec4899'), colorTail: 'pink' },
]

