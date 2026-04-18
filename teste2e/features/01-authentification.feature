# language: fr
Fonctionnalité: Authentification
  En tant qu'utilisateur
  Je veux pouvoir me connecter et me déconnecter
  Afin d'accéder à mes tâches de manière sécurisée

  Scénario: Affichage du formulaire de login
    Étant donné que je suis sur la page d'accueil sans session active
    Alors le formulaire de connexion est affiché
    Et les champs email et mot de passe sont visibles

  Scénario: Redirection vers le login sans session
    Étant donné que je navigue directement vers l'URL de l'application
    Et que je n'ai pas de session active
    Alors le formulaire de connexion est affiché
    Et l'interface principale n'est pas visible

  Scénario: Login réussi
    Étant donné que je suis sur le formulaire de connexion
    Quand je saisis un email et un mot de passe valides
    Et que je valide le formulaire
    Alors je suis redirigé vers l'application
    Et les panels de slots et de tâches sont visibles

  Scénario: Logout redirige vers le formulaire de login
    Étant donné que je suis connecté et sur la page principale
    Quand je clique sur le bouton de déconnexion
    Alors je suis redirigé vers le formulaire de connexion
    Et l'interface principale n'est plus visible

  Scénario: Impossibilité d'accéder à l'app après logout
    Étant donné que je viens de me déconnecter
    Quand je recharge la page
    Alors le formulaire de connexion est affiché
    Et je ne peux pas accéder à l'interface sans me reconnecter
