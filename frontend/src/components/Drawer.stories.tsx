import type { Meta, StoryFn } from '@storybook/react-vite';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ChatListDrawer from './Drawer';
import { BotListItem } from '../@types/bot';
import { ConversationMeta } from '../@types/conversation';

const conversations: ConversationMeta[] = [
  {
    id: '1',
    title: 'What is RAG?',
    createTime: new Date().getTime(),
    lastMessageId: '',
    model: 'claude-v3.5-sonnet',
    botId: '1',
  },
];
const bots: BotListItem[] = [
  {
    id: '1',
    title: 'Bot 1',
    description: 'Bot 1',
    createTime: new Date(),
    lastUsedTime: new Date(),
    isStarred: false,
    owned: false,
    syncStatus: 'SUCCEEDED',
    available: true,
    sharedScope: 'private',
    sharedStatus: '',
  },
  {
    id: '2',
    title: 'Bot 2',
    description: 'Bot 2',
    createTime: new Date(),
    lastUsedTime: new Date(),
    isStarred: true,
    owned: true,
    syncStatus: 'SUCCEEDED',
    available: true,
    sharedScope: 'private',
    sharedStatus: '',
  },
];

export default {
  // AppContent fills the whole window, so render without Storybook's padding.
  parameters: { layout: 'fullscreen' },
  // The Drawer is shown only when the viewport is at least 1024px wide (lg),
  // so open the stories with the 1280px "desktop" viewport.
  globals: { viewport: { value: 'desktop' } },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        {/* Reproduce the layout in which AppContent places the Drawer. */}
        <div className="relative flex h-dvh w-screen bg-aws-paper-light dark:bg-aws-paper-dark">
          <Routes>
            <Route path="/" element={<Story />} />
            <Route path="/bot/:botId" element={<Story />} />
            <Route path="/bot/explore" element={<Story />} />
            <Route path="/:conversationId" element={<Story />} />
            <Route path="/admin/shared-bot-analytics" element={<Story />} />
            <Route path="/admin/api-management" element={<Story />} />
          </Routes>
          <main className="flex-1" />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta;

export const Admin: StoryFn = () => {
  return (
    <ChatListDrawer
      isAdmin={true}
      conversations={conversations}
      starredBots={bots.filter((bot) => bot.isStarred)}
      recentlyUsedUnstarredBots={bots.filter((bot) => !bot.isStarred)}
      updateConversationTitle={async () => {}}
      onSignOut={() => {}}
      onDeleteConversation={() => {}}
      onClearConversations={() => {}}
      onSelectLanguage={() => {}}
      onClickDrawerOptions={() => {}}
    />
  );
};

export const NonAdmin: StoryFn = () => {
  return (
    <ChatListDrawer
      isAdmin={false}
      conversations={conversations}
      starredBots={bots.filter((bot) => bot.isStarred)}
      recentlyUsedUnstarredBots={bots.filter((bot) => !bot.isStarred)}
      updateConversationTitle={async () => {}}
      onSignOut={() => {}}
      onDeleteConversation={() => {}}
      onClearConversations={() => {}}
      onSelectLanguage={() => {}}
      onClickDrawerOptions={() => {}}
    />
  );
};
