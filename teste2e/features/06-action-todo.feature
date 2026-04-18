# language: fr
Fonctionnalité: Action Todo
  En tant qu'utilisateur connecté
  Je veux basculer en masse les tâches visibles au statut "à faire"
  Afin de préparer rapidement ma liste de travail

  Contexte:
    Étant donné que je suis connecté et sur la page principale
    Et que des tâches visibles n'ont pas le statut "à faire"

  Scénario: Ouverture de la confirmation Todo
    Quand je clique sur le bouton "Todo"
    Alors une dialog de confirmation s'affiche
    Et le nombre de tâches concernées est indiqué

  Scénario: Confirmation de l'action Todo
    Quand je clique sur le bouton "Todo"
    Et que je confirme dans la dialog
    Alors les tâches qui n'étaient pas "à faire" passent au statut "à faire"

  Scénario: Annulation de l'action Todo
    Quand je clique sur le bouton "Todo"
    Et que j'annule dans la dialog
    Alors aucune tâche ne change de statut
