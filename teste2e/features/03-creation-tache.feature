# language: fr
Fonctionnalité: Création de tâche
  En tant qu'utilisateur connecté
  Je veux créer de nouvelles tâches
  Afin de les ajouter à mon plan de travail

  Scénario: Ouverture du formulaire de création
    Étant donné que je suis connecté et sur la page principale
    Quand je clique sur le bouton de création de tâche
    Alors un formulaire ou une dialog de saisie s'ouvre
    Et le champ titre est vide et focusé

  Scénario: Création d'une tâche avec un titre
    Étant donné que le formulaire de création est ouvert
    Quand je saisis un titre pour la tâche
    Et que je valide
    Alors la tâche apparaît dans la liste des tâches
    Et son titre correspond à ce que j'ai saisi

  Scénario: Annulation de la création
    Étant donné que le formulaire de création est ouvert
    Quand j'annule sans saisir de titre
    Alors aucune nouvelle tâche n'est ajoutée à la liste
