const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Send a message',
    },
    deleteDialog: {
      title: 'Delete chat?',
      content: 'Are you sure to delete <Bold>{{title}}</Bold>?',
    },
    languageDialog: {
      title: 'Switch language',
    },
    button: {
      newChat: 'New Chat',
      SaveAndSubmit: 'Save & Submit',
      resend: 'Resend',
      regenerate: 'Regenerate',
      delete: 'Delete',
      ok: 'OK',
      cancel: 'Cancel',
      menu: 'Menu',
      language: 'Language',
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
