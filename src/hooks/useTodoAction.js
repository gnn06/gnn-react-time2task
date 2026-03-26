import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { filterSlotExpr } from '../data/task.js';
import { useGetTasksQuery, useUpdateTaskMutation } from "../features/apiSlice.js";

export function useTodoAction() {
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const currentFilter = useSelector(state => state.tasks.currentFilter);
    const { data: tasksData } = useGetTasksQuery({userId, activity})
    const [ updateTask, { error: updateError } ] = useUpdateTaskMutation()

    const [show, setShow] = useState(false);
    const [hideErrorDialog, setHideErrorDialog] = useState(false);

    const tasks = useMemo(() => {
        const filtered = filterSlotExpr(tasksData || [], currentFilter);
        return filtered.filter(t => t.status !== "A faire" && t.status !== "terminé" && t.status !== "fait-à repositionner");
    }, [tasksData, currentFilter]);

    const onTodo = () => {
        setShow(true)
    }

    const handleTodoCancel = () => {
        setShow(false)
    }

    const handleTodoConfirm = () => {
        setShow(false)
        setHideErrorDialog(false)
        for(const t of tasks) {
            updateTask({id: t.id, status: 'A faire'})
        }
    }

    const handleErrorDialogConfirm = () => {
        setHideErrorDialog(true)
    }

    return {
        tasks,
        show,
        updateError,
        hideErrorDialog,
        onTodo,
        handleTodoCancel,
        handleTodoConfirm,
        handleErrorDialogConfirm
    };
}
