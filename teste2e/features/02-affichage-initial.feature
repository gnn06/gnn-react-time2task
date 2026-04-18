# language: fr
Fonctionnalité: Affichage initial de l'application
  En tant qu'utilisateur connecté
  Je veux voir les panels principaux et leurs contrôles au chargement
  Afin de démarrer mon travail immédiatement

  Contexte:
    Étant donné que je suis connecté et sur la page principale

  Scénario: Layout deux colonnes visible
    Alors le panel de slots est visible à gauche (sélecteur de vue présent)
    Et le panel de tâches est visible à droite (bouton Créer Tâche présent)

  Scénario: Contrôles de configuration du slot panel visibles
    Alors le sélecteur de vue est visible
    Et l'option "voir les répétitions" est visible
    Et l'option "Slot strict" est visible

  Scénario: Barre de commandes du panel tâches visible
    Alors le bouton "Créer Tâche" est visible
    Et le bouton "Todo" est visible
    Et le bouton "Démarrer Semaine" est visible

  Scénario: Table ou message vide affiché après chargement
    Quand les données sont chargées
    Alors soit la table des tâches est affichée (colonne Titre visible)
    Soit un message invitant à créer des tâches est affiché
