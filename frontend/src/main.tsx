import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import './i18n';
import { routes } from './routes';

// unsafe
const router = createBrowserRouter(routes as unknown as RouteObject[]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
