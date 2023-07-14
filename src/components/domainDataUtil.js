export default function filterNoSlot(tasks, association) {
    return tasks.filter(task => association[task.id] == null);
}