import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Photography from './Photography';
import Biology from './Biology';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>
  },
  {
    path: '/photography',
    element: <Photography/>
  },
  {
    path: '/biology',
    element: <Biology/>
  }
]);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
