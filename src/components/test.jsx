import TaskLight from './task-light';


export default function Test() {    
    const tasks = [
        { id: "task1", title: "Task 1 lorem ipsum", slotExpr: "this_month this_week mercredi", activity: 4, order: 1,status:'A faire' },
        { id: "task2", title: "préparer COPIL IFG / travailler slide", slotExpr: "this_month this_week mercredi", activity: null, order: 3,status:'fait-à repositionner' },
        { id: "task3", title: "Task 3", slotExpr: "this_month next_month", activity: null, order: 5, status:'fait' }
    ];
    
    return <div className='w-[338px]'>
        <TaskLight key="1" task={tasks[0]} />
        <TaskLight key="2" task={tasks[1]} />
        <TaskLight key="3" task={tasks[2]} />
    </div>
}