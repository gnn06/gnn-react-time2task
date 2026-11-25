import { makeFilterExpr } from './filter-engine.js';

const EMPTY_CONF = () => ({ expression: '', slots: [], genericFilters: {} });
const SLOTS_MAX = 2;

/**
 * Extrait de currentFilter la partie persistable : expression, slots et genericFilters.
 * Les prédicats slotexpr (fonctions, non sérialisables) deviennent `true`.
 * Les filtres inactifs (null, tableau vide) sont omis.
 */
export function serializeFilterConf(filter) {
    const conf = EMPTY_CONF();
    if (!filter) return conf;
    conf.expression = filter.expression ?? '';
    conf.slots = filter.slots ?? [];
    for (const [key, value] of Object.entries(filter.genericFilters ?? {})) {
        if (typeof value === 'function') {
            conf.genericFilters[key] = true;
        } else if (Array.isArray(value) && value.length > 0) {
            conf.genericFilters[key] = value;
        }
    }
    return conf;
}

/**
 * Reconstruit un filtre exploitable à partir d'une conf persistée.
 * Tout ce qui est invalide (clé inconnue, valeur absente des options, expression en erreur…)
 * est ignoré en silence.
 * @param saved conf persistée (peut être absente ou corrompue)
 * @param filterConfig config du menu Filtres (createFilterConfig), qui fournit options et prédicats
 */
export function restoreFilterConf(saved, filterConfig) {
    const conf = EMPTY_CONF();
    if (!saved || typeof saved !== 'object') return conf;

    if (typeof saved.expression === 'string' && !makeFilterExpr(saved.expression).error) {
        conf.expression = saved.expression;
    }

    if (Array.isArray(saved.slots)) {
        conf.slots = saved.slots
            .filter(slot => typeof slot === 'string' && slot !== '')
            .slice(0, SLOTS_MAX);
    }

    for (const [key, value] of Object.entries(saved.genericFilters ?? {})) {
        const config = filterConfig.find(f => f.key === key);
        if (!config) continue;
        if (config.type === 'slotexpr') {
            if (value === true) conf.genericFilters[key] = config.predicate;
        } else if (Array.isArray(value)) {
            const valid = value.filter(v => config.options.includes(v));
            if (valid.length > 0) conf.genericFilters[key] = valid;
        }
    }
    return conf;
}
