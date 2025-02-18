import TaskDialog from './task-dialog';

export default function Test() {
    return <TaskDialog task={{id:12,title:"123",status:"A faire"}} onConfirm={null} onCancel={null}/>
}