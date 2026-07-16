// En-tête de niveau : chevrons cumulés matérialisant la profondeur (1=mois … 4=heure).
// L'en-tête est en writing-mode sideways-lr (texte de bas en haut, glyphes pivotés 90°
// anti-horaire). Les chevrons sont donc placés APRÈS le texte (→ visuellement au-dessus)
// et utilisent « ‹ » (pointe-gauche) qui, une fois pivoté, pointe vers le bas.
export const levelLabel = (depth, text) => (
    <>{text}<span style={{ fontSize: '1.5em', fontWeight: 600 }}>{' ' + '‹'.repeat(depth)}</span></>
);

// Source unique des titres de ligne, partagée par la vue tree et la vue list pour
// garantir des libellés identiques entre les deux vues. depth = profondeur du niveau
// (chevrons cumulés). Les deux familles heure (weekHours/rollingHours) sont au niveau 4 :
// dans le tree elles couvrent chacune deux lignes (Matin puis Aprem) portant le même titre.
export const ROW_TITLES = {
    mois:         { depth: 1, text: 'Mois' },
    semaine:      { depth: 2, text: 'Semaine' },
    weekDays:     { depth: 3, text: 'weekDays' },
    rollingDays:  { depth: 3, text: 'rollingDays' },
    weekHours:    { depth: 4, text: 'weekHours' },
    rollingHours: { depth: 4, text: 'rollingHours' },
};

// Rend l'en-tête d'une ligne à partir de sa clé de titre (cf. ROW_TITLES).
export const rowLabel = (key) => {
    const { depth, text } = ROW_TITLES[key];
    return levelLabel(depth, text);
};
