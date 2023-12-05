// import en from '../en';

// const translation: typeof en = {
const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: '入力してください',
    },
    deleteDialog: {
      title: '削除',
      content: 'チャット「<Bold>{{title}}</Bold>」を削除しますか？',
    },
    clearDialog: {
      title: '削除',
      content: 'すべての会話履歴を削除しますか？',
    },
    languageDialog: {
      title: '言語の切替',
    },
    button: {
      newChat: '新しいチャット',
      SaveAndSubmit: '変更 & 送信',
      resend: '再送信',
      regenerate: '再生成',
      delete: '削除',
      deleteAll: 'すべて削除',
      ok: 'OK',
      cancel: 'キャンセル',
      menu: 'Menu',
      language: '言語の切替',
      clearConversation: 'すべての会話をクリア',
      signOut: 'サインアウト',
    },
    error: {
      answerResponse: '回答中にエラーが発生しました。',
      notFoundConversation:
        '指定のチャットは存在しないため、新規チャット画面を表示しました。',
      notFoundPage: 'お探しのページが見つかりませんでした。',
      predict: {
        general: '推論中にエラーが発生しました。',
        invalidResponse: '想定外のResponseが返ってきました。',
      },
    },
  },
};

export default translation;
