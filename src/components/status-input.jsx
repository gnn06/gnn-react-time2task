import { useSetEtatMutation } from "../features/apiSlice.js";

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
        onClick={onClick} onChange={onChange}>
        <option value="A faire">A faire</option>
        <option value="fait">fait</option>
    </select>
}
