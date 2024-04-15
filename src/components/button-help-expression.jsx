import { useState } from "react";
import Button from "./button";
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';

export default function DialogHelpExpression() {
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    const [open, setOpen] = useState(false)
    
    return (<div><Button label="Aide" className="text-sm" clickToto={handleOpen}/>
        <Dialog onClose={handleClose} open={open}  maxWidth="lg">
        <div className="p-3">
            <div className="flex flex-row">
                <h1 className=" text-lg mb-4 grow">Aide Créneaux / Etats</h1>
                <CloseIcon onClick={handleClose}/>
            </div>
            <p className="text-xl">Les créneaux</p>
            <ul>
                <li><span className="font-mono font-bold">mardi aprem</span></li>
                <li><span className="font-mono font-bold">mardi</span> pour une tache qu'on doit faire mardi sans savoir si ça sera le matin ou l'aprem</li>
                <li><span className="font-mono font-bold">this_week</span> pour une tache qu'on doit faire cette semaine sans savoir quel jour</li>
                <li><span className="font-mono font-bold">next_week mercredi</span> pour une tache à faire mercredi prochain</li>
                <li><span className="font-mono font-bold">next_week ou next_month</span> pour une tache à faire la semaine prochaine ou le mois prochain sans savoir quand</li>
                <li><span className="font-mono font-bold">mardi mercredi</span> pour une tache à faire 2 fois dans la semaine sur 2 créneaux différents</li>
                <li><span className="font-mono font-bold">chaque lundi</span> pour une tache à faire chaque semaine le lundi</li>
                <li><span className="font-mono font-bold">chaque lundi chaque jeudi</span> pour une tache à faire chaque semaine 2 fois dans la semaine</li>
                <li><span className="font-mono font-bold">chaque lundi jeudi</span> pour une tache à faire chaque lundi mais aussi ce jeudi exceptionnnel ; par exemple, si vous n'avez pas pu la finir lundi</li>
                <li><span className="font-mono font-bold">disable chaque lundi jeudi</span> pour une tache qu'on fait habituellement le lundi mais qu'on fera cette semaine exceptionnellement le jeudi</li>
                <li><span className="font-mono font-bold">this_month this_week lundi aprepm</span> est un créneau complet mais on peut omettre les 1° créneaux.</li>
                <li><span className="font-mono font-bold">EVERY2 this_week lundi</span> pour une tache qu'on fait une semaine sur 2. Chaque semaine, on changera en séquence le créneau de this_week, next_week, following_week.</li>
                <li>La liste de tous les créneaux : <span className="font-mono font-bold">this_month, next_month, this_week, next_week, following_week, lundi, mardi, mercredi, jeudi, vendredi, matin,     aprem </span> </li>
            </ul>
            <p className="text-xl">Les états</p>
            <p>A faire, en cours, fait de façon classique.</p>
            <p>Pour une tache qui se répète, la mettre 'fait' quand vous l'avez faite. Le lendemain, au début de la journée, vous la refaites passer à 'à faire'.</p>
            <p>Utiliser 'Terminée', pour une tâche répétive qui ne doit plus se répèter.</p>
            <p>Utiliser Reprendre aujourdhui, Reprendre demain, pour une tache que vous n'avez pas pu finir aujourd'hui et que vous devez repositionner sur un autre créneau pour la finir</p>
            <p>Archivé pour une tache que vous ne voulez plus voir.</p>
    </div>
    </Dialog></div>)
}