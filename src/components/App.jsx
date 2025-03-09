import Login from './login';
import AppMenu from './appmenu';
import { useSelector } from "react-redux";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TaskFilter from "./task-filter.jsx";
import TaskContainer from './task-container';

function App() {
  const userId = useSelector(state => state.tasks.user.id);
  
  return (
      <div>
        { userId ? (
          <div className='h-screen flex flex-col'>
            <AppMenu className=''/>
            <TaskFilter />
            <TaskContainer/>
          </div>
        ) : (
          <Login isSignIn={true}/>
        ) }
      </div>
  );
}

export default App;