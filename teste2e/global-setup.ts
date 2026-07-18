import { FullConfig } from '@playwright/test';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { authenticate, backendFetch } from './helpers/backend';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

async function deleteTestTasks(token: string): Promise<void> {
    const res = await backendFetch(token, '/tasks?Sujet=like.E2E-TEST*', { method: 'DELETE' });
    if (!res.ok) {
        throw new Error(`Suppression des tâches de test échouée : HTTP ${res.status}`);
    }
}

async function deleteTestActivities(token: string): Promise<void> {
    const res = await backendFetch(token, '/Activities?label=like.E2E-*', { method: 'DELETE' });
    if (!res.ok) {
        throw new Error(`Suppression des activités de test échouée : HTTP ${res.status}`);
    }
}

/**
 * Force le mode d'affichage "tree" pour le user E2E.
 * Sans cela, les tests vérifiant la présence d'une tâche dans un créneau
 * échouent en mode "list" selon le jour de la semaine courant.
 */
async function setSlotViewToTree(token: string, userId: string): Promise<void> {
    const value = {
        slotViewFilterConf: {
            collapse: ['this_month next_week', 'this_month following_week', 'next_month'],
            remove: [],
            levelMin: null,
            levelMaxIncluded: null,
            view: 'tree',
            slotStrict: true,
            showRepeat: true,
        },
    };
    const res = await backendFetch(token, '/user_confs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ user_id: userId, conf: 'slotviewconf', value }),
    });
    if (!res.ok) {
        throw new Error(`Forçage du mode tree échoué : HTTP ${res.status}`);
    }
}

/**
 * Recrée l'activité de test après le nettoyage.
 * Les tests qui testent la sélection d'activité peuvent ainsi toujours sélectionner
 * une activité existante via onChange (synchrone), sans passer par handleCreate (async).
 */
async function createTestActivity(token: string): Promise<void> {
    const res = await backendFetch(token, '/Activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ label: 'E2E-activité' }),
    });
    if (!res.ok) {
        throw new Error(`Création de l'activité de test échouée : HTTP ${res.status}`);
    }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
    console.log('\n  Nettoyage des données de test (E2E-TEST/E2E-)...');
    const { token, userId } = await authenticate();
    await Promise.all([
        deleteTestTasks(token),
        deleteTestActivities(token),
        setSlotViewToTree(token, userId),
    ]);
    await createTestActivity(token);
    console.log('  Base de données nettoyée et données de référence créées.\n');
}
