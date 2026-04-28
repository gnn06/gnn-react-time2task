# Upgrades bibliothèques

Liste des upgrades majeures à réaliser, classées par risque.
Analyse basée sur la couverture de tests au 2026-04-12 (36 E2E Playwright + 789 Vitest).

## Todo

### Risque faible — y aller directement

- [x] **react-router-dom** 6.22.1 (fév. 2024) → 7.14.1 (avr. 2026) — *2 ans*
  - App SPA sur une seule page, navigation limitée
  - Test 01 (authentification) couvre le flux login/logout

- [x] **Vitest** 2.0.5 (juil. 2024) → 4.1.4 (avr. 2026) — *21 mois*
  - Upgrade outillage test, impact minimal sur le code applicatif

- [x] **TypeScript** 5.4.2 (mars 2024) → 6.0.3 (avr. 2026) — *2 ans*
  - Upgrade compilateur uniquement, pas d'impact runtime
  - Peut révéler de nouvelles erreurs de typage à corriger

- [x] **react-select** 5.8.0 (nov. 2023) → 5.10.2 (juil. 2025) — *20 mois* — même version majeure v5
  - Mise à jour mineure, API stable

### Risque moyen — y aller, surveiller

- [x] **Redux Toolkit** 1.9.5 (avr. 2023) → 2.11.2 (déc. 2025) — *32 mois*
- [x] **react-redux** 8.1.1 (juin 2023) → 9.2.0 (déc. 2024) — *18 mois*
  - Logique Redux bien couverte par Vitest
  - Les E2E valident que l'état global se comporte correctement

- [x] **Vite** 6.4.1 (oct. 2025) → 8.0.8 (avr. 2026) — *6 mois*
  - Saut de deux versions majeures (v6 → v8)
  - Vérifier la compatibilité des plugins : vite-plugin-svgr, vite-tsconfig-paths, @vitejs/plugin-react-swc
  - Tester le build de production (`npm run build`) et le déploiement gh-pages

- [x] **React** 18.2.0 (juin 2022) → 19.2.5 (avr. 2026) — *4 ans*
  - Changements de cycle de vie (useEffect, refs, Suspense) partiellement couverts
  - Zones non testées à surveiller : DnD, saisie inline (activity-input, syntax-input, edit-input)
  - ⚠️ **Régression de performance des tests E2E** : React 19.1 a introduit `captureOwnerStack` (stack traces enrichies en dev) qui ajoute un overhead majeur à chaque render en dev mode. `page.goto` passe de ~1s (React 18) à ~4s (React 19) sur localhost. Bug ouvert chez Facebook (issue #34339), pas de fix prévu. **Solution adoptée** : les tests E2E tournent sur un build de prod (`npm run build:e2e && vite preview`, port 4173) — `page.goto` retombe à ~400ms, suite complète en ~1m45 au lieu de ~5min.
  - ⚠️ **Bug découvert** : `login.jsx` appelait `supabase.auth.onAuthStateChange()` directement dans le render body → fuite mémoire (subscription jamais détruite, React 19 Strict Mode aggrave en dev). Corrigé : déplacé dans un `useEffect` avec `subscription.unsubscribe()` en cleanup.
  - ⚠️ **Bug découvert** : `slot-select-dialog.jsx` — stale closure sur `handleAdd`/`handleDelete` : deux clics rapides sur des créneaux différents perdaient le premier créneau. Corrigé : functional updates (`setSelection(prev => ...)`) + `slotsFromConf` dérivé via `useMemo`.
  - ⚠️ **Stabilité des tests E2E** : les tests vérifiant la présence de tâches dans le panneau de créneaux échouaient selon le mode d'affichage (tree/list) persisté en base. Corrigé : `global-setup.ts` force le mode `tree` via upsert sur `user_confs` avant chaque run.

- [x] **react-resizable-panels** 2.0.12 (mars 2024) → 4.10.0 (avr. 2026) — *25 mois*
  - Saut de deux versions majeures (v2 → v4) — fait en un seul saut (1 seul fichier, changements limités)
  - Breaking changes appliqués dans `task-container.jsx` : `PanelGroup` → `Group`, `PanelResizeHandle` → `Separator`, `direction` → `orientation`, `minSize={20}` → `minSize="20%"`
  - ⚠️ Resize et collapse non couverts par les tests automatiques — ✅ validés manuellement (avr. 2026)

- [x] **@supabase/supabase-js** 2.39.3 (janv. 2024) → 2.103.3 (avr. 2026) — *27 mois* — même version majeure v2
  - Authentification OAuth (login, logout, refresh token) couverte par les 5 tests E2E de la suite "Authentification"
  - API PostgREST (tasks, activities, snapDates, user_confs) mockée dans Vitest, couverte implicitement par les E2E
  - Surveiller les changements d'API auth (refreshSession, onAuthStateChange) et PostgREST

### Risque élevé — prévoir ajustements des tests

- [x] **MUI** 5.15.11 (fév. 2024) → 9.0.0 (avr. 2026) — *2 ans* — upgrade en 3 étapes (v5→v6→v7→v9) via `@mui/codemod`
  - Codemod `system-props` appliqué : props système (`display`, `alignItems`, etc.) migrées vers `sx` sur `Box`, `Stack` dans `appmenu.jsx`, `task-filter.jsx`, `task-list.jsx`
  - ⚠️ **`mui-nested-menu` v4 incompatible MUI v9** : `MenuItem` dans le sous-menu requiert `MenuListContext` (fourni par `MenuList`) ; `mui-nested-menu` enveloppe les children dans un `<div>` qui ne casse pas le contexte React mais déclenche une erreur MUI v9. Aucun fork v9-compatible disponible. **Solution** : composant `NestedMenuItem.jsx` custom — pas de `<div>` wrapper, `style={{ pointerEvents: 'none' }}` + `slotProps.paper.style={{ pointerEvents: 'auto' }}` sur le sous-menu pour ne pas intercepter les clics du backdrop parent, `onMouseEnter` pour ouvrir, `onClick` avec `stopPropagation` + ouverture (sans toggle) pour compatibilité `userEvent.click` dans les tests (userEvent envoie d'abord un mouseenter qui ouvre, puis le click — un toggle refermerait immédiatement).
  - **Sous-menus multiples** : `NestedMenuItem` est un composant contrôlé (`open` + `onOpenChange`). `FilterPanel` gère `openSubmenuKey` (string | null) — un seul sous-menu ouvert à la fois. Testé TDD : `filter-panel.test.jsx` "should close first submenu when opening a second one".
  - ⚠️ **`@mui/icons-material` barrel imports causent un hang Vitest** : `import { FilterList } from '@mui/icons-material'` charge les 2000+ icônes dans Vitest → hang infini. **Solution** : deep imports (`import FilterList from '@mui/icons-material/FilterList'`) dans tous les composants.
  - ⚠️ **`data-testid` conditionnel sur les icônes MUI** : MUI v9 ne positionne `data-testid="ClearIcon"` que si `NODE_ENV !== 'production'`. Donc pour avoir de bonnes perfs, il faut faire tourner les tests playwright sur un build. Si on utilise un build, on n'a pas les data-testid. Donc on rajoute les data-testid à la main. `vite build` force toujours `NODE_ENV=production` quel que soit le `--mode` passé (`--mode test` ne change que `import.meta.env.MODE`, pas `NODE_ENV`) → attribut absent dans le bundle E2E. **Solution** : `data-testid="ClearIcon"` ajouté explicitement sur les icônes `Clear` dans `filter-panel.jsx` et `slot-picker-button.jsx`.
  - `@testing-library/react` upgradé v14 → v16 en même temps : les hangs précédemment observés étaient causés par les barrel imports `@mui/icons-material` (corrigés), pas par Popper. v16 utilise `React.act` natif, plus aucun warning `act`.

- [x] **material-react-table** 2.13.0 (avr. 2024) → 3.2.1 (mars 2025) — *11 mois*
  - Upgrade principalement un bump de peer deps (MUI v5→v6+ en interne) — API publique inchangée
  - Utilisé uniquement dans `settings.jsx` (tableau CRUD des activités) — aucun test automatisé
  - Validé manuellement : affichage, édition, création (modal), suppression — ✅ OK (avr. 2026)
  - ⚠️ `@mui/x-date-pickers` est une peer dep requise de material-react-table — doit rester dans package.json même si non importé directement (Rolldown est strict sur les peer deps)
  - [x] `@mui/x-date-pickers` upgradé 8.28.3 → 9.0.4 (avr. 2026) — material-react-table v3 supporte `>=7.15`, v9 déclare `@mui/material@^9` → résout le blocage `--legacy-peer-deps`

- [x] **Storybook** 8.6.18 — **désinstallé** (avr. 2026)
  - `npm run storybook` était cassé depuis Vite 8 (`@storybook/react-vite@8.6.18` ne supporte que Vite `^4||^5||^6`)
  - Usage < 1 fois/mois — remplacé par `src/components/_stories_/` (pages de test custom légères, sans config)
  - Supprimé : 9 packages `@storybook/*`, `eslint-plugin-storybook`, `src/stories/`, `.storybook/`, scripts `storybook`/`build-storybook`
  - Bénéfice collatéral : `node-fetch` (transitive de Storybook) disparu → polyfills `node-fetch` obsolètes retirés de 7 fichiers de test (Node 18+ a `fetch` natif)

### Risque particulier — revue visuelle manuelle obligatoire

- [x] **Tailwind** 3.3.2 (avr. 2023) → 4.2.4 (avr. 2026) — *3 ans*
  - Migration via `@tailwindcss/vite` plugin (remplace PostCSS), codemod officiel appliqué
  - `vite.config.mjs` : plugin `tailwindcss()` de `@tailwindcss/vite`
  - `index.css` : `@import "tailwindcss/theme"` + `@import "tailwindcss/utilities"` (sans preflight pour ne pas casser MUI), `@layer theme, base, utilities` en tête pour garantir que les utilitaires l'emportent toujours sur `@layer base`
  - `@theme` : ajout de `--color-mui-primary: rgb(25 118 210)` pour utiliser la couleur MUI primary dans Tailwind

  **Cause principale des régressions visuelles** : en v3 avec `preflight: false`, les classes `border-*` ne généraient que `border-width` sans `border-style` → bordures invisibles. En v4, les utilitaires `border-*` et `divide-*` incluent `border-style: var(--tw-border-style)` (défaut `solid`) → toutes les bordures codées mais invisibles en v3 deviennent visibles.

  **Cas particulier `writing-mode: sideways-lr`** : en v4, `divide-x`/`divide-y` utilisent des propriétés logiques (`border-inline-start-width`, `border-block-start-width`). Sur `DashedRowHeader` (qui a `writing-mode: sideways-lr`), ces propriétés logiques mappent vers d'autres côtés physiques que prévu, laissant le défaut navigateur (`border-width: 3px` UA stylesheet) visible. **Fix** : inline styles explicites `borderLeftWidth: 1, borderRightWidth: 1` sur `DashedRowHeader` et `borderTopWidth: 1` sur `DashedColumnHeader`.

  **Corrections appliquées** :
  - `syntax-input.jsx` : `borderVariants` (`field` / `primary`), prop `variant` — `task-filter` passe `variant="primary"` (bleu MUI), `task-dialog` garde le défaut gris
  - `login.jsx` : `border-gray-500` explicite sur les deux inputs
  - `dashed-table.jsx` : `DashedRowHeader` → `borderLeftWidth: 1, borderRightWidth: 1` inline ; `DashedColumnHeader` → `borderTopWidth: 1` inline ; `border-e-2 border-b-2` conservés (bordure extérieure intentionnelle)
  - `slot.jsx` : suppression `border-2 border-gray-500` (code mort en v3, indésirable en v4)
  - `task-in-slot.jsx`, `task-row.jsx`, `task-row-new.jsx`, `slot-select.jsx`, `slot-picker-card.jsx`, `slot-animation.jsx` : suppression `border-2 border-gray-500/400` (idem)
  - `task-list.jsx` : suppression `divide-y divide-gray-600` sur `<tbody>` (invisible en v3 car pas de `border-style`, en v4 générait un trait continu solid entre les lignes)
  - ✅ 790 Vitest verts après migration (avr. 2026)

## Finalisation — après tous les upgrades

Une fois tous les upgrades terminés, reconstruire `node_modules` de zéro pour éliminer les résidus de `--legacy-peer-deps` et vérifier que l'arbre de dépendances est propre :

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
npm run test
npm run test:e2e
```

> ✅ **Blocage peer deps résolu (avr. 2026)** : `@mui/x-date-pickers` upgradé 8 → 9 déclare `@mui/material@^9` — `npm install` passe maintenant sans `--legacy-peer-deps`.

## Déjà à jour — aucune action requise

| Bibliothèque | Version installée | Vérifié le |
|---|---|---|
| **@dnd-kit/core** | 6.3.1 (déc. 2024) | avr. 2026 |
| **@dnd-kit/sortable** | 10.0.0 (déc. 2024) | avr. 2026 |
| **mui-nested-menu** | 4.0.3 — **remplacé** par `NestedMenuItem.jsx` custom (incompatible MUI v9) | avr. 2026 |

## Checklist par upgrade

Avant de commencer chaque upgrade :
- [ ] Identifier les composants qui utilisent la lib
- [ ] Vérifier la couverture de tests unitaires de ces composants
- [ ] Combler les lacunes critiques si nécessaire

Après l'upgrade :
- [ ] `npm run test` — 789 Vitest verts
- [ ] `npm run test:e2e` — 37 Playwright verts
- [ ] Consigner les tests unitaires manquants détectés dans "Zones de couverture insuffisante"
- [ ] Cocher l'entrée dans la liste Todo

## Zones de couverture insuffisante

Lacunes identifiées lors de l'analyse des upgrades — à combler avant ou pendant les upgrades concernés.

| Composant | Lib concernée | Tests unitaires | Risque |
|---|---|---|---|
| `status-input.jsx` | react-select | **aucun** | Régression silencieuse sur sélection de statut |
| `action-shift.jsx` | react-select | **aucun** | Régression silencieuse sur déclenchement d'action |
| `activity-input.jsx` | react-select | 1 test partiel | Cas limites et effacement non couverts |

Les tests E2E (filtrage 08, édition inline 05) couvrent ces composants indirectement, mais une régression dans le comportement du `Select` (options, valeur sélectionnée, callbacks) pourrait passer inaperçue sans tests unitaires ciblés.

| Composant | Lib concernée | Tests unitaires | Risque |
|---|---|---|---|
| `changelog.jsx` | react-router | **aucun** | Liens de navigation non vérifiés |
| `settings.jsx` | react-router | **aucun** | Liens de navigation non vérifiés |
| `error-page.jsx` | react-router | **aucun** | Rendu d'erreur de route non vérifié |
| `help-methodo-page.jsx` | react-router | **aucun** | Liens de navigation non vérifiés |
| `appmenu.jsx` | react-router | **aucun** | Liens de navigation non vérifiés |

Les tests E2E couvrent les flux de navigation principaux (login/logout, accès à l'app), mais les routes secondaires (`/help`, `/changelog`, `/settings`) ne sont pas exercées. Une régression sur un `Link` ou `useRouteError` passerait inaperçue.

| Composant | Lib concernée | Tests unitaires | Tests E2E | Risque |
|---|---|---|---|---|
| `dnd-container.jsx` | @dnd-kit + React 19 | **aucun** | **aucun** | ✅ Testé manuellement (avr. 2026) — OK |
| `draggable.jsx` | @dnd-kit + React 19 | **aucun** | **aucun** | ✅ Testé manuellement (avr. 2026) — OK |
| `droppable.jsx` | @dnd-kit + React 19 | **aucun** | **aucun** | ✅ Testé manuellement (avr. 2026) — OK |
| `sorted-task-list.jsx` | @dnd-kit + React 19 | **aucun** | **aucun** | ✅ Testé manuellement (avr. 2026) — OK |
| `syntax-input.jsx` | React 19 | 6 tests (`syntax-input.test.jsx`) | partiel (test 05) | Couvert |
| `edit-input.jsx` | React 19 | via task-row.test.jsx (saisie+Tab, blur) | partiel (test 05) | Acceptable — composant de 12 lignes, Enter et stopPropagation non testés mais stables |

React 19 change le comportement des ref callbacks (invoquées deux fois au montage en Strict Mode), mécanisme central des libs DnD. Le drag & drop n'est couvert ni par Vitest ni par Playwright — une régression serait détectée uniquement par test manuel.
