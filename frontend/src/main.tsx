import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ChatPage from './pages/ChatPage.tsx';
import NotFound from './pages/NotFound.tsx';
import './i18n';
import BotExplorePage from './pages/BotExplorePage.tsx';
import BotEditPage from './pages/BotEditPage.tsx';
import { AdminRoute } from './pages/AdminRoute.tsx';
import { HomePage } from './pages/HomePage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/bot/explore',
        element: <AdminRoute><BotExplorePage /></AdminRoute>,
      },
      {
        path: '/bot/new',
        element: <AdminRoute><BotEditPage /></AdminRoute>,
      },
      {
        path: '/bot/edit/:botId',
        element: <AdminRoute><BotEditPage /></AdminRoute>,
      },
      {
        path: '/bot/:botId',
        element: <ChatPage />,
      },
      {
        path: '/:conversationId',
        element: <ChatPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
