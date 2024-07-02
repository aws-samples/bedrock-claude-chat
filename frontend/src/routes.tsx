import App from './App.tsx';
import ChatPage from './pages/ChatPage.tsx';
import NotFound from './pages/NotFound.tsx';
import BotExplorePage from './pages/BotExplorePage.tsx';
import BotEditPage from './pages/BotEditPage.tsx';
import BotApiSettingsPage from './pages/BotApiSettingsPage.tsx';
import AdminSharedBotAnalyticsPage from './pages/AdminSharedBotAnalyticsPage.tsx';
import AdminApiManagementPage from './pages/AdminApiManagementPage.tsx';
import AdminBotManagementPage from './pages/AdminBotManagementPage.tsx';
import { useTranslation } from 'react-i18next';

const rootChildren = [
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
] as const;

export const routes = [
  {
    path: '/',
    element: <App />,
    children: rootChildren,
  },
];

type AllPaths = (typeof rootChildren)[number]['path'];

const getAllPaths = (routes: typeof rootChildren): AllPaths[] =>
  routes.map(({ path }) => path);

export const allPaths = getAllPaths(rootChildren);

export const usePageLabel = () => {
  const { t } = useTranslation();
  const pageLabel: { path: (typeof allPaths)[number]; label: string }[] = [
    { path: '/bot/explore', label: t('button.botConsole') },
    {
      path: '/admin/shared-bot-analytics',
      label: t('button.sharedBotAnalytics'),
    },
    { path: '/admin/api-management', label: t('button.apiManagement') },
  ];

  const getPageLabel = (pagePath: (typeof allPaths)[number]) =>
    pageLabel.find(({ path }) => path === pagePath)?.label;
  return { pageLabel, getPageLabel };
};
