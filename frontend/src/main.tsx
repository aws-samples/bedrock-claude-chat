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
import AdminPublicBotsPage from './pages/AdminPublicBotsPage.tsx';
import AdminBotApisPage from './pages/AdminBotApisPage.tsx';
import AdminBotApiManagePage from './pages/AdminBotApiManagePage.tsx';

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
        path: '/admin/public-bot/usages',
        element: <AdminPublicBotsPage />,
      },
      {
        path: '/admin/publish-apis',
        element: <AdminBotApisPage />,
      },
      {
        path: '/admin/bot/:botId',
        element: <AdminBotApiManagePage />,
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
