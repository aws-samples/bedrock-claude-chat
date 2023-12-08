// Check for any missing settings by uncomment
import en from '../en';
const translation: typeof en = {
  // const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: '入力してください',
      starredBots: 'スター付きのボット',
      recentlyUsedBots: '最近使用したボット',
      conversationHistory: '会話履歴',
    },
    bot: {
      label: {
        myBots: '自分のボット',
        recentlyUsedBots: '最近使用した公開ボット',
        loadingBot: 'Loading...',
        normalChat: 'チャット',
        notAvailableBot: '[このボットは利用できません]',
        notAvailableBotInputMessage: 'このボットは利用できません。',
        noDescription: '説明文なし',
        notAvailable: 'このボットは利用できません。',
        noBots: 'ボットが登録されていません。',
        noBotsRecentlyUsed: '最近利用した公開ボットはありません。',
      },
      titleSubmenu: {
        edit: 'ボットを編集',
        copyLink: '共有リンクをコピー',
        copiedLink: 'コピーしました',
      },
      create: {
        pageTitle: 'ボットを新規作成',
      },
      edit: {
        pageTitle: 'ボットを編集',
      },
      item: {
        title: 'ボット名',
        description: '説明文',
        instruction: 'インストラクション',
      },
      button: {
        newBot: 'ボットを新規作成',
        create: '新規作成',
        edit: '更新',
        delete: '削除',
        share: '共有',
        copy: 'コピー',
        copied: 'コピーしました',
      },
      deleteDialog: {
        title: '削除しますか？',
        content: '<Bold>{{title}}</Bold>を削除しますか？',
      },
      shareDialog: {
        title: '共有',
        off: {
          content:
            '共有リンクが無効化されているため、あなた以外はこのボットにアクセスできません。',
        },
        on: {
          content:
            '共有リンクが有効化されているため、全てのユーザが共有リンクを使って会話できます。',
        },
      },
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
      botConsole: 'ボットコンソール',
      SaveAndSubmit: '変更 & 送信',
      resend: '再送信',
      regenerate: '再生成',
      delete: '削除',
      deleteAll: 'すべて削除',
      done: '完了',
      ok: 'OK',
      cancel: 'キャンセル',
      back: '戻る',
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
