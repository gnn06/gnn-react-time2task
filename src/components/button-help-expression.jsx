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
                <h1 className=" text-lg mb-4 grow">Exemples de créneau</h1>
                <CloseIcon onClick={handleClose}/>
            </div>
            <ul>
                <li><span className="font-mono font-bold">mardi aprem</span></li>
                <li><span className="font-mono font-bold">mardi</span> pour une tache qu'on doit faire mardi sans savoir si ça sera le matin ou l'aprem</li>
                <li><span className="font-mono font-bold">this_week</span> pour une tache qu'on doit faire cette semaine sans savoir quel jour</li>
                <li><span className="font-mono font-bold">mardi mercredi</span> pour une tache à faire 2 fois dans la semaine sur 2 créneaux</li>
                <li><span className="font-mono font-bold">chaque lundi</span> pour une tache à faire chaque semaine le lundi</li>
                <li><span className="font-mono font-bold">chaque lundi chaque jeudi</span> pour une tache à faire chaque semaine 2 fois dans la semaine</li>
                <li><span className="font-mono font-bold">chaque lundi jeudi</span> pour une tache à faire chaque lundi mais aussi ce jeudi précisement</li>
                <li><span className="font-mono font-bold">disable chaque lundi jeudi</span> pour une tache qu'on fait habituellement le lundi mais qu'on fera cette semaine exceptionnellement le jeudi</li>
                <li><span className="font-mono font-bold">next_week mercredi</span> pour une tache à faire mercredi prochain</li>
                <li><span className="font-mono font-bold">next_week ou next_month</span> pour une tache à faire la semaine prochaine ou le mois prochain sans savoir quand</li>
            </ul>
    </div>
    </Dialog></div>)
}