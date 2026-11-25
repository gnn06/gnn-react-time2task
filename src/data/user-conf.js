/**
 * Indexe les lignes de la table user_confs (PostgREST) par clé de conf : { [conf]: value }.
 * Une réponse vide ou invalide donne un objet vide.
 */
export function indexConfRows(rows) {
    if (!Array.isArray(rows)) return {};
    const result = {};
    for (const row of rows) {
        if (row?.conf) result[row.conf] = row.value;
    }
    return result;
}
