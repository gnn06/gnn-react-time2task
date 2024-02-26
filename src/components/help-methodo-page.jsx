import { Link } from "react-router-dom";

export default function HelpMethodo() {
    return <div>
        <Link to={'/'}>Retour à l'application</Link>
        <h1 className=" text-lg">Méthode :</h1>
        <p>Commencez par lister vos taches sans réfléchir aux créneaux puis associer chaque tache à un créneau.</p>
        <p>En début de mois, positionner les taches sur des semaines et pas à la journée</p>
        <p>En début de semaine, positionner les taches par jour et pas sur le matin ou l'aprem</p>
        <p>En début de journée, positionner sur le créneau horaire et trier les tâches</p>
        <p>A chaque début de créneau, filtrez les taches pour voir uniquement ce que vous avez à faire sur ce créneau. Restez concentré sur ces tâches.</p>
        <p>Le matin, organiser la journée. Le soir, oraganiser le lendemain</p>
        <p>Le matin, tenir compte de votre agenda du jour (réunions prévues) pour bien voir le temps dispo pour traiter les tâches.</p>
        <p>En début de journée, bien remettre 'à faire' toutes les taches y compris les récurrentes</p>
        <p>Lorsqu'une tache est à reprendre demain, mettre l'état à reprendre_demain</p>
        <p>En fin de journée, regarder les taches 'à reprendre' et s'assurer qu'elle ont un créneau sur le lendemain. Conseil : ne gardez alors qu'un seul créneau.</p>
        <p>A la fin de la semaine, faire passer les taches de next_week à this_week et following_week à next_week</p>
        <p>Conseil : l'outil n'a pas à vocation d'historiser ce que vous faites. Les vieilles tâches terminées vont polluées votre vision.</p>
        <p>Conseil : organisez vos taches journalières AVANT de consulter vos emails ou teams le matin. En lisant vos emails, rajouter des tâches.</p>

    </div>
}