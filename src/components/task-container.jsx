import { useSelector } from "react-redux";

import { filterSlotExpr } from '../data/task.js';
import { useGetTasksQuery } from "../features/apiSlice.js";
import TaskList from './tasklist';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SlotList from "./slotlist.jsx";

export default function TaskContainer() {
    // eslint-disable-next-line
    const userId   = useSelector(state => state.tasks.user.id);
    const activity = useSelector(state => state.tasks.currentActivity);
    const { data:tasksRedux, isLoading, isSuccess } = useGetTasksQuery({userId, activity})
    const currentFilter = useSelector(state => state.tasks.currentFilter);

    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentFilter);
        const panel1 = <SlotList tasks={tasks}/>
        const panel2 = <TaskList tasks={tasks}/>
        return (
            <PanelGroup direction="horizontal" className=''>
            <Panel className='' collapsible={true} minSize={20}>
              {panel1}
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-black"/>
            <Panel className='' collapsible={true} minSize={20}>
              {panel2}
            </Panel>           
          </PanelGroup>
        )
    }
}