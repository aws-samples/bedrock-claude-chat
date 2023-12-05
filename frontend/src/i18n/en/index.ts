const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Send a message',
      conversationHistory: 'History',
    },
    bot: {
      myBots: 'My Bots',
      sharedBots: 'Shared Bots',
      create: {
        pageTitle: 'Create My Bot',
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
        share: 'Share',
        unshare: 'Unshare',
        delete: 'Delete',
      },
      deleteDialog: {
        title: 'Delete?',
        content: 'Are you sure to delete <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        share: {
          title: 'Share your bot?',
          content: 'Your <Bold>{{title}}</Bold> will be shared with ALL users.',
        },
        unshare: {
          title: 'Unshare your bot?',
          content:
            'Your <Bold>{{title}}</Bold> will NOT be available to other users.',
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
      ok: 'OK',
      cancel: 'Cancel',
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
