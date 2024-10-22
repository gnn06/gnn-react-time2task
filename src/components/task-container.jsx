import { useSelector } from "react-redux";

import { filterSlotExpr } from '../data/task.js';
import { useGetTasksQuery } from "../features/apiSlice.js";
import TaskList from './tasklist';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SlotList from "./slotlist.jsx";
import { supabase } from '../services/supabase'
import { login, accessToken } from "../features/taskSlice";
import { useDispatch } from "react-redux";
import { storeUser, storeAccessToken, removeUser, removeAccessToken } from "../services/browser-storage";

export default function TaskContainer() {
    // eslint-disable-next-line
    const userId      = useSelector(state => state.tasks.user.id);
    const activity    = useSelector(state => state.tasks.currentActivity);
    // unused AccessToken used to make a refresh on refreshToken
    const TMP_AccessToken = useSelector(state => state.tasks.accessToken);
    const { data:tasksRedux, isLoading, isSuccess, error, refetch } = useGetTasksQuery({userId, activity, TMP_AccessToken})
    const currentFilter = useSelector(state => state.tasks.currentFilter);
    const dispatch = useDispatch();
    async function tryRefreshToken(e) {
      console.log('try refresh token')  
      const { data, error } = await supabase.auth.refreshSession()
      console.log('token refreshed', data.session, error)
      storeAccessToken(data.session.access_token)
      dispatch(accessToken(data.session.access_token))
      // Redux use its cache event if token was refreshed
      // can use refetch() to make RTK query make a call with the new token
      // using accessToken as argument of useQuery make Redux refetch data when accessToken change !
    }
    console.log('container (token, isloading, error)', TMP_AccessToken.substring(71,71+20) + "..." + TMP_AccessToken.substring(TMP_AccessToken.length - 20,),  isLoading, error)
    if (error && error.status === 401) {
      tryRefreshToken()
    }
    if (!isLoading && isSuccess) {
        const tasksFetched = tasksRedux.slice();
        const tasks = filterSlotExpr(tasksFetched, currentFilter);
        return (
            <PanelGroup direction="horizontal" className=''>
            <Panel className='' collapsible={true} minSize={20}>
              <TaskList tasks={tasks}/>
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-black"/>
            <Panel className='' collapsible={true} minSize={20}>
              <SlotList tasks={tasks}/>
            </Panel>           
          </PanelGroup>
        )
    }
}