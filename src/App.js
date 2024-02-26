import TaskList from './components/tasklist';
import SlotList from './components/slotlist';
import Login from './components/login';
import AppMenu from './components/appmenu';
import { useSelector } from "react-redux";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  const userId = useSelector(state => state.tasks.user.id);
  const showSlot = JSON.parse(localStorage.getItem('showSlot') || 'true');
  return (
      <div>
        { userId ? (
          <div>
            <AppMenu/>
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