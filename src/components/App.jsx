import TaskList from './tasklist';
import SlotList from './slotlist';
import Login from './login';
import AppMenu from './appmenu';
import { useSelector } from "react-redux";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TaskFilter from "./task-filter.jsx";

function App() {
  const userId = useSelector(state => state.tasks.user.id);
  return (
      <div>
        { userId ? (
          <div className='p-0'>
            <AppMenu className=''/>
            <TaskFilter className=''/>
            <PanelGroup direction="horizontal" className=''>
                <Panel className='' collapsible={true} minSize={20}>
                  <TaskList />
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-black"/>
                <Panel className='' collapsible={true} minSize={20}>
                  <SlotList/>
                </Panel>           
              </PanelGroup>
          </div>
        ) : (
          <Login />
        ) }
      </div>
  );
}

export default App;