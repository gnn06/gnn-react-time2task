import { useDispatch, useSelector } from "react-redux";
import { DndContext } from "@dnd-kit/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import TaskPanel from './task-panel';
import SlotPanel from "./slot-panel";
import TaskDialog from "./task-dialog";
import { useGetTasksQuery, useUpdateTaskMutation } from "../features/apiSlice.js";
import { dragging, editTask } from "../features/taskSlice";
import { filterSlotExpr } from '../data/task.js';
import { slotExprAdd } from "../data/slot-expr.js";

export default function TaskContainer() {
    // eslint-disable-next-line
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery({userId, activity})
    const currentFilter = useSelector(state => state.tasks.currentFilter);
    const [ updateTask ] = useUpdateTaskMutation()
    const taskToEdit  = useSelector(state => state.tasks.editTask);
    const dispatch = useDispatch()

    const onDndStart = (event) => {
      dispatch(dragging(true))
    }

    const onDnd = (event) => {
      dispatch(dragging(false))
      const source = event.active.id
      const dest   = (event.over && event.over.id) || undefined
      if (dest === undefined) return
      const task = tasksRedux.find(el => el.id === source)
      const newExpr = slotExprAdd(task.slotExpr, dest)
      // console.log("dnd source=" + source + ", dest=" + dest,"new expr=", newExpr)
      updateTask({id:source, slotExpr: newExpr})
    }

    const onTaskDialogConfirm = (task) => {
      console.log('onTaskDialogConfirm', task)
      updateTask({id:task.id, title:task.title, slotExpr:task.slotExpr, activity: task.activity, status:task.status, order:task.order})
      dispatch(editTask(null))
    }

    const onTaskDialogCancel = () => {
      console.log('onTaskDialogCancel')
      dispatch(editTask(null))
    }

    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentFilter);
        const panel1 = <SlotPanel tasks={tasks}/>
        const panel2 = <TaskPanel tasks={tasks}/>
        return (
          <DndContext onDragEnd={onDnd} onDragStart={onDndStart}>            
            { taskToEdit && <TaskDialog task={taskToEdit} onCancel={onTaskDialogCancel} onConfirm={onTaskDialogConfirm}/>}
            <PanelGroup direction="horizontal" className="" >
              <Panel className='' collapsible={true} minSize={20} style={{}} >
                {panel1}
              </Panel>
              <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-black"/>
              <Panel className='' collapsible={true} minSize={20} style={{overflow:"visible"}}>
                {panel2}
              </Panel>           
            </PanelGroup>            
          </DndContext>
        )
    }
}