export function filterNoSlot(tasks, association) {
    return tasks.filter(task => association[task.id] == null);
}

export function filterSlotExpr(tasks, filter) {
    if (filter === 'no-filter') return tasks;

    return tasks.filter(item => item.slotExpr === filter);
}

export function findTaskWithSlot(tasks, slotId, association) {
    const assos = Object.entries(association).map(entry => entry[1] === slotId ? entry[0] : null);
    return tasks.filter(task => assos.indexOf(task.id) >= 0);
};

export function findTaskBySlotExpr(tasks, slotId) {
    return tasks.filter(task => slotMatchExpr(slotId, task.slotExpr));
}

export function slotMatchExpr(slotId, slotExpr) {
    const result = slotExpr !== undefined && slotExpr.indexOf(slotId) > -1;
    return result;
}