import { useSelector, useDispatch } from "react-redux";
import Task from './task';
import AddTaskForm from "../components/AddTaskForm";

import { filterSlotExpr } from '../data/task.js';
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
            <div className="m-1 ">
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
            </div>
            )        
        }
    }