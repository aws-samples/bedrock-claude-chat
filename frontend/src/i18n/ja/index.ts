// Check for any missing settings by uncomment
// import en from '../en';
// const translation: typeof en = {
const translation = {
  translation: {
    signIn: {
      button: {
        login: 'ログイン',
      },
    },
    app: {
      name: 'Bedrock Claude Chat',
      nameWithoutClaude: 'Bedrock Chat',
      inputMessage: '入力してください',
      starredBots: 'スター付きのボット',
      recentlyUsedBots: '最近使用したボット',
      conversationHistory: '会話履歴',
      chatWaitingSymbol: '▍',
      adminConsoles: '管理者用',
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
        retrievingKnowledge: '[ナレッジを取得中...]',
        referenceLink: '参考ドキュメント',
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
        citeRetrievedContexts: '取得したコンテキストの引用',
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
          citeRetrievedContexts:
            'ユーザーの質問に答えるために取得したコンテキストを引用情報として表示するかどうかを設定します。\n有効にすると、ユーザーは元のソースURLやファイルにアクセスできます。',
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
        anthropicLibrary: {
          title: 'Anthropicプロンプトライブラリ',
          sentence: '他のサンプル: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
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
      apiSettings: {
        pageTitle: '共有されたボットのAPI公開設定',
        label: {
          endpoint: 'APIエンドポイント',
          usagePlan: '使用量プラン',
          allowOrigins: '許可するオリジン',
          apiKeys: 'APIキー',
          period: {
            day: '1日あたり',
            week: '1週間あたり',
            month: '1ヶ月あたり',
          },
          apiKeyDetail: {
            creationDate: '作成日',
            active: 'アクティブ',
            inactive: '非アクティブ',
            key: 'APIキー',
          },
        },
        item: {
          throttling: 'スロットリング',
          burstLimit: 'バースト',
          rateLimit: 'レート',
          quota: 'クォータ',
          requestLimit: 'リクエスト数',
          offset: 'オフセット',
        },
        help: {
          overview:
            'APIを公開することで外部のクライアントがボットを利用することが可能になります。APIを利用することで、外部のアプリケーションとの連携が可能になります。',
          endpoint:
            'クライアントは、このAPIエンドポイントを通じてボットを利用できます。',
          usagePlan:
            '使用量プランは、APIがクライアントから受け入れられるリクエストの数またはレートを指定します。APIが受け取るリクエストは、この使用量プランに関連付けて追跡されます。',
          throttling: 'ユーザがAPIを呼び出せるレートを制限します。',
          rateLimit:
            'クライアントがAPIを呼び出すことができるレートを1秒あたりのリクエスト数で入力します。',
          burstLimit:
            'クライアントがAPIに対して同時に実行できるリクエストの数を入力します。',
          quota:
            'ある期間にユーザがAPIに対して実行できるリクエストの数を制限します。',
          requestLimit:
            'ドロップダウンリストで選択した期間にユーザが実行できるリクエストの総数を入力します。',
          allowOrigins:
            'アクセスを許可するクライアントのオリジンを入力します。許可されていないオリジンからAPIが呼び出された場合は、403 Forbidden エラーのレスポンスが返されて、アクセスが拒否されます。オリジンのフォーマットは、"(http|https)://host-name" または "(http|https)://host-name:port" である必要があります。なお、ワイルドカード(*)も利用可能です。',
          allowOriginsExample:
            '入力例) https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
          apiKeys:
            'APIキーは英数字の文字列で、APIのクライアントを識別します。APIキーが識別できない場合、403 Forbiddenエラーのレスポンスが返され、APIへのアクセスが拒否されます。',
        },
        button: {
          ApiKeyShow: '表示',
          ApiKeyHide: '隠す',
        },
        alert: {
          botUnshared: {
            title: 'ボットを共有してください',
            body: 'ボットが共有されていないため、APIの公開ができません。',
          },
          deploying: {
            title: 'APIをデプロイ中',
            body: 'デプロイが完了するまで、しばらくお待ちください。',
          },
          deployed: {
            title: 'APIがデプロイされています',
            body: 'クライアントはAPIエンドポイントとAPIキーを利用して、このAPIにアクセスできます。',
          },
          deployError: {
            title: 'APIのデプロイに失敗しました',
            body: 'このAPIを削除して、APIを再作成してください。',
          },
        },
        deleteApiDaialog: {
          title: '削除しますか?',
          content:
            'このAPIを本当に削除しますか? このAPIを削除すると、すべてのクライアントはこのAPIに一切アクセスできなくなります。',
        },
        addApiKeyDialog: {
          title: 'APIキーの追加',
          content: 'APIキーを識別するための名前を入力してください。',
        },
        deleteApiKeyDialog: {
          title: '削除しますか?',
          content:
            '本当に <Bold>{{title}}</Bold> を削除しますか?\nこのAPIキーを利用しているクライアントは、APIにアクセスできなくなります。',
        },
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
        apiSettings: 'API公開設定',
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
        failDeleteApi: 'APIの削除に失敗しました。',
      },
    },
    admin: {
      sharedBotAnalytics: {
        label: {
          pageTitle: '公開ボット確認',
          noPublicBotUsages:
            '指定の集計期間内に公開ボットは利用されていません。',
          published: 'API公開中',
          SearchCondition: {
            title: '集計期間',
            from: 'From',
            to: 'To',
          },
          sortByCost: '利用料金でソート',
        },
        help: {
          overview:
            '共有されているボットと公開済みのAPIにおける利用状況を確認できます。',
          calculationPeriod:
            '集計期間が未設定の場合は、本日の利用状況が表示されます。',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'API管理',
          publishedDate: '公開日',
          noApi: 'APIがありません。',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'ボット管理',
          sharedUrl: 'ボットのURL',
          apiSettings: 'API公開設定',
          noKnowledge: 'このボットにはナレッジが設定されていません。',
          notPublishApi: 'このボットはAPIを公開していません。',
          deployStatus: 'デプロイステータス',
          cfnStatus: 'CloudFormation ステータス',
          codebuildStatus: 'CodeBuild ステータス',
          codeBuildId: 'CodeBuild ID',
          usagePlanOn: 'ON',
          usagePlanOff: 'OFF',
          rateLimit:
            'クライアントは、毎秒 <Bold>{{limit}}</Bold> リクエストAPIを呼び出すことができます。',
          burstLimit:
            'クライアントは、同時に <Bold> {{ limit }}</Bold> リクエストAPIを呼び出すことができます。',
          requestsLimit:
            '<Bold>{{period}}</Bold> <Bold>{{limit}}</Bold> リクエストAPIを呼び出すことができます。',
        },
        alert: {
          noApiKeys: {
            title: 'APIキーがありません',
            body: 'すべてのクライアントは、このAPIにアクセスできません。',
          },
        },
        button: {
          deleteApi: 'API削除',
        },
      },
      validationError: {
        period: 'FromとToを両方入力してください。',
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
    feedbackDialog: {
      title: 'フィードバック',
      content: '詳細を教えてください。',
      categoryLabel: 'カテゴリ',
      commentLabel: '自由入力',
      commentPlaceholder: '（任意）コメントを記入してください',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: '事実と異なる',
        },
        {
          value: 'notFullyFollowRequest',
          label: '要求に応えていない',
        },
        {
          value: 'other',
          label: 'その他',
        },
      ],
    },
    button: {
      newChat: '新しいチャット',
      botConsole: 'ボットコンソール',
      sharedBotAnalytics: '公開ボット確認',
      apiManagement: 'API管理',
      userUsages: 'ユーザ利用状況',
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
      validationError: {
        required: 'この項目は必須入力です。',
        invalidOriginFormat: 'オリジンのフォーマットが異なります。',
      },
    },
    embeddingSettings: {
      title: 'ベクトル埋め込みパラメーター設定',
      description:
        'ベクトル埋め込みのパラメーター設定が行えます。パラメーターを変更することで、ドキュメントの検索精度が変わります。',
      chunkSize: {
        label: 'チャンクサイズ',
        hint: '埋め込み時のドキュメントの分割サイズを指定します。',
      },
      chunkOverlap: {
        label: 'チャンクオーバーラップ',
        hint: '隣接するチャンク同士で重複する文字数を指定します。',
      },
      enablePartitionPdf: {
        label: 'PDFの詳細解析の有効化。有効にすると時間をかけてPDFを詳細に分析します。',
        hint: '検索精度を高めたい場合に有効です。計算により多くの時間がかかるため計算コストが増加します。',
      },
      help: {
        chunkSize:
          'チャンクサイズが小さすぎると文脈情報が失われ、大きすぎると同一チャンクの中に異なる文脈の情報が存在することになり、検索精度が低下する場合があります。',
        chunkOverlap:
          'チャンクオーバーラップを指定することで、チャンク境界付近の文脈情報を保持することができます。チャンクサイズを大きくすることで、検索精度の向上ができる場合があります。しかし、チャンクオーバーラップを大きくすると、計算コストが増大するのでご注意ください。',
      },
      alert: {
        sync: {
          error: {
            title: 'チャンキングエラー',
            body: 'チャンクオーバーラップ値を小さくして再試行してください',
          },
        },
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
      notSupportedImage: '選択しているモデルは、画像を利用できません。',
    },
    validation: {
      title: 'バリデーションエラー',
      maxRange: {
        message: '設定できる最大値は{{size}}です',
      },
      chunkOverlapLessThanChunkSize: {
        message:
          'チャンクオーバーラップはチャンクサイズより小さく設定する必要があります',
      },
    },
  },
};

export default translation;
