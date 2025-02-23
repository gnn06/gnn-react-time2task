import { useSelector } from "react-redux";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import TaskPanel from './task-panel';
import SlotPanel from "./slot-panel";
import { useGetTasksQuery, useUpdateTaskMutation } from "../features/apiSlice.js";
import { filterSlotExpr } from '../data/task.js';
import { slotExprAdd } from "../data/slot-expr.js";

export default function TaskContainer() {
    // eslint-disable-next-line
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery({userId, activity})
    const currentFilter = useSelector(state => state.tasks.currentFilter);
    const [ updateTask ] = useUpdateTaskMutation()
    const [isDragging, setDragging] = useState(false)

    const onDndStart = (event) => {
      setDragging(true)
    }

    const onDnd = (event) => {
      setDragging(false)
      const source = event.active.id
      const dest   = (event.over && event.over.id) || undefined
      if (dest === undefined) return
      const task = tasksRedux.find(el => el.id === source)
      const newExpr = slotExprAdd(task.slotExpr, dest)
      // console.log("dnd source=" + source + ", dest=" + dest,"new expr=", newExpr)
      updateTask({id:source, slotExpr: newExpr})
    }

    // temporaly change overflow from hidden to visible to make the task visible on the other panel when drraging
    // panel use overflow:hidden to make panel collapsable.
    const styleDrag = isDragging ? {overflow:"visible"} : {overflow:"hidden"}

    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentFilter);
        const panel1 = <SlotPanel tasks={tasks}/>
        const panel2 = <TaskPanel tasks={tasks}/>
        return (
          <DndContext onDragEnd={onDnd} onDragStart={onDndStart}>            
            <PanelGroup direction="horizontal" className=''>
              <Panel className='' collapsible={true} minSize={20} >
                {panel1}
              </Panel>
              <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-black"/>
              <Panel className='' collapsible={true} minSize={20} style={styleDrag}>
                {panel2}
              </Panel>           
            </PanelGroup>            
          </DndContext>
        )
    }
}