import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import Photography from './pages/photography';
import Biology from './pages/biology';
import JouleHome from './pages/joule-home';

const router = createHashRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      { path: 'joule-home', element: <JouleHome/> },
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
