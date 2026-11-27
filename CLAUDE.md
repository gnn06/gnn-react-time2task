# Checklist de développement

## Phase de spécification

- Cohérence : les paragraphes ne se contredisent pas entre eux
- Complétude : tous les cas possibles ont une règle
- Ne pas commencer à coder avant que toutes les questions nécessaires au codage aient une réponse

## Design
- privilégier des modifications sur la couche data

## Pendant le développement

Le code doit toujours refléter la spécification — toute divergence est soit un bug, soit un signe que la spec doit être mise à jour.

- **TDD** : écrire un test qui échoue avant de toucher à l'implémentation — une règle de filtrage ou de partition doit être testée même si ses fonctions constitutives le sont déjà
- **DRY** : explorer le code existant avant d'écrire du nouveau — la logique, la valeur ou le type cherché existe peut-être déjà (opérations sur un type, fonctions du domaine comme `getSlotIdCurrent`)
- **Responsabilité unique** : chaque fonction/composant a une seule responsabilité — scinder puis composer plutôt que mélanger
- **Encapsulation** : préférer une méthode de classe à une fonction standalone quand la logique opère sur un objet existant
- **Nommage** : nommer d'après ce que fait la fonction (comportement mécanique), pas d'après son usage contextuel
- **Incohérence** : quand une implémentation s'écarte d'un pattern existant ou d'un choix fait ailleurs dans le code, le signaler avant de coder et choisir ensemble entre aligner et garder. Si l'écart est gardé, le commenter dans le code (pourquoi, et ce qui serait à harmoniser).

## En cas de correction de bug

Une fois le bug corrigé et les tests unitaires adaptés :

- **Analyse de variantes (priorité 1)** : rechercher dans le code si le même pattern d'erreur existe ailleurs (même logique erronée, même hypothèse incorrecte, même structure de code copiée/adaptée) — corriger la classe de bug, pas seulement l'occurrence
- **Couverture de test (priorité 2)** : vérifier que le correctif et les cas voisins identifiés sont bien couverts par les tests
- Si un ou plusieurs variants sont trouvés, les traiter comme des bugs à part entière (même cycle : test → fix → vérification)

## Après chaque modification

- Compilation : `npx tsc --noEmit`
- Tests unitaires : `npx vitest run`
- proposer un test visuel de confirmation

## En fin d'évolution

- Vérifier que la couverture de test correspond à la spec (cas nominaux + cas limites)
- Mettre à jour la spec si des décisions ont été prises pendant le développement
- Lancer les tests E2E Playwright (suite complète) et en rapporter le résultat
- Mettre à jour `src/components/changelog.jsx`

# Plan
-privilégier un découpage du plan qui favorise des résultats visuels dans la UI au plus tôt. Cela pour avoir un feedback visuel au plus tôt. Des choix temporaires peuvent faits qui seront mis au propre quand le rendu aura été validé au niveau visuel.

# Règles de collaboration (valables en local et en cloud)

- **Commit** : committer librement à la fin de chaque étape validée (`npx tsc --noEmit` et `npx vitest run` verts), sans demander confirmation, et indiquer le message après coup ; message sur une seule ligne, sans corps ni liste de fichiers
- **Push** : pousser librement sur les branches de développement (`feat/…`, `fix/…`, `chore/…`) ; ne jamais pousser directement sur `master`. Il ne reçoit que des fusions en squash : faites par l'utilisateur (PR ou squash local), ou par Claude via une PR sur demande explicite
- **Commandes shell** : pas de `cd` en préfixe (casse le matching des permissions) ; ne jamais rediriger la sortie (`tee`, `>`) sauf demande explicite
- **Tests Playwright** : lancer automatiquement la suite complète en fin d'évolution, une fois `npx tsc --noEmit` et `npx vitest run` verts, sans demander confirmation ; toujours contre la base dev (cf. règle Supabase)
- **Plan** : ne pas marquer ✅ FAIT sans confirmation explicite
- **Docs** : ne les modifier que sur demande ou si une décision d'architecture change
- **Supabase** : clé `anon` uniquement ; jamais de `service_role` dans le dépôt ni dans un `.env.*` ; les E2E ciblent la base dev (`icxyfpyfuamawldilhih`), jamais la prod
- **Spécification des vues** : source de vérité = page Notion « spéc-vue » (le `.md` du repo est une archive)
