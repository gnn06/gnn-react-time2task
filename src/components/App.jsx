import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Box, Stack } from '@mui/material';
import Paper from '@mui/material/Paper';

import Login from './login';
import AppMenu from './appmenu';
import TaskContainer from './task-container';
import { loadUserConfThunk } from '../features/userConfThunk';
import { loadLocalStorageThunk } from '../features/localstorageThunk';
import Mainbar from './main-bar';

function App() {
  const dispatch = useDispatch();
  
  const userId = useSelector(state => state.tasks.user.id);

  /* Chargement des données utilisateur depuis le localStorage au démarrage */
  useEffect(() => {
    dispatch(loadLocalStorageThunk());
  }, [dispatch]);

  /* Récupération de la conf utilisateur au démarrage
   * pour gérer le cas du F5 où l'utilisateur a déjà une session active 
   */
  useEffect(() => {
    if (userId) {
      dispatch(loadUserConfThunk(userId));
    }
  }, [userId, dispatch]);

  { if (!userId) {
    return <Login isSignIn={true}/>;
  }}

  return (
    <Stack sx={{ height:'100vh', width:'100vw', padding: 1, paddingBottom:0 }}>
      <AppMenu />
      <Box sx={{ marginY: 1 }}>
        <Paper elevation={1} sx={{ padding: 0.75, backgroundColor: 'white' }}>
          <Mainbar />
        </Paper>
      </Box>
      <TaskContainer/>
    </Stack>
  );
}

export default App;