import { authenticate, backendFetch } from './backend';

// Écriture directe du slotExpr d'une tâche en base. Utilisé pour les créneaux MIXTES
// (ex. "today jeudi") que le picker ne sait pas composer de façon fiable (sélection
// cross-famille non tranchée). La tâche doit déjà exister (créée via l'UI).
export async function setTaskSlotExpr(title: string, slotExpr: string): Promise<void> {
    const { token } = await authenticate();
    const res = await backendFetch(token, `/tasks?Sujet=eq.${encodeURIComponent(title)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ slotExpr }),
    });
    if (!res.ok) {
        throw new Error(`PATCH slotExpr échoué : HTTP ${res.status} ${await res.text()}`);
    }
}

// Purge les tâches de test (E2E-TEST*). Appelé en afterEach pour isoler chaque test :
// les assertions de vue portent sur l'occupation des slots, sensible à l'accumulation.
export async function deleteE2ETasks(): Promise<void> {
    const { token } = await authenticate();
    const res = await backendFetch(token, '/tasks?Sujet=like.E2E-TEST*', { method: 'DELETE' });
    if (!res.ok) {
        throw new Error(`Suppression des tâches E2E échouée : HTTP ${res.status}`);
    }
}

// Restaure la conf de vue par défaut (tree, niveau max = null). Nécessaire car changer le
// niveau max / la vue dans l'UI persiste la conf (saveUserConfThunk) : sans reset, un test
// qui réduit le niveau max fausserait la profondeur des tests suivants. Même valeur que globalSetup.
export async function resetViewConf(): Promise<void> {
    const { token, userId } = await authenticate();
    const value = {
        slotViewFilterConf: {
            collapse: ['this_month next_week', 'this_month following_week', 'next_month'],
            remove: [], levelMin: null, levelMaxIncluded: null, view: 'tree', slotStrict: true, showRepeat: true,
        },
    };
    const res = await backendFetch(token, '/user_confs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: userId, conf: 'slotviewconf', value }),
    });
    if (!res.ok) {
        throw new Error(`Reset de la conf de vue échoué : HTTP ${res.status}`);
    }
}
