import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'
import { createHashRouter, RouterProvider, } from "react-router-dom";
import './assets/index.css'
import store from './features/store'
import App from './components/App';
import ErrorPage from './components/error-page'
import HelpMethodo from './components/help-methodo-page.jsx';
import Changelog from './components/changelog';
import Login from './components/login';
import Settings from './components/settings';
import TestComponentRouter from './components/test-component-router';
import Test from './components/test';

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
    path: "signup/",
    element: <Login isSignIn={false} />,
  },
  {
    path: "changelog/",
    element: <Changelog />,
  },
  {
    path: "settings/",
    element: <Settings />,
  },
  {
    path: "test/:componentName",
    element: <TestComponentRouter />
  },
  {
    path: "test/",
    element: <Test />
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