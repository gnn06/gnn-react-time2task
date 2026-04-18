# language: fr
Fonctionnalité: Édition inline depuis la table de tâches
  En tant qu'utilisateur connecté
  Je veux modifier une tâche directement dans la ligne du tableau
  Afin de gagner du temps sans ouvrir de dialog

  Contexte:
    Étant donné que je suis connecté et sur la page principale
    Et qu'au moins une tâche est visible dans la table

  Scénario: Modification du titre inline
    Quand je clique sur le champ titre d'une tâche dans la table
    Et que je modifie le titre
    Et que je confirme la saisie (Tab ou Enter)
    Alors le titre de la tâche est mis à jour dans la table

  Scénario: Modification de l'activité inline
    Quand je clique sur le sélecteur d'activité d'une tâche dans la table
    Et que je sélectionne une activité différente
    Alors l'activité de la tâche est mise à jour dans la table

  Scénario: Modification du statut inline
    Quand je clique sur le sélecteur de statut d'une tâche dans la table
    Et que je sélectionne un statut différent
    Alors le statut de la tâche est mis à jour dans la table
