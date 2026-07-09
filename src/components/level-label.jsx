// En-tête de niveau : chevrons cumulés matérialisant la profondeur (1=mois … 4=heure).
// L'en-tête est en writing-mode sideways-lr (texte de bas en haut, glyphes pivotés 90°
// anti-horaire). Les chevrons sont donc placés APRÈS le texte (→ visuellement au-dessus)
// et utilisent « ‹ » (pointe-gauche) qui, une fois pivoté, pointe vers le bas.
export const levelLabel = (depth, text) => (
    <>{text}<span style={{ fontSize: '1.5em', fontWeight: 600 }}>{' ' + '‹'.repeat(depth)}</span></>
);
