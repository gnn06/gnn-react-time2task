import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

// Lecture du fichier .env.test — le globalSetup tourne en Node.js,
// les variables VITE_ ne sont pas exposées via process.env.
function loadEnvFile(filePath: string): Record<string, string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
        const match = line.match(/^([A-Z_][^=]*)=(.*)$/);
        if (match) vars[match[1].trim()] = match[2].trim();
    }
    return vars;
}

const env        = loadEnvFile(path.resolve(__dirname, '../.env.test'));
const AUTH_URL   = env.VITE_APP_AUTH_URL;
const API_URL    = env.VITE_API_URL.replace(/\/$/, '');
const ANON_KEY   = env.VITE_API_KEY;
const E2E_EMAIL    = process.env.E2E_EMAIL    ?? 'e2e@gorsini.fr';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e';

async function authenticate(): Promise<{ token: string; userId: string }> {
    const res = await fetch(`${AUTH_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': ANON_KEY,
        },
        body: JSON.stringify({ email: E2E_EMAIL, password: E2E_PASSWORD }),
    });
    const data = await res.json() as { access_token?: string; user?: { id: string } };
    if (!data.access_token || !data.user?.id) {
        throw new Error(`Authentification échouée : ${JSON.stringify(data)}`);
    }
    return { token: data.access_token, userId: data.user.id };
}

async function deleteTestTasks(token: string): Promise<void> {
    const res = await fetch(`${API_URL}/tasks?Sujet=like.E2E-TEST*`, {
        method: 'DELETE',
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error(`Suppression des tâches de test échouée : HTTP ${res.status}`);
    }
}

async function deleteTestActivities(token: string): Promise<void> {
    const res = await fetch(`${API_URL}/Activities?label=like.E2E-*`, {
        method: 'DELETE',
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${token}`,
        },
    });
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
    const res = await fetch(`${API_URL}/user_confs`, {
        method: 'POST',
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${token}`,
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
    const res = await fetch(`${API_URL}/Activities`, {
        method: 'POST',
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
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
