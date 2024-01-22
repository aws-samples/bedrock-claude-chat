// Check for any missing settings by uncomment
// import en from '../en';
// const translation: typeof en = {
const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: '入力してください',
      starredBots: 'スター付きのボット',
      recentlyUsedBots: '最近使用したボット',
      conversationHistory: '会話履歴',
      chatWaitingSymbol: '▍',
    },
    bot: {
      label: {
        myBots: '自分のボット',
        recentlyUsedBots: '最近使用した公開ボット',
        knowledge: 'ナレッジ',
        url: 'URL',
        sitemap: 'サイトマップURL',
        file: 'ファイル',
        loadingBot: 'Loading...',
        normalChat: 'チャット',
        notAvailableBot: '[このボットは利用できません]',
        notAvailableBotInputMessage: 'このボットは利用できません。',
        noDescription: '説明文なし',
        notAvailable: 'このボットは利用できません。',
        noBots: 'ボットが登録されていません。',
        noBotsRecentlyUsed: '最近利用した公開ボットはありません。',
        retrivingKnowledge: '[ナレッジを取得中...]',
        dndFileUpload:
          'ドラッグ＆ドロップでファイルをアップロードできます。\n対応ファイル: {{fileExtensions}}',
        uploadError: 'エラーメッセージ',
        syncStatus: {
          queue: '同期待ち',
          running: '同期中',
          success: '同期完了',
          fail: '同期エラー',
        },
        fileUploadStatus: {
          uploading: 'アップロード中...',
          uploaded: 'アップロード完了',
          error: 'エラー',
        },
      },
      titleSubmenu: {
        edit: 'ボットを編集',
        copyLink: '共有リンクをコピー',
        copiedLink: 'コピーしました',
      },
      help: {
        overview:
          'ボットはあらかじめ定義したインストラクションに従って動作します。チャットではメッセージ内にコンテキストを定義しなければ意図した振る舞いをしませんが、ボットを利用すればコンテキストの定義が不要になります。',
        instructions:
          'ボットがどのように振る舞うか定義します。曖昧な指示をすると予測できない動きをすることがあるので、具体的に指示をしてください。',
        knowledge: {
          overview:
            '外部の情報をボットに提供することで、事前学習していないデータを扱えるようになります。',
          url: 'URLを指定すると、そのURLの情報がナレッジとして利用されます。YouTube の動画の URL を設定すると、その動画の字幕がナレッジとして利用されます。',
          sitemap:
            'サイトマップのURLを指定すると、そのサイトマップ内のサイトを自動的にスクレイピングして得られた情報がナレッジとして利用されます。',
          file: 'アップロードしたファイルがナレッジとして利用されます。',
        },
      },
      alert: {
        sync: {
          error: {
            title: '同期エラー',
            body: '同期中にエラーが発生しました。',
          },
          incomplete: {
            title: '同期が未完了です',
            body: 'このボットはナレッジの同期が完了していないため、更新前のナレッジが利用されます。',
          },
        },
      },
      samples: {
        title: 'インストラクションのサンプル',
        reference:
          '引用: https://docs.anthropic.com/claude/docs/how-to-use-system-prompts',
        pythonCodeAssistant: {
          title: 'Python コーディングアシスタント',
          prompt: `あなたは非常にスキルの高い Python の専門家です。与えられたタスクをこなすための、短くて高品質な Python スクリプトを書いてください。あなたは経験豊富な開発者のためにコードを書いているので、自明でないことについてのみコメントを追加してください。必要なインポートは必ず含めてください。
決して \`\`\`python\`\`\` ブロックの前には何も書かないでください。コードの生成が終わり、\`\`\`python\`\`\`ブロックの後に、ミスやエラー、矛盾がないか注意深くチェックしてください。エラーがある場合は、<error>タグでエラーを列挙し、それらのエラーを修正した新しいバージョンを生成します。エラーがない場合は、<error>タグに "CHECKED: NO ERRORS "と記述してください。`,
        },
        mailCategorizer: {
          title: 'メール分類',
          prompt: `あなたは、電子メールをタイプ別に分類する顧客サービス担当者です。あなたは分類結果を出力し、その判断理由を説明してください。

分類のカテゴリーは以下の通りです：
(A) 販売前の質問
(B) 故障または不良品
(C) 請求に関する質問
(D) その他（説明してください）

このメールをどのように分類しますか？`,
        },
        fitnessCoach: {
          title: 'パーソナルフィットネスコーチ',
          prompt: `あなたは、明るく熱心なパーソナル・フィットネス・コーチのサムです。サムは、クライアントのフィットネスと健康的なライフスタイルをサポートすることに情熱を注いでいます。あなたは励ましと親しみを込めた口調で書き、常にクライアントをより良いフィットネスゴールへと導こうとしています。フィットネスに関係のないことを聞かれた場合は、話題をフィットネスに戻すか、答えられないと答えましょう。`,
        },
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
        instructionsSamples: 'サンプル',
        chooseFiles: 'ファイルを選択',
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
      error: {
        notSupportedFile: 'このファイル形式はサポートされていません。',
        duplicatedFile:
          '同一ファイル名のファイルが既にアップロードされています。',
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
      close: '閉じる',
      add: '追加',
    },
    input: {
      hint: {
        required: '* 必須',
      },
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
