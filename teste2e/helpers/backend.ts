import * as fs from 'fs';
import * as path from 'path';

// Primitives d'accès direct au backend (PostgREST + Supabase Auth), partagées par le
// globalSetup et les helpers de test qui manipulent la base hors UI (SnapDates, slotExpr).
// Tourne en Node : les variables VITE_ ne sont pas exposées via process.env, on lit .env.test.

function loadEnvFile(filePath: string): Record<string, string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
        const match = line.match(/^([A-Z_][^=]*)=(.*)$/);
        if (match) vars[match[1].trim()] = match[2].trim();
    }
    return vars;
}

const env      = loadEnvFile(path.resolve(__dirname, '../../.env.test'));
export const AUTH_URL = env.VITE_APP_AUTH_URL;
export const API_URL  = env.VITE_API_URL.replace(/\/$/, '');
export const ANON_KEY = env.VITE_API_KEY;

const E2E_EMAIL    = process.env.E2E_EMAIL    ?? 'e2e@gorsini.fr';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e';

export interface Session { token: string; userId: string; }

/** Login mot de passe Supabase → jeton d'accès + id utilisateur. */
export async function authenticate(): Promise<Session> {
    const res = await fetch(`${AUTH_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
        body: JSON.stringify({ email: E2E_EMAIL, password: E2E_PASSWORD }),
    });
    const data = await res.json() as { access_token?: string; user?: { id: string } };
    if (!data.access_token || !data.user?.id) {
        throw new Error(`Authentification échouée : ${JSON.stringify(data)}`);
    }
    return { token: data.access_token, userId: data.user.id };
}

/** Requête PostgREST authentifiée (apiKey + Bearer). Les headers passés s'ajoutent aux headers d'auth. */
export async function backendFetch(token: string, resourcePath: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${API_URL}${resourcePath}`, {
        ...init,
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
    });
}
