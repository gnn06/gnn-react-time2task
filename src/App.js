import TaskList from './components/tasklist';
import SlotList from './components/slotlist';
import Login from './components/login';
import Logout from './components/logout';
import { useSelector } from "react-redux";

function App() {
  const userId = useSelector(state => state.tasks.user.id);
  const showSlot = JSON.parse(localStorage.getItem('showSlot') || 'true');
  return (
      <div>
        { userId ? (
          <div>
            <Logout />
            <div className="flex flex-row text-sm">
              <TaskList />
              { showSlot ? <SlotList/>:'' }
            </div>
          </div>
        ) : (
          <Login />
        ) }
      </div>
  );
}

export default App;