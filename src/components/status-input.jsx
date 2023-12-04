import { useSetEtatMutation } from "../features/apiSlice.js";

const statusReferentiel = [
    'A faire', 
    'en cours',
    'fait', 
    'reprendre aujourd\'hui',
    'reprendre demain', 
    'reprendre semaine', 
    'terminé'
];

export default function SyntaxInput({task}) {
    const [
        setStatus,
        { isLoading: isUpdating }, // This is the destructured mutation result
      ] = useSetEtatMutation()
    
    
    const onChange = e => {
        const taskId = task.id;
        const taskStatus = e.target.value;
        setStatus({id:taskId, status: taskStatus})
    };
    
    const onClick = e => {
        e.stopPropagation();
    };

    return <select defaultValue={task.status}
        onClick={onClick} onChange={onChange}
        className="bg-transparent">
        { statusReferentiel.map(st => <option value={st}>{st}</option>)}
    </select>
}
