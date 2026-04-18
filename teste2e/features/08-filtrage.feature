# language: fr
Fonctionnalité: Filtrage des tâches
  En tant qu'utilisateur connecté
  Je veux filtrer les tâches affichées selon des critères
  Afin de me concentrer sur un sous-ensemble de tâches

  Contexte:
    Étant donné que je suis connecté et sur la page principale
    Et que plusieurs tâches avec des statuts et activités différents sont visibles

  Scénario: Filtrer par statut
    Quand j'ouvre le panel de filtres
    Et que je sélectionne un statut spécifique
    Alors seules les tâches avec ce statut sont affichées

  Scénario: Filtrer par activité
    Quand j'ouvre le panel de filtres
    Et que je sélectionne une activité spécifique
    Alors seules les tâches avec cette activité sont affichées

  Scénario: Réinitialiser les filtres
    Étant donné qu'un filtre est actif
    Quand je réinitialise les filtres
    Alors toutes les tâches sont à nouveau affichées

  Scénario: Filtrer par créneau
    Étant donné qu'une tâche est affectée à un créneau spécifique (mardi)
    Et qu'une autre tâche est affecté à un autre créneau spécifique (jeudi)
    Quand j'ouvre le sélecteur de créneau et que je sélectionne ce créneau (mardi)
    Alors seule la tâche affectée à ce créneau (mardi) est affichée

  Scénario: Réinitialiser le filtre créneau
    Étant donné qu'un filtre créneau est actif
    Quand je supprime le filtre créneau via l'icône Clear
    Alors toutes les tâches sont à nouveau affichées
