import React from "react";
import TaskList from './components/tasklist';
import SlotList from './components/slotlist';
import { useSelector } from "react-redux";

function App() {
  const slotRedux = useSelector(state => state.slot.slots);
  const taskRedux = useSelector(state => state.task.tasks);
  return (
    <div className="flex flex-row">
      <TaskList tasks={taskRedux}/>
      <SlotList slots={slotRedux} tasks={taskRedux}/>        
    </div>
  );
}

export default App;