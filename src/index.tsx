import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorPage from './error-page'
import HelpMethodo from './components/help-methodo-page.jsx';
import Changelog from './components/changelog';
import './assets/index.css'
import store from './store/store'
import { Provider } from 'react-redux'
import { createBrowserRouter, createHashRouter, RouterProvider, } from "react-router-dom";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "help/",
    element: <HelpMethodo />,
  },
  {
    path: "changelog/",
    element: <Changelog />,
  }
]);


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/> 
    </Provider>
  </React.StrictMode>
);