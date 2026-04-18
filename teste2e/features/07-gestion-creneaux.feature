# language: fr
Fonctionnalité: Gestion des créneaux d'une tâche
  En tant qu'utilisateur connecté
  Je veux affecter, modifier et supprimer des créneaux sur mes tâches
  Afin de planifier leur réalisation dans le temps

  Contexte:
    Étant donné que je suis connecté et sur la page principale

  Scénario: Affecter un créneau à une tâche sans créneau
    Étant donné qu'une tâche n'a pas de créneau (elle n'apparait pas dans le slot panel)
    Quand j'ouvre la dialog de sélection de créneau pour cette tâche
    Et que je sélectionne le créneau "this_week mardi"
    Et que je confirme
    Alors la tâche apparaît dans le slot panel sous "this_week mardi"

  Scénario: Changer le créneau d'une tâche déjà affectée
    Étant donné qu'une tâche est affectée au créneau "this_week lundi"
    Quand j'ouvre la dialog de sélection de créneau
    Et que je désélectionne "this_week lundi" et sélectionne "this_week mardi"
    Et que je confirme
    Alors la tâche apparaît dans le slot panel sous "this_week mardi"

  Scénario: Affecter plusieurs créneaux à une tâche
    Étant donné qu'une tâche n'a pas de créneau
    Quand j'ouvre la dialog de sélection de créneau
    Et que je sélectionne "this_week mercredi" et "this_week jeudi"
    Et que je confirme
    Alors la tâche apparaît dans le slot panel sous "this_week mercredi" et sous "this_week jeudi"

  Scénario: Ajouter une répétition sur un créneau
    Étant donné qu'une tâche est affectée au créneau "this_week" sans répétition
    Quand j'ouvre la dialog de sélection de créneau
    Et que j'active la répétition sur "this_week"
    Et que je confirme
    Alors la tâche apparaît dans le slot panel sous "this_week" et sous "next_week"
