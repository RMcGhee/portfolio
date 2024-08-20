import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import Photography from './photography';
import Biology from './biology';

const router = createHashRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      { path: 'photography', element: <Photography/> },
      { path: 'biology', element: <Biology/> },
    ]
  },
]);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
