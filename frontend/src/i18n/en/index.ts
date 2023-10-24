const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Send a message',
    },
    deleteDialog: {
      title: 'Delete chat?',
      content: 'This will delete <Bold>{{title}}</Bold>.',
    },
    button: {
      newChat: 'New Chat',
      SaveAndSubmit: 'Save & Submit',
      resend: 'Resend',
      regenerate: 'Regenerate',
      delete: 'Delete',
      cancel: 'Cancel',
      signOut: 'Sign out',
    },
    error: {
      answerResponse: 'An error occurred while responding.',
      notFoundConversation:
        'The specified chat does not exist, so a new chat was displayed.',
      notFoundPage: 'The page you are looking for is not here.',
      predict: {
        general: 'An error occurred while predicting.',
        invalidResponse:
          'Unexpected response received. The response format does not match the expected format.',
      },
    },
  },
};

export default translation;
