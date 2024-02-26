import { useSelector } from "react-redux";
import Task from './task';
import AddTaskForm from "../features/AddTaskForm";
import TaskFilter from "./task-filter.jsx";

import { filterSlotExpr } from '../services/task.js';
import { useGetTasksQuery } from "../features/apiSlice.js";

export default function TaskList() {
    // eslint-disable-next-line
    const userId = useSelector(state => state.tasks.user.id);

    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery(userId)
    const currentTaskFilter = useSelector(state => state.tasks.currentTaskFilter);
    
    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentTaskFilter);
        return (
            <div className="m-1 w-full">
                <TaskFilter/>
                <h1>Tasks</h1>
                <table className="w-full">
                    <thead>
                    <tr><th>Titre</th><th>Créneau (expression)</th></tr>
                    </thead>
                    <tbody>
                    {tasks.map((task, index) => <Task key={task.id} task={task} />)}
                    </tbody>
                </table>
                <AddTaskForm />
                <div>
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
            </div>
            )        
        }
    }