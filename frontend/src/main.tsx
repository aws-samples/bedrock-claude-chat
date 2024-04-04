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
import BotApiSettingsPage from './pages/BotApiSettingsPage.tsx';
import AdminSharedBotAnalyticsPage from './pages/AdminSharedBotAnalyticsPage.tsx';
import AdminApiManagementPage from './pages/AdminApiManagementPage.tsx';
import AdminBotManagementPage from './pages/AdminBotManagementPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <ChatPage />,
      },
      {
        path: '/bot/explore',
        element: <BotExplorePage />,
      },
      {
        path: '/bot/new',
        element: <BotEditPage />,
      },
      {
        path: '/bot/edit/:botId',
        element: <BotEditPage />,
      },
      {
        path: '/bot/api-settings/:botId',
        element: <BotApiSettingsPage />,
      },
      {
        path: '/bot/:botId',
        element: <ChatPage />,
      },
      {
        path: '/admin/shared-bot-analytics',
        element: <AdminSharedBotAnalyticsPage />,
      },
      {
        path: '/admin/api-management',
        element: <AdminApiManagementPage />,
      },
      {
        path: '/admin/bot/:botId',
        element: <AdminBotManagementPage />,
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
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
