import TaskInSlot from "../task-in-slot";

export default function TestTaskInSLot() {    
    const task1 = { 
        id: "task1", 
        title: "Task 1 lorem ipsum", 
        slotExpr: "this_month this_week mercredi", 
        order: 1,
        status:'A faire', 
    };
    const task2 = { 
        id: "task1", 
        title: "Task 1 lorem ipsum", 
        slotExpr: "this_month this_week mercredi", 
        order: 1,
        activity: 3,
        status:'A faire', 
        nextAction:"todo", 
        url: "https://www.google.fr/" 
    };
    
    return <div className="w-1/5">
        <TaskInSlot task={task1}/>
        <TaskInSlot task={task2}/>
    </div> 
}