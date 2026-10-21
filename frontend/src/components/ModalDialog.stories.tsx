import { useState } from 'react';
import { SharedScope } from '../@types/bot';
import DialogConfirmAddApiKey from './DialogConfirmAddApiKey';
import DialogConfirmClearConversations from './DialogConfirmClearConversations';
import DialogConfirmDeleteApi from './DialogConfirmDeleteApi';
import DialogConfirmDeleteApiKey from './DialogConfirmDeleteApiKey';
import DialogConfirmDeleteBot from './DialogConfirmDeleteBot';
import DialogConfirmDeleteChat from './DialogConfirmDeleteChat';
import DialogFeedback from './DialogFeedback';
import DialogInstructionsSamples from './DialogInstructionsSamples';
import DialogSelectLanguage from './DialogSelectLanguage';
import DialogShareBot from './DialogShareBot';
import {
  GetUserResponse,
  SearchUserGroupsResponse,
  SearchUsersResponse,
} from '../@types/user';
import type { Meta } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';

export const AddApiKey = () => {
  const [isOpenAddApiKeyDialog, setIsOpenAddApiKeyDialog] = useState(true);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  return (
    <DialogConfirmAddApiKey
      isOpen={isOpenAddApiKeyDialog}
      loading={isAddingApiKey}
      onAdd={() => {
        setIsAddingApiKey(true);
      }}
      onClose={() => {
        setIsOpenAddApiKeyDialog(false);
      }}
    />
  );
};

export const ClearConversations = () => {
  const [isOpenClearConversation, setIsOpenClearConversation] = useState(true);
  return (
    <DialogConfirmClearConversations
      isOpen={isOpenClearConversation}
      onDelete={() => {
        setIsOpenClearConversation(false);
      }}
      onClose={() => {
        setIsOpenClearConversation(false);
      }}
    />
  );
};

export const DeleteApi = () => {
  const [isOpenDeleteApiDialog, setIsOpenDeleteApiDialog] = useState(true);
  return (
    <DialogConfirmDeleteApi
      isOpen={isOpenDeleteApiDialog}
      onDelete={() => {
        setIsOpenDeleteApiDialog(false);
      }}
      onClose={() => {
        setIsOpenDeleteApiDialog(false);
      }}
    />
  );
};

export const DeleteApiKey = () => {
  const [isOpenDialog, setIsOpenDialog] = useState(true);
  return (
    <DialogConfirmDeleteApiKey
      apiKeyTitle="API Key 1"
      isOpen={isOpenDialog}
      onDelete={() => {
        setIsOpenDialog(false);
      }}
      onClose={() => {
        setIsOpenDialog(false);
      }}
    />
  );
};

export const DeleteBot = () => {
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(true);
  return (
    <DialogConfirmDeleteBot
      isOpen={isOpenDeleteDialog}
      target={{
        id: '1',
        title: 'Bot 1',
        description: 'Bot 1',
        createTime: new Date(),
        lastUsedTime: new Date(),
        isStarred: false,
        owned: true,
        syncStatus: 'SUCCEEDED',
        sharedScope: 'private',
        sharedStatus: '',
      }}
      onDelete={() => {
        setIsOpenDeleteDialog(false);
      }}
      onClose={() => {
        setIsOpenDeleteDialog(false);
      }}
    />
  );
};

export const DeleteConversation = () => {
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(true);
  return (
    <DialogConfirmDeleteChat
      isOpen={isOpenDeleteModal}
      target={{
        id: '1',
        title: 'Conversation 1',
        createTime: new Date().getTime(),
        lastMessageId: '1',
        model: 'claude-v3.5-sonnet',
      }}
      onDelete={() => {
        setIsOpenDeleteModal(false);
      }}
      onClose={() => {
        setIsOpenDeleteModal(false);
      }}
    />
  );
};

export const Feedback = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(true);
  return (
    <DialogFeedback
      isOpen={isFeedbackOpen}
      thumbsUp={false}
      onClose={() => {
        setIsFeedbackOpen(false);
      }}
      onSubmit={() => {
        setIsFeedbackOpen(false);
      }}
    />
  );
};

export const InstructionsSamples = () => {
  const [isOpenSamples, setIsOpenSamples] = useState(true);
  return (
    <DialogInstructionsSamples
      isOpen={isOpenSamples}
      onClose={() => {
        setIsOpenSamples(false);
      }}
    />
  );
};

export const SelectLanguage = () => {
  const [isOpenLanguage, setIsOpenLanguage] = useState(true);
  return (
    <DialogSelectLanguage
      isOpen={isOpenLanguage}
      onSelectLanguage={() => {
        setIsOpenLanguage(false);
      }}
      onClose={() => {
        setIsOpenLanguage(false);
      }}
    />
  );
};

export default {
  beforeEach({ msw }) {
    msw.use(
      http.get(
        new URL(
          'user/search',
          import.meta.env.VITE_APP_API_ENDPOINT
        ).toString(),
        () => {
          const res: SearchUsersResponse = [
            {
              id: 'user3',
              name: 'Tom Morello',
              email: 'tom@ratm.com',
            },
            {
              id: 'user4',
              name: 'Zack de la Rocha',
              email: 'zack@ratm.com',
            },
          ];
          return HttpResponse.json(res);
        }
      ),
      http.get(
        new URL(
          'user/group/search',
          import.meta.env.VITE_APP_API_ENDPOINT
        ).toString(),
        () => {
          const res: SearchUserGroupsResponse = [
            {
              type: 'group',
              name: 'HR all',
              description: 'All member of the HR department.',
            },
          ];
          return HttpResponse.json(res);
        }
      ),
      http.get(
        new URL('user/user1', import.meta.env.VITE_APP_API_ENDPOINT).toString(),
        () => {
          const res: GetUserResponse = {
            id: 'user1',
            name: 'Anthony Kiedis',
            email: 'anthony@rhcp.com',
          };
          return HttpResponse.json(res);
        }
      ),
      http.get(
        new URL('user/user2', import.meta.env.VITE_APP_API_ENDPOINT).toString(),
        () => {
          const res: GetUserResponse = {
            id: 'user2',
            name: 'John Frusciante',
            email: 'jotn@rhcp.com',
          };
          return HttpResponse.json(res);
        }
      )
    );
  },
} satisfies Meta;

export const ShareBot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [sharedScope, setSharedScope] = useState<SharedScope>('private');
  const [allowedUserIds] = useState(['user1', 'user2']);
  const [allowedGroupIds] = useState(['group1']);

  return (
    <DialogShareBot
      isOpen={isOpen}
      botId="1"
      allowedUserIds={allowedUserIds}
      allowedGroupIds={allowedGroupIds}
      sharedScope={sharedScope}
      onChangeSharedScope={(scope) => {
        setSharedScope(scope);
      }}
      onUpdateAllowedUserAndGroup={() => {}}
      onClose={() => {
        setIsOpen(false);
      }}
    />
  );
};

export const ShareBotLoading = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <DialogShareBot
      isOpen={isOpen}
      isLoading
      botId="1"
      allowedUserIds={[]}
      allowedGroupIds={[]}
      sharedScope="private"
      onChangeSharedScope={() => {}}
      onUpdateAllowedUserAndGroup={() => {}}
      onClose={() => {
        setIsOpen(false);
      }}
    />
  );
};
