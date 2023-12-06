const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Send a message',
      starredBots: 'Starred Bots',
      recentlyUsedBots: 'Recently Used Bots',
      conversationHistory: 'History',
    },
    bot: {
      label: {
        myBots: 'My Bots',
        recentlyUsedBots: 'Recently Used Shared Bots',
        loadingBot: 'Loading...',
        normalChat: 'Chat',
        notAvailableBot: '[NOT Available]',
        noDescription: 'No Description',
        notAvailable: 'This bot is NOT available.',
      },
      titleSubmenu: {
        edit: 'Edit',
        copyLink: 'Copy Link',
        copiedLink: 'Copied',
      },
      create: {
        pageTitle: 'Create My Bot',
      },
      edit: {
        pageTitle: 'Edit My Bot',
      },
      item: {
        title: 'Name',
        description: 'Description',
        instruction: 'Instructions',
      },
      button: {
        newBot: 'Create New Bot',
        create: 'Create',
        edit: 'Edit',
        delete: 'Delete',
        share: 'Share',
        copy: 'Copy',
        copied: 'Copied',
      },
      deleteDialog: {
        title: 'Delete?',
        content: 'Are you sure to delete <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Share',
        off: {
          content:
            'Link sharing is off, so only you can access this document through its URL.',
        },
        on: {
          content:
            'Link sharing is on, so ALL users can use this link to conversation.',
        },
      },
    },
    deleteDialog: {
      title: 'Delete?',
      content: 'Are you sure to delete <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Delete ALL?',
      content: 'Are you sure to delete ALL conversations?',
    },
    languageDialog: {
      title: 'Switch language',
    },
    button: {
      newChat: 'New Chat',
      explore: 'Explore',
      SaveAndSubmit: 'Save & Submit',
      resend: 'Resend',
      regenerate: 'Regenerate',
      delete: 'Delete',
      deleteAll: 'Delete All',
      done: 'Done',
      ok: 'OK',
      cancel: 'Cancel',
      back: 'Back',
      menu: 'Menu',
      language: 'Language',
      clearConversation: 'Delete ALL conversations',
      signOut: 'Sign out',
    },
    error: {
      answerResponse: 'An error occurred while responding.',
      notFoundConversation:
        'Since the specified chat does not exist, a new chat screen is displayed.',
      notFoundPage: 'The page you are looking for is not found.',
      predict: {
        general: 'An error occurred while predicting.',
        invalidResponse:
          'Unexpected response received. The response format does not match the expected format.',
      },
    },
  },
};

export default translation;
