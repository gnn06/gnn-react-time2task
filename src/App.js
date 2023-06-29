import React from "react";
import TaskList from './components/tasklist';
import SlotList from './components/slotlist';

function App() {
  return (
    <div className="flex flex-row">
      <TaskList />
      <SlotList />        
    </div>
  );
}

export default App;