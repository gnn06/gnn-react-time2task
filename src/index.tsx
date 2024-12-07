import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import ErrorPage from './components/error-page'
import HelpMethodo from './components/help-methodo-page.jsx';
import Changelog from './components/changelog';
import './assets/index.css'
import store from './features/store'
import { Provider } from 'react-redux'
import { createHashRouter, RouterProvider, } from "react-router-dom";
import Settings from './components/settings';
import Test from './components/test';
import TestExpr from './components/test-expr';

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
  },
  {
    path: "settings/",
    element: <Settings />,
  },
  {
    path: "test/",
    element: <Test />,
  },
  {
    path: "test-expr/",
    element: <TestExpr />,
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