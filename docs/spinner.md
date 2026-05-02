# Gestion des spinners de chargement

## Contexte

L'application dispose de deux indicateurs de chargement distincts, couvrant des phases différentes.

---

## 1. Spinner global (hors démarrage)

**Composant :** `AppMenu` — icône nuage (`CloudQueueIcon`) toujours visible, avec un `CircularProgress` centré par-dessus lors des requêtes actives.

**Comportement :**
- Nuage gris discret au repos
- Nuage bleu (primary) + anneau spinner pendant les requêtes
- `data-testid="global-spinner"` pour les tests Playwright

**Hook :** `src/hooks/useGlobalLoading.js`
- Retourne `true` quand des requêtes RTK Query sont en cours ET que l'app est initialisée
- Lit `state.api.queries` et `state.api.mutations` pour détecter les requêtes en statut `pending`
- Supprimé pendant le démarrage (`appInitialized = false`) pour ne pas interférer avec l'`AppLoader`

**Exclusion du démarrage :**  
La propriété `isLoading` de RTK Query est `true` uniquement lors du premier fetch (pas de données en cache). Une fois les données initiales reçues, `isLoading` reste `false` même lors des refetch. C'est ce mécanisme qui distingue démarrage et utilisation normale.

**Note technique :** `useIsFetching` et `useIsMutating` ont été retirés de RTK Query v2. La détection des requêtes actives passe par les sélecteurs Redux directs (`state.api.queries`, `state.api.mutations`).

---

## 2. Overlay de chargement initial

**Composant :** `src/components/app-loader.jsx` — `Backdrop` MUI plein écran (`data-testid="app-loader"`), `CircularProgress` 60px, texte "Time2Task".

**Comportement :**
- S'affiche après le login, tant que les données initiales ne sont pas prêtes
- Bloquant visuellement : le layout se monte en dessous (pour déclencher les queries) mais l'utilisateur ne voit rien
- Disparaît dès que tasks + activités sont chargées

**Hook :** `src/hooks/useAppInitialized.js`
- Retourne `false` tant que `getTasks` ou `getActivities` sont en `isLoading`
- Ignoré quand `userId` est vide (écran de login)
- Partagé avec `useGlobalLoading` pour éviter la duplication

**Données attendues avant affichage :**
- `getTasks` — liste des tâches (contenu principal)
- `getActivities` — liste des activités (fondamentales pour les filtres et l'édition)
- `getUserConf` — préférences de vue, chargées via thunk avant le montage des composants enfants, donc prêtes sans attente supplémentaire
- `getSnapDates` — non bloquant (utilisé uniquement dans la dialog "Démarrer Semaine")

---

## 3. Usage dans les tests Playwright

Deux helpers dans `teste2e/helpers/api.ts` :

### `waitForApiIdle(page)`

Attend la fin de toutes les requêtes RTK Query en cours (mutations et refetch). Remplace `waitForLoadState('networkidle')` et `waitForResponse()` dans les tests.

```ts
export async function waitForApiIdle(page: Page): Promise<void> {
    const spinner = page.getByTestId('global-spinner');
    try {
        await expect(spinner).toBeVisible({ timeout: 2000 });
    } catch {
        // La requête s'est terminée avant que le spinner soit détecté
    }
    await expect(spinner).not.toBeVisible({ timeout: 10000 });
}
```

Le `try/catch` gère le cas où la requête est très rapide et que le spinner n'a pas le temps d'apparaître.

### `waitForAppReady(page)`

Attend la disparition de l'overlay de chargement initial après un login.

```ts
export async function waitForAppReady(page: Page): Promise<void> {
    await expect(page.getByTestId('app-loader')).not.toBeVisible({ timeout: 15000 });
}
```

### Usage dans `helpers/login.ts`

```ts
await page.getByRole('button', { name: 'Login' }).click();
await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible({ timeout: 10000 });
await waitForAppReady(page);  // attend que les données initiales soient prêtes
```

---

## 4. Ce qui a été retiré

Les indicateurs de chargement éparpillés dans les composants ont été supprimés au profit de la solution globale :

| Fichier | Ce qui a été retiré |
|---|---|
| `create-task.jsx` | `CircularProgress` inline sur le bouton + `disabled={isSaving}` |
| `task-filter.jsx` | Texte "Chargement..." conditionnel |
| `task-container.jsx` | Guard `if (!isLoading && isSuccess)` → `if (tasksRedux)` |
| `activity-input.jsx` | `isLoading`, `isSuccess` inutilisés |
| `action-shift.jsx` | `if (isLoading) return` → `if (!tasksRedux) return null` |
| `slot-panel.jsx` | `useUpsertUserConfMutation` entièrement inutilisée |

Les `waitForLoadState('networkidle')` et `waitForResponse()` dans les tests E2E ont été remplacés par `waitForApiIdle` / `waitForAppReady`.

---

## 5. À faire (idées futures)

- Ajouter un spinner sur l'écran de login pendant l'appel `supabase.auth.signInWithPassword`
