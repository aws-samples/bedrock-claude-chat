import App from './App.tsx';
import ChatPage from './pages/ChatPage.tsx';
import NotFound from './pages/NotFound.tsx';
import BotExplorePage from './pages/BotExplorePage.tsx';
import BotEditPage from './pages/BotEditPage.tsx';
import BotApiSettingsPage from './pages/BotApiSettingsPage.tsx';
import AdminSharedBotAnalyticsPage from './pages/AdminSharedBotAnalyticsPage.tsx';
import AdminApiManagementPage from './pages/AdminApiManagementPage.tsx';
import AdminBotManagementPage from './pages/AdminBotManagementPage.tsx';
import { RouteObject } from 'react-router-dom';

export const routes = [
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
];

function getAllPaths(routes: RouteObject[]): string[] {
  return routes.flatMap((route) => {
    const fullPath = route.path ?? '';
    const childrenPaths = route.children ? getAllPaths(route.children) : [];
    return [fullPath, ...childrenPaths];
  });
}
export const allPaths = getAllPaths(routes);
