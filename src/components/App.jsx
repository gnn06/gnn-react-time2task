import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Login from './login';
import AppMenu from './appmenu';
import TaskFilter from "./task-filter.jsx";
import TaskContainer from './task-container';
import { useLazyGetUserConfQuery } from '../features/apiSlice';
import { setSlotViewFilterConfView } from '../features/taskSlice';

function App() {
  const dispatch = useDispatch();
  
  const userId = useSelector(state => state.tasks.user.id);
  const [triggerGetUserConf, { data: userConfResp }] = useLazyGetUserConfQuery();

  /* Récupération de la conf utilisateur dans App.jsx plutôt que Login.jsx
   * pour gérer le cas où l'utilisateur a déjà une session active 
   */
  useEffect(() => {
    if (userId) {
      triggerGetUserConf({ userId, conf: 'view' });
    }
  }, [userId, triggerGetUserConf]);

  useEffect(() => {
    if (!userConfResp) return;
    // supporte plusieurs formes de réponse : { data: ... } | [ { value|filter: ... } ] | objet direct
    const confObj = userConfResp.data ?? (Array.isArray(userConfResp) && userConfResp.length
      ? (userConfResp[0].value ?? userConfResp[0].filter ?? userConfResp[0])
      : userConfResp);
    if (confObj) dispatch(setSlotViewFilterConfView({ view: confObj }));
  }, [userConfResp, dispatch]);

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