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

## Après chaque modification

- Compilation : `npx tsc --noEmit`
- Tests unitaires : `npx vitest run`

## En fin d'évolution

- Mettre à jour `src/components/changelog.jsx`
- Vérifier que la couverture de test correspond à la spec (cas nominaux + cas limites)
- Mettre à jour la spec si des décisions ont été prises pendant le développement
- Proposer de lancer les tests E2E Playwright (ne pas les lancer sans accord)

# Plan
-privilégier un découpage du plan qui favorise des résultats visuels dans la UI au plus tôt. Cela pour avoir un feedback visuel au plus tôt. Des choix temporaires peuvent faits qui seront mis au propre quand le rendu aura été validé au niveau visuel.
