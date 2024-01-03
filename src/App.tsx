import React from "react";
import TaskList from './components/tasklist';
import SlotList from './components/slotlist';

function App() {
  const showSlot = JSON.parse(localStorage.getItem('showSlot') || 'true');
  return (
    <div className="flex flex-row text-sm">
      <TaskList />
      { showSlot ? <SlotList/>:'' }
    </div>
  );
}

export default App;