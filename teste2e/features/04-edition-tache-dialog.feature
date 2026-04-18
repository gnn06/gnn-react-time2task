# language: fr
Fonctionnalité: Édition de tâche via la dialog
  En tant qu'utilisateur connecté
  Je veux modifier une tâche via la boîte de dialogue d'édition
  Afin de mettre à jour ses propriétés de manière détaillée

  Contexte:
    Étant donné que je suis connecté et sur la page principale
    Et qu'au moins une tâche est visible dans la liste

  Scénario: Ouverture de la dialog d'édition via le menu contextuel
    Quand j'ouvre le menu contextuel d'une tâche
    Et que je clique sur "Edit"
    Alors la dialog d'édition s'ouvre
    Et les champs sont préremplis avec les données de la tâche

  Scénario: Modification du titre via la dialog
    Quand j'ouvre la dialog d'édition d'une tâche
    Et que je modifie le titre
    Et que je valide
    Alors la tâche affiche le nouveau titre dans la liste

  Scénario: Modification de l'activité via la dialog
    Quand j'ouvre la dialog d'édition d'une tâche
    Et que je sélectionne une activité différente
    Et que je valide
    Alors la tâche affiche la nouvelle activité dans la liste

  Scénario: Modification du statut via la dialog
    Quand j'ouvre la dialog d'édition d'une tâche
    Et que je sélectionne un statut différent
    Et que je valide
    Alors la tâche affiche le nouveau statut dans la liste

  Scénario: Annulation de l'édition via la dialog
    Quand j'ouvre la dialog d'édition d'une tâche
    Et que je modifie le titre
    Et que j'annule
    Alors le titre de la tâche n'a pas changé dans la liste
