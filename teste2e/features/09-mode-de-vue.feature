# language: fr
Fonctionnalité: Changement de mode de vue et configuration du slot panel
  En tant qu'utilisateur connecté
  Je veux changer le mode d'affichage des tâches et configurer le slot panel
  Afin d'adapter la vue à mon besoin du moment

  Contexte:
    Étant donné que je suis connecté et sur la page principale

  Scénario: Passer en vue arbre (tree)
    Quand je sélectionne le mode de vue "arbre"
    Alors les tâches sont affichées en vue arbre

  Scénario: Passer en vue liste (list)
    Quand je sélectionne le mode de vue "liste"
    Alors les tâches sont affichées en vue liste

  Scénario: Activer l'affichage des tâches répétées dans le slot panel
    Quand j'active l'option "show repeat" dans la configuration du slot panel
    Alors les tâches répétées sont visibles dans les slots

