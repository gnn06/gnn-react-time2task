import React from "react";
import initialData from './store/initial-data';
import TaskList from './components/tasklist';
import SlotList from './components/slotlist';

class App extends React.Component {
  
  state = initialData;

  render() {
    const tasks = this.state.tasks;
    const slots = this.state.slots;
    
    return (
      <div className="flex flex-row">
        <TaskList tasks={tasks}/>
        <SlotList slots={slots} tasks={tasks}/>
      </div>
    );
  }
}

export default App;
