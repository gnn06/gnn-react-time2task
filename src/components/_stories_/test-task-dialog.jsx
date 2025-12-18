import TaskDialog from "../task-dialog";

export default function TestTaskDialog() {    
    const task = { id: "task1", title: "Task 1 lorem ipsum", slotExpr: "this_month this_week mercredi", activity: 4, order: 1,status:'A faire', nextAction:"todo", link: "https://www.google.fr/" };
    
    return <TaskDialog task={task} onCancel={null} onConfirm={null} />;  
}