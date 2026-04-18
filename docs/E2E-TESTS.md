# Tests E2E Playwright

Tests de non-régression avant upgrade des bibliothèques (React, Redux Toolkit, MUI).

## Lancer les tests

```bash
npx playwright test
# ou via l'extension Playwright VS Code
```

## Fichiers de tests

| Fichier | Project Playwright | Scénarios couverts |
|---|---|---|
| `02-affichage-initial.pw.test.ts` | chromium | Layout, slot panel, barre de commandes |
| `03-creation-tache.pw.test.ts` | chromium | Créer une tâche, annuler, confirmer |
| `04-edition-tache-dialog.pw.test.ts` | chromium | Édition titre, statut, activité via dialog, annuler |
| `05-edition-tache-inline.pw.test.ts` | chromium | Édition titre, statut, activité inline dans la table |
| `06-action-todo.pw.test.ts` | chromium | Ouverture dialog, confirmation, annulation |
| `07-gestion-creneaux.pw.test.ts` | chromium | Affecter, changer, supprimer un créneau, répétitions |
| `08-filtrage.pw.test.ts` | chromium | Filtrage statut, activité, créneau, réinitialisation |
| `09-mode-vue.pw.test.ts` | chromium | Modes list/tree, option répétitions |
| `98-noauth-login.pw.test.ts` | chromium-unauth | Login, logout, redirection si non authentifié |
| `99-noauth-userconf.pw.test.ts` | chromium-unauth | Persistance des préférences utilisateur |

> Les fichiers `*-noauth-*` tournent sans session pré-injectée (project `chromium-unauth`).

## Décisions d'architecture

- **Appels réels Supabase** — pas de mocking réseau, les tests utilisent un compte de test dédié (`e2e@gorsini.fr`)
- **Exécution séquentielle** — `workers: 1` + `fullyParallel: false` dans `playwright.config.ts` (base partagée)
- **Navigateur** — Chromium uniquement (car plus rapide)
- **Données de test** — tâches préfixées `E2E-TEST`, activités préfixées `E2E-`

### Authentification par storageState

Les tests fonctionnels (projet `chromium`) utilisent une session pré-authentifiée via `storageState` :

1. **`setup-auth.ts`** (project `setup`) — se connecte via l'UI et sauvegarde l'état du navigateur dans `teste2e/.auth/user.json`
2. Le project `chromium` déclare `dependencies: ['setup']` et injecte `storageState: 'teste2e/.auth/user.json'` dans chaque page
3. `gotoAppAndLogin(page)` n'est donc plus nécessaire dans ces tests — la session est déjà active à la navigation

Les tests `*-noauth-*` (project `chromium-unauth`) ne bénéficient pas de ce mécanisme et gèrent leur propre login.

### Nettoyage de la base (globalSetup)

`teste2e/global-setup.ts` s'exécute avant tous les tests et :
- Supprime les tâches préfixées `E2E-TEST` et les activités préfixées `E2E-` via l'API Supabase REST
- Recrée l'activité de référence `E2E-activité` (utilisée dans les tests de sélection d'activité sans passer par `handleCreate`)
- Utilise les variables `E2E_EMAIL` / `E2E_PASSWORD` (fallback sur `e2e@gorsini.fr` / `e2e`)
- Charge `.env.test` manuellement (le globalSetup tourne en Node.js, sans accès aux variables `VITE_`)

### Authentification dans localStorage

La session Supabase est persistée dans `localStorage` (clé gérée par `browser-storage.js`). Le `storageState` de Playwright capture cet état, ce qui permet l'injection de session sans passer par le formulaire de login.

## Sélecteurs et patterns notables

- **Sélecteurs ARIA** en priorité : `getByRole`, `getByLabel`, `getByTestId`
- `data-slot-path` ajouté sur les composants `slot.jsx`, `slot-select.jsx`, `slot-picker-card.jsx` pour cibler les créneaux sans ambiguïté
- `data-testid="slot-picker-popper"` sur le Popper MUI du filtre créneau
- `aria-label="filtre-créneau"` sur le bouton `SlotPickerButton`
- `[data-slot-path="..."] div.title` pour cliquer sur un créneau dans un dialog (évite l'interception par les boutons de hover)

## Helpers

- `teste2e/helpers/login.ts` — `gotoAppAndLogin(page)`, `login(page)`, `logout(page)`
- `teste2e/helpers/tasks.ts` — `getTaskRowIndex`, `setInlineStatus`

## Workarounds connus

- **Fermeture menu Filtres** : `click` sur `.MuiBackdrop-root` — Escape ne fonctionne pas de façon fiable
- **React re-render après networkidle** : wraper les assertions dans `toPass({ timeout: 10000 })` si nécessaire
- **Bouton "Créer Tâche" présent 2 fois** : utiliser `.first()`
- **Filtrage MUI NestedMenuItem** : cibler `getByRole('checkbox', { name: '...' })` et non le menuitem parent
