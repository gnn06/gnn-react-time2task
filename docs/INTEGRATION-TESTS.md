# Tests d'intégration Vitest

## Convention de nommage

Les tests d'intégration utilisent le suffixe **`.int.test.jsx`** (ou `.int.test.ts`).

- Vitest les ramasse automatiquement (le pattern `*.test.*` reste satisfait)
- Ils sont immédiatement identifiables dans l'arborescence, sans modifier la config
- Cohérent avec le pattern `*.pw.test.ts` déjà utilisé pour Playwright

**Exemples existants :**
- `src/components/App.int.test.jsx` — `useAppInitialized` + `AppLoader` via `App.jsx`
- `src/components/AppMenu.int.test.jsx` — `useGlobalLoading` + spinner dans `AppMenu` (inclut le cas : spinner absent pendant le démarrage)

---

## Quand utiliser un test d'intégration

Un test unitaire isole un composant en mockant ses dépendances. Un test d'intégration vérifie que **deux unités se câblent correctement** — sans mocker l'une d'elles.

Cas typique de ce projet : vérifier qu'`App.jsx` affiche bien `AppLoader` **parce que** `useAppInitialized` lit le bon état RTK Query, pas juste parce qu'une prop est fausse.

---

## Pattern : intégration avec RTK Query

### Store réel

Le store inclut `apiSlice.reducer` et `apiSlice.middleware` pour que les hooks RTK Query fonctionnent vraiment :

```jsx
import { apiSlice } from '../features/apiSlice';
import taskReducer from '../features/taskSlice';

function makeStore() {
    return configureStore({
        reducer: {
            tasks: taskReducer,
            [apiSlice.reducerPath]: apiSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware),
    });
}
```

### Mocks obligatoires

`apiSlice` importe des modules à effets de bord qu'il faut neutraliser :

```js
vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            refreshSession: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        }
    }
}));

vi.mock('../services/browser-storage', () => ({
    localStoreAccessToken: vi.fn(),
    localRemoveUser: vi.fn(),
    localRemoveAccessToken: vi.fn(),
    localRetrieveUser: vi.fn(),
    localRetrieveAccessToken: vi.fn(),
    localStoreUser: vi.fn(),
}));
```

Les thunks de démarrage sont également mockés pour éviter des effets de bord :

```js
vi.mock('../features/userConfThunk', () => ({ loadUserConfThunk: vi.fn(() => ({ type: 'noop' })) }));
vi.mock('../features/localstorageThunk', () => ({ loadLocalStorageThunk: vi.fn(() => ({ type: 'noop' })) }));
```

Les composants enfants lourds sont mockés pour isoler ce qu'on teste :

```js
vi.mock('./appmenu',       () => ({ default: () => <div>AppMenu</div> }));
vi.mock('./task-container',() => ({ default: () => <div>TaskContainer</div> }));
vi.mock('./main-bar',      () => ({ default: () => <div>Mainbar</div> }));
```

### Cas 1 — queries en cours (isLoading: true)

Mocker `fetch` pour qu'il ne résolve jamais : les queries RTK Query restent en état `pending`, `isLoading` est `true`.

```jsx
beforeEach(() => {
    vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));
});
afterEach(() => {
    vi.restoreAllMocks();
});

test('AppLoader affiché pendant le chargement initial', async () => {
    const store = makeStore();
    store.dispatch(login({ id: 'user-1', email: 'u@t.com', accessToken: 'tok' }));

    render(<Provider store={store}><App /></Provider>);

    await waitFor(() => {
        expect(screen.getByTestId('app-loader')).toBeInTheDocument();
    });
});
```

`waitFor` est nécessaire car RTK Query dispatche les queries dans un `useEffect` (après le premier render).

### Cas 2 — données déjà en cache (isLoading: false)

Pré-remplir le cache RTK Query avec `upsertQueryData` avant le render. Les queries trouvent des données → `isLoading: false` dès le premier render.

```jsx
test('AppLoader absent quand le cache est pré-rempli', async () => {
    const store = makeStore();

    await store.dispatch(apiSlice.util.upsertQueryData('getTasks',     { userId: 'user-1', activity: null }, []));
    await store.dispatch(apiSlice.util.upsertQueryData('getActivities', undefined, []));

    store.dispatch(login({ id: 'user-1', email: 'u@t.com', accessToken: 'tok' }));

    render(<Provider store={store}><App /></Provider>);

    expect(screen.queryByTestId('app-loader')).not.toBeInTheDocument();
});
```

La clé de cache passée à `upsertQueryData` doit correspondre exactement aux arguments que le hook reçoit à l'exécution (ici `{ userId, activity }` avec `activity: null` car c'est la valeur initiale dans `taskSlice`).

---

## Résumé

| Technique | Usage |
|---|---|
| `fetch` mocké (never resolves) | Simuler un chargement en cours |
| `apiSlice.util.upsertQueryData` | Simuler des données déjà chargées |
| Store complet avec `apiSlice` | Laisser les hooks RTK Query fonctionner réellement |
| Composants enfants mockés | Isoler ce qu'on teste sans bruit |
