// Check for any missing settings by uncomment
import en from '../en';
const translation: typeof en = {
  // const translation = {
  translation: {
    signIn: {
      button: {
        login: 'ログイン',
      },
    },
    app: {
      name: 'Bedrock Chat',
      inputMessage: 'お手伝いできることはありますか？',
      myBots: 'マイボット',
      discoverBots: 'ボットを探す',
      pinnedBots: 'ピン留めボット',
      starredBots: 'スター付きのボット',
      recentlyUsedBots: '最近使用したボット',
      conversationHistory: '最近のチャット',
      chatWaitingSymbol: '▍',
      adminConsoles: '管理者用機能',
      userGroups: 'ユーザーグループ',
      backChat: 'チャットに戻る',
    },
    model: {
      'claude-v4-opus': {
        label: 'Claude 4 (Opus)',
        description:
          '複雑なタスク、コーディング、AIエージェント向けの強力なハイブリッド推論モデル（200Kトークンコンテキストウィンドウ）',
      },
      'claude-v4.1-opus': {
        label: 'Claude 4.1 (Opus)',
        description:
          '推論能力が向上した高性能なOpusモデル。',
      },
      'claude-v4.5-opus': {
        label: 'Claude 4.5 (Opus)',
        description:
          '高い推論能力と実用的なパフォーマンスを兼ね備えたOpusモデル。',
      },
      'claude-v4.6-opus': {
        label: 'Claude 4.6 (Opus)',
        description:
          'より慎重に計画し、エージェントタスクをより長く持続し、大規模コードベースで確実に動作するフラッグシップモデル（1Mトークンコンテキストウィンドウ）。',
      },
      'claude-v4.7-opus': {
        label: 'Claude 4.7 (Opus)',
        description:
          'コーディング、エンタープライズワークフロー、長時間のエージェントタスク向けに構築された高性能Opusモデル。',
      },
      'claude-v4-sonnet': {
        label: 'Claude 4 (Sonnet)',
        description:
          '効率性とスケールを最適化したバランスの取れたハイブリッド推論モデル（200Kトークンコンテキストウィンドウ）',
      },
      'claude-v4.5-sonnet': {
        label: 'Claude 4.5 (Sonnet)',
        description:
          '前世代のSonnetモデル。高いコーディング性能と長時間タスク処理が可能。',
      },
      'claude-v4.6-sonnet': {
        label: 'Claude 4.6 (Sonnet)',
        description:
          'コーディング、コンピュータ使用、長文コンテキスト推論、エージェント計画が改善されたミッドティアモデルの完全アップグレード（1Mトークンコンテキストウィンドウ）。',
      },
      'claude-v4.5-haiku': {
        label: 'Claude 4.5 (Haiku)',
        description:
          'Haikuシリーズ最速かつ最高性能。フロンティアレベルの性能と拡張思考機能を搭載',
      },
      'claude-v3-haiku': {
        label: 'Claude 3 (Haiku)',
        description:
          '旧バージョンで、スピードとコンパクトさを最適化しており、ほぼ瞬時の応答を提供',
      },
      'claude-v3.5-sonnet': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Claude 3.5の初期バージョン。幅広いタスクに対応しますが、v2の方が精度が向上',
      },
      'claude-v3.5-sonnet-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'Claude 3.5の最新バージョン。v1をさらに強化し、より高い精度とパフォーマンスを提供',
      },
      'claude-v3.7-sonnet': {
        label: 'Claude 3.7 Sonnet',
        description: '迅速な応答と深い分析能力を両立するハイブリッド推論モデル',
      },
      'claude-v3.5-haiku': {
        label: 'Claude 3.5 (Haiku) v1',
        description: 'Haiku最新バージョン。精度を保ち、高速な応答を実現',
      },
      'claude-v3-opus': {
        label: 'Claude 3 (Opus)',
        description: '非常に複雑なタスクに対応するパワフルなモデル',
      },
      'mistral-7b-instruct': {
        label: 'Mistral 7B',
        description:
          '自然なコーディング機能で英語のテキスト生成タスクをサポートします',
      },
      'mixtral-8x7b-instruct': {
        label: 'Mistral-8x7B',
        description:
          'Mixtral-8x7BはMistral AIによって開発された基盤モデルで、英語、フランス語、ドイツ語、イタリア語、スペイン語のテキストをサポートし、コード生成機能を備えています。',
      },
      'mistral-large': {
        label: 'Mistral Large',
        description:
          '実質的な推論機能を必要とする複雑なタスクや、合成テキスト生成およびコード生成などの高度に専門化されたタスクに最適です',
      },
      'mistral-large-2': {
        label: 'Mistral Large2',
        description:
          '数十の言語と80以上のコーディング言語をサポートする先進的なLLMで、ネイティブ関数呼び出し、JSON出力、推論機能などのクラス最高レベルのエージェント機能を備えています',
      },
      'amazon-nova-pro': {
        label: 'Amazon Nova Pro',
        description:
          '精度、速度、コストのバランスが最も優れた高性能マルチモーダルモデル',
      },
      'amazon-nova-lite': {
        label: 'Amazon Nova Lite',
        description:
          '非常に低コストで高速なマルチモーダルモデルで、リアルタイム処理に最適',
      },
      'amazon-nova-micro': {
        label: 'Amazon Nova Micro',
        description:
          '最も低いレイテンシーと低コストで提供される軽量なテキストモデル',
      },
      'deepseek-r1': {
        label: 'DeepSeek R1',
        description:
          '一般的な推論、数学、科学、コード生成に最適化された最先端の推論モデル。英語と中国語をサポート',
      },
      // Meta Llama 3シリーズ
      'llama3-3-70b-instruct': {
        label: 'Meta Llama 3.3 70B Instruct',
        description:
          '405Bモデルと同等のパフォーマンスを低コストで提供する最新のLlama 3モデル。優れた推論能力と指示追従能力を備える',
      },
      'llama3-2-1b-instruct': {
        label: 'Meta Llama 3.2 1B Instruct',
        description:
          'エッジデバイスに最適化された軽量モデル。個人情報管理や多言語知識検索に対応し、効率的なローカル処理を実現',
      },
      'llama3-2-3b-instruct': {
        label: 'Meta Llama 3.2 3B Instruct',
        description:
          'テキスト生成、要約、感情分析などの機能を低遅延で提供するコンパクトモデル。モバイルAIアプリケーションに最適',
      },
      'llama3-2-11b-instruct': {
        label: 'Meta Llama 3.2 11B Instruct',
        description:
          '画像理解と視覚的推論に優れたマルチモーダルモデル。画像キャプション生成や視覚的質問応答など高度なタスクに対応',
      },
      'llama3-2-90b-instruct': {
        label: 'Meta Llama 3.2 90B Instruct',
        description:
          '高度な画像理解と視覚的推論機能を備えた大規模マルチモーダルモデル。複雑な推論と画像テキスト検索に優れた性能を発揮する',
      },
      'gpt-oss-20b': {
        label: 'GPT-OSS 20B',
        description:
          '128Kコンテキストウィンドウと推論機能を持つオープンウェイト20Bパラメータモデル',
      },
      'gpt-oss-120b': {
        label: 'GPT-OSS 120B',
        description:
          '128Kコンテキストウィンドウと高度な推論機能を持つオープンウェイト120Bパラメータモデル',
      },
    },
    agent: {
      label: 'エージェント',
      help: {
        overview:
          'エージェント機能を使用すると、チャットボットはより複雑なタスクを自動的に処理できます。モデルがTool useに対応している必要があります。詳細は <Link>こちら</Link> をご確認ください。',
      },
      hint: 'エージェントは、ユーザーの質問に答えるため、どのツールを使用するかを自動的に判断します。考える時間が必要なため、応答時間が長くなる傾向にあります。',
      progress: {
        label: '思考中...',
      },
      progressCard: {
        toolInput: '入力: ',
        toolOutput: '出力: ',
        status: {
          running: '実行中...',
          success: '成功',
          error: 'エラー',
        },
      },
      tools: {
        get_weather: {
          name: '現在の天気',
          description: '現在の天気予報を取得します。',
        },
        sql_db_query: {
          name: 'データベースクエリ',
          description:
            'データベースから結果を取得するために、詳細で正確なSQLクエリを実行します。',
        },
        sql_db_schema: {
          name: 'データベーススキーマ',
          description: 'テーブルのリストのスキーマとサンプル行を取得します。',
        },
        sql_db_list_tables: {
          name: 'データベーステーブル一覧',
          description:
            'データベースで利用可能なすべてのテーブルをリストします。',
        },
        sql_db_query_checker: {
          name: 'クエリチェッカー',
          description: '実行前にSQLクエリが正しいかどうかを確認します。',
        },
        internet_search: {
          name: 'インターネット検索',
          description: 'インターネットで情報を検索します。',
          settings: '検索設定',
          engine: '検索エンジン',
          engines: {
            duckduckgo: {
              label: 'DuckDuckGo (For Trial)',
              hint: 'リミットレートが厳しいが無料で使用可能。小規模利用向け',
            },
            firecrawl: {
              label: 'Firecrawl (For Business)',
              hint: 'レートリミットの拡張可能。ビジネス利用向け。APIキーが必要. https://www.firecrawl.dev/',
            },
          },
        },
        knowledge_base_tool: {
          name: 'ナレッジの取得',
          description: 'ナレッジから情報を取得します。',
        },
        bedrock_agent: {
          name: 'Bedrock Agent',
          description: '設定されたBedrock Agentに質問を送信します。',
        },
        firecrawl: {
          apiKey: 'Firecrawl APIキー',
          maxResults: '最大結果数',
        },
        bedrockAgent: {
          name: 'Bedrock Agent',
          description: 'Bedrock Agentをツールとして使用します。',
          agentId: {
            label: 'Agent ID',
            placeholder: 'Agent IDを入力',
          },
          aliasId: {
            label: 'Alias ID',
            placeholder: 'Alias IDを入力',
          },
        },
      },
    },
    bot: {
      label: {
        myBots: '自分のボット',
        recentlyUsedBots: '最近使用したボット',
        knowledge: 'ナレッジ',
        url: 'URL',
        s3url: 'S3 データソース',
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
        noStarredBots: 'スター付きのボットはありません。',
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
        quickStarter: {
          title: '会話のクイックスタート',
          exampleTitle: 'タイトル',
          example: '会話例',
        },
        citeRetrievedContexts: '取得したコンテキストの引用',
        unsupported: '非対応、読み取り専用',
        loadingKnowledgeBases: 'ナレッジベースを読み込み中...',
        failedToLoadKnowledgeBases:
          'ナレッジベースの読み込みに失敗しました。後でもう一度お試しください。',
      },
      titleSubmenu: {
        edit: 'ボットを編集',
        copyLink: '共有リンクをコピー',
        copiedLink: 'コピーしました',
        markAsEssential: '利用推奨ボットに登録',
        removeEssential: '利用推奨ボットを解除',
      },
      help: {
        overview:
          'ボットはあらかじめ定義したインストラクションに従って動作します。チャットではメッセージ内にコンテキストを定義しなければ意図した振る舞いをしませんが、ボットを利用すればコンテキストの定義が不要になります。',
        instructions:
          'ボットがどのように振る舞うか定義します。曖昧な指示をすると予測できない動きをすることがあるので、具体的に指示をしてください。',
        knowledge: {
          overview:
            '外部の情報をボットに提供することで、事前学習していないデータを扱えるようになります。',
          url: 'URLを指定すると、そのURLの情報がナレッジとして利用されます。',
          s3url:
            'S3 の URI を入力し、S3 をデータソースとして追加します。最大 4 件追加できます。Bedrock利用リージョンと同じアカウント・同じリージョンに存在するバケットのみ対応しています。',
          sitemap:
            'サイトマップのURLを指定すると、そのサイトマップ内のサイトを自動的にスクレイピングして得られた情報がナレッジとして利用されます。',
          file: 'アップロードしたファイルがナレッジとして利用されます。',
          citeRetrievedContexts:
            'ユーザーの質問に答えるために取得したコンテキストを引用情報として表示するかどうかを設定します。\n有効にすると、ユーザーは元のソースURLやファイルにアクセスできます。',
        },
        quickStarter: {
          overview:
            '会話を開始する際に、会話例を表示します。会話例を提供することで、ボットの使い方を利用者に示すことができます。',
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
      my: {
        label: {
          pageTitle: 'マイボット',
        },
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
        save: '保存',
        delete: '削除',
        share: '共有',
        copy: 'コピー',
        copied: 'コピーしました',
        instructionsSamples: 'サンプル',
        chooseFiles: 'ファイルを選択',
        apiSettings: 'API公開設定',
        viewAll: '全て見る',
        removeFromRecent: '履歴から削除',
      },
      deleteDialog: {
        title: '削除しますか？',
        content: '<Bold>{{title}}</Bold>を削除しますか？',
      },
      shareDialog: {
        title: '共有',
        switchLabel: 'このボットを共有する',
        label: {
          selectShare: '共有先',
          all: 'すべてのユーザー',
          partial: '一部のユーザー',
          search: 'ユーザーとユーザーグループを検索できます',
          noSearchResults: '検索結果がありません',
          memberManagement: 'メンバーの管理',
          group: 'グループ',
          user: 'ユーザー',
          sharing: {
            not_shared: 'どのグループとグループにも共有されていません。',
            shared_only_users: '{{count}}人のユーザに共有されています。',
            shared_only_users_plural: '{{count}}人のユーザに共有されています。',
            shared_only_groups: '{{count}}つのグループに共有されています。',
            shared_only_groups_plural:
              '{{count}}つのグループに共有されています。',
            shared_both:
              '{{groupCount}}つのグループと{{userCount}}人のユーザーに共有されています。',
            shared_both_user_plural:
              '{{groupCount}}つのグループと{{userCount}}人のユーザーに共有されています。',
            shared_both_group_plural:
              '{{groupCount}}つのグループと{{userCount}}人のユーザーに共有されています。',
            shared_both_plural:
              '{{groupCount}}つのグループと{{userCount}}人のユーザーに共有されています。',
          },
        },

        off: {
          content:
            'このボットは共有されていないため、あなた以外アクセスできません。',
        },
        on: {
          content:
            'このボットは共有されているため、あなた以外のユーザーもアクセスできます。共有されているユーザーは「ボットを探す」から、このボットを検索して利用することができます。',
          linkDescription:
            '以下の共有リンクを使ってボットと会話することもできます。',
        },
        button: {
          manage: '管理',
          removeAccess: 'アクセス権限を削除',
          cancelRemoval: '削除をキャンセル',
          cancelAddition: '追加をキャンセル',
        },
      },
      error: {
        notSupportedFile: 'このファイル形式はサポートされていません。',
        duplicatedFile:
          '同一ファイル名のファイルが既にアップロードされています。',
        failDeleteApi: 'APIの削除に失敗しました。',
      },
      activeModels: {
        title: '利用可能なモデル設定',
        description: 'このボットで使用可能なモデルを設定します。',
      },
      promptCaching: {
        title: 'プロンプトキャッシュ',
        promptCachingEnabled: {
          title: 'モデルが対応している場合、プロンプトキャッシュを利用する。',
          description: '有効にすると、このボットと繰り返し会話した際のコストとレイテンシーを削減できます。',
        },
      },
    },
    admin: {
      botAnalytics: {
        label: {
          pageTitle: 'ボット確認',
          noBotUsages: '指定の集計期間内にボットは利用されていません。',
          published: 'API公開中',
          SearchCondition: {
            title: '集計期間',
            from: 'From',
            to: 'To',
          },
          sortByCost: '利用料金でソート',
        },
        help: {
          overview: 'ボットと公開済みのAPIにおける利用状況を確認できます。',
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
          owner: 'オーナー',
          privateBot: 'プライベートボット',
          sharedAllUsers: '全てのユーザーに共有されています',
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
    discover: {
      pageTitle: 'ボットを探す',
      description:
        '全員に共有されているボットとあなたがアクセス許可されているボットのみ、検索・表示されます。',
      search: {
        placeholder: 'ボットを検索する',
        searching: '検索中...',
        results: '"{{query}}"にマッチするボットが{{count}}件見つかりました',
        noResults: '"{{query}}"にマッチするボットは見つかりませんでした',
        tryDifferent: '別のキーワードで検索してください。',
        backToHome: 'ホームに戻る',
      },
      essential: {
        label: '利用推奨ボット',
        description:
          '管理者が厳選した利用が推奨されているボットです。業務効率化が見込めるので積極的に使いましょう。',
        noEssentialBotsMessage: {
          title: '利用推奨ボットがありません',
          content: `利用推奨ボットが登録されていないため、管理者以外にこのセクションは表示されていません。<br/>
          利用推奨ボットとして登録するには、ボットを全てのユーザーに共有する必要があります。<br/>
          チャット画面、マイボット画面、スター付きのボット一覧画面、最近使用したボット一覧画面に表示されている当該ボットのメニューから、登録することができます。<br/>
          ボットの横に表示されている<MenuButton/> ボタンを押すと、メニューを開くことができます。`,
        },
      },
      trending: {
        label: '人気のボット',
        description: '最も人気のあるボットです。',
      },
      discover: {
        label: '発見',
        description: 'ランダムにピックアップしたボットが表示されます。',
      },
    },
    conversationHistory: {
      pageTitle: 'チャット履歴',
      label: {
        noConversations: 'チャット履歴がありません',
      },
      searchConversation: {
        placeholder: '会話を検索...',
        searching: '検索中...',
        results: ' "{{query}}"にマッチしたチャットが{{count}}件見つかりました',
        noResults: '{{query}}にマッチするチャットが見つかりませんでした',
        tryDifferentKeywords: '別のキーワードで試してください',
        resultsCount: '{{count}}件の検索結果',
      },
    },
    deleteDialog: {
      title: '削除',
      content: 'チャット「<Bold>{{title}}</Bold>」を削除しますか？',
      pinnedBotError: {
        title: '削除できません',
        content:
          'このボットは利用推奨ボットに登録されています。利用推奨ボットの変更は管理者が行うことができます。',
      },
    },
    clearDialog: {
      title: '削除',
      content: 'すべての会話履歴を削除しますか？',
    },
    languageDialog: {
      title: '言語の切替',
    },
    drawerOptionsDialog: {
      title: 'サイドメニューオプション',
      label: {
        visibility: '表示設定',
        displayCount: '表示数',
      },
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
      backToConversationHistory: 'チャット履歴に戻る',
      botConsole: 'ボットコンソール',
      botAnalytics: 'ボット確認',
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
      continue: '生成を続ける',
      botManagement: 'ボットの管理',
      drawerOption: 'サイドメニューオプション',
      mode: 'モード',
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
        label:
          'PDFの詳細解析の有効化。有効にすると時間をかけてPDFを詳細に分析します。',
        hint: '検索精度を高めたい場合に有効です。計算により多くの時間がかかるため計算コストが増加します。',
      },
      help: {
        chunkSize:
          'チャンクサイズが小さすぎると文脈情報が失われ、大きすぎると同一チャンクの中に異なる文脈の情報が存在することになり、検索精度が低下する場合があります。',
        chunkOverlap:
          'チャンクオーバーラップを指定することで、チャンク境界付近の文脈情報を保持することができます。チャンクサイズを大きくすることで、検索精度の向上ができる場合があります。しかし、チャンクオーバーラップを大きくすると、計算コストが増大するのでご注意ください。',
        overlapTokens:
          '重複するトークンの数、または隣接するチャンク間で繰り返すトークンの数を構成します。たとえば、オーバーラップ トークンを 60 に設定すると、最初のチャンクの最後の 60 個のトークンも 2 番目のチャンクの先頭に含まれます。',
        maxParentTokenSize:
          '親チャンクサイズを定義できます。取得中、システムは最初に子チャンクを取得しますが、より包括的なコンテキストをモデルに提供するために、それらをより広範な親チャンクに置き換えます',
        maxChildTokenSize:
          '子チャンクサイズを定義できます。取得中、システムは最初に子チャンクを取得しますが、より包括的なコンテキストをモデルに提供するために、それらをより広範な親チャンクに置き換えます',
        bufferSize:
          'このパラメータは、各チャンクの境界を決定するために一緒に検査されるテキストの量に影響を与え、結果として生じるチャンクの粒度と一貫性に影響を与える可能性があります。バッファサイズを大きくすると、より多くのコンテキストをキャプチャできますが、ノイズも発生する可能性があります。バッファサイズを小さくすると、重要なコンテキストを見逃す可能性がありますが、より正確なチャンクが保証されます。',
        breakpointPercentileThreshold:
          'しきい値が高いほど、文を異なるチャンクに分割するために、文をより区別できる必要があります。しきい値が高いほどチャンクが少なくなり、通常は平均チャンクサイズが大きくなります。',
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
    generationConfig: {
      title: '推論パラメーターの設定',
      description:
        'LLM の推論パラメーターを設定して、モデルからの応答を制御することができます。',
      maxTokens: {
        label: '最大長',
        hint: '生成されるトークン数の最大長を指定します。',
      },
      temperature: {
        label: '温度（Temperature）',
        hint: '予測される出力の確率分布の形状に影響を与え、モデルが低確率の出力を選択する可能性に影響を及ぼします。',
        help: '温度を低くするとランダム性の低い出力を行い、温度を高くするとランダム性の高い出力を行います。',
      },
      topK: {
        label: 'Top-k',
        hint: 'モデルが次のトークンを予測する際に、最も可能性の高い候補の数を指定します。',
        help: '値を小さくすると候補の数が少なくなり、結果としてランダム性が低くなります。値を大きくすると候補の数が多くなり、結果としてランダム性が高くなります。',
      },
      topP: {
        label: 'Top-p',
        hint: 'モデルが次のトークンを予測する際に、最も可能性が高い候補の割合を示します。',
        help: '値を小さくすると候補の数が少なくなり、結果としてランダム性が低くなります。値を大きくすると候補の数が多くなり、結果としてランダム性が高くなります。',
      },
      stopSequences: {
        label: '停止シーケンス',
        hint: '指定したキーワードを含む場合、モデルは生成を停止します。複数の単語を設定する場合は、カンマ区切りで入力してください。',
      },
      budgetTokens: {
        label: '思考予算トークン',
        hint: '深い思考に割り当てるトークンの最大数。より大きな値は、より複雑な思考を可能にしますが、応答時間が長くなる可能性があります。',
        help: '深い思考に割り当てる思考予算トークンは、トークンの最大長よりも長くできません。',
      },
    },
    searchSettings: {
      title: '検索設定',
      description:
        'ベクトルストアから関連ドキュメントを検索する際の設定が行えます。',
      maxResults: {
        label: '最大検索数',
        hint: 'ベクトルストアから検索するレコードの最大数',
      },
      searchType: {
        label: '検索タイプ',
        hybrid: {
          label: 'ハイブリッド検索',
          hint: 'セマンティック検索およびテキスト検索からの関連性スコアを組み合わせて、より高い精度を提供します。',
        },
        semantic: {
          label: 'セマンティック検索',
          hint: 'ベクトル埋め込みを使用して、関連する結果を提供します。',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'ナレッジの詳細設定',
      description:
        'ナレッジを設定するための埋め込みモデルの選択や、ナレッジとして追加したドキュメントの分割方法などを設定します。ボット作成後の変更はできません。',
      embeddingModel: {
        label: '埋め込みモデル',
        titan_v2: {
          label: 'Titan Embedding Text v2',
        },
        cohere_multilingual_v3: {
          label: 'Embed Multilingual v3',
        },
      },
      chunkingStrategy: {
        label: 'チャンキング戦略',
        default: {
          label: 'デフォルトチャンキング',
          hint: 'チャンクに自動的に分割します。各チャンクは最大 300 トークンです。ドキュメントに含まれるトークンが 300 未満である場合、それ以上分割されません。',
        },
        fixed_size: {
          label: '固定サイズのチャンキング',
          hint: 'テキストをほぼ固定サイズのチャンクに分割します。',
        },
        hierarchical: {
          label: '階層チャンキング',
          hint: 'テキストを子チャンクと親チャンクのネストされた構造に分割します。',
        },
        semantic: {
          label: 'セマンティックチャンキング',
          hint: 'テキストを意味のあるチャンクに分割します。',
        },
        none: {
          label: 'チャンキングなし',
          hint: 'ドキュメントを分割しません。',
        },
      },
      chunkingMaxTokens: {
        label: '最大トークン数',
        hint: '埋め込み時のチャンクあたりの最大トークン数を設定します。',
      },
      chunkingOverlapPercentage: {
        label: 'チャンク間のオーバーラップの割合',
        hint: 'チャンク間でオーバーラップするトークンのおおよその割合を設定します。',
      },
      overlapTokens: {
        label: 'チャンク間のオーバラップトークン数',
        hint: '同じレイヤー内のチャンク間でオーバラップするトークンの数',
      },
      maxParentTokenSize: {
        label: '親トークンの最大サイズ',
        hint: 'チャンクが親レイヤーに含めることができるトークンの最大数',
      },
      maxChildTokenSize: {
        label: '子トークンの最大サイズ',
        hint: 'チャンクが子レイヤーに含めることができるトークンの最大数',
      },
      bufferSize: {
        label: 'バッファサイズ',
        hint: '埋め込み作成に追加される周囲の文の数を定義します。バッファサイズが 1 の場合、3つの文 (現在、前、次の文) が結合されて埋め込まれます。',
      },
      breakpointPercentileThreshold: {
        label: 'ブレークポイントパーセンタイルしきい値',
        hint: '文間にブレークポイントを描画するための文の距離/類似性のパーセンタイルしきい値を設定します。',
      },
      opensearchAnalyzer: {
        label: 'アナライザー（トークナイズ・正規化）',
        hint: 'ナレッジに登録した文書のトークナイズや正規化を行うアナライザーを指定します。 適切なアナライザーを選択することで、検索精度が向上します。 ナレッジの言語に合わせて、最適なアナライザーを選択してください。',
        icu: {
          label: 'ICU analyzer',
          hint: 'トークナイズは {{tokenizer}} を利用し、正規化は {{normalizer}} を利用します。',
        },
        kuromoji: {
          label: 'Japanese (kuromoji) analyzer',
          hint: 'トークナイズは {{tokenizer}} を利用し、正規化は {{normalizer}} を利用します。',
        },
        none: {
          label: 'デフォルトアナライザー',
          hint: 'システム (OpenSearch) で定義されているデフォルトアナライザーを利用します。',
        },
        tokenizer: 'トークナイザー:',
        normalizer: 'ノーマライザー（正規化）:',
        token_filter: 'トークンフィルター:',
        not_specified: '指定なし',
      },
      advancedParsing: {
        label: '高度なドキュメント解析機能',
        description:
          'ドキュメントの高度なドキュメント解析機能に使用するモデルを選択してください。',
        hint: '構造が損なわれていないPDF内の表など、サポートされている文書形式の標準テキスト以外の解析に適しています。生成AIを使用した解析のために追加のコストが発生します。',
      },
      parsingModel: {
        label: '高度なパースモデル',
        none: {
          label: 'なし',
          hint: 'ドキュメントの高度な解析機能は適用されません。',
        },
        claude_3_5_sonnet_v1: {
          label: 'Claude 3.5 Sonnet v1',
          hint: 'Claude 3.5 Sonnet v1を使用してドキュメントの高度な解析を行います。',
        },
        claude_3_haiku_v1: {
          label: 'Claude 3 Haiku v1',
          hint: 'Claude 3 Haiku v1を使用してドキュメントの高度な解析を行います。',
        },
      },
      webCrawlerConfig: {
        title: 'Webクローラーの設定',
        crawlingScope: {
          label: 'スコープ',
          default: {
            label: 'デフォルト',
            hint: 'クロールを、同じホストに属し、同じ初期URLパスを持つウェブページに制限します。例えば、シードURLが "https://aws.amazon.com/bedrock/" の場合、このパスとこのパスから派生するウェブページのみがクロールされます。例えば "https://aws.amazon.com/bedrock/agents/" などです。"https://aws.amazon.com/ec2/" のような兄弟URLはクロールされません。',
          },
          subdomains: {
            label: 'サブドメイン',
            hint: 'シードURLと同じプライマリドメインを持つすべてのウェブページのクロールを含めます。例えば、シードURLが "https://aws.amazon.com/bedrock/" の場合、"amazon.com" を含むすべてのウェブページがクロールされます。"https://www.amazon.com" のようなページも含まれます。',
          },
          hostOnly: {
            label: 'ホストオンリー',
            hint: 'クロールを同じホストに属するウェブページに制限します。例えば、シードURLが "https://aws.amazon.com/bedrock/" の場合、"https://docs.aws.amazon.com" のようなウェブページもクロールされます。"https://aws.amazon.com/ec2" のようなページも含まれます。',
          },
        },
        includePatterns: {
          label: 'ウェブクロールに含めるパターン',
          hint: 'ウェブクロールに含めるパターンを指定します。これらのパターンに一致するURLのみがクロールされます。',
        },
        excludePatterns: {
          label: 'ウェブクロールに含めないパターン',
          hint: 'ウェブクロールから除外するパターンを指定します。これらのパターンに一致するURLはクロールされません。',
        },
      },
      advancedConfigration: {
        existingKnowledgeBaseId: {
          label: '既存のAmazon Bedrock Knowledge BaseのID',
          description:
            '既存のAmazon Bedrock Knowledge Baseを利用できます',
          noKnowledgeBasesFound:
            'アカウントにナレッジベースが見つかりません。最初にナレッジベースを作成してください。',
        },
        createDedicatedKnowledgeBase: {
          label: '専用のKnowledge Baseを作成する',
        },
        createTenantInSharedKnowledgeBase: {
          label: '共有のKnowledge Baseにテナントを作成する',
        },
        useExistingKnowledgeBase: {
          label: '外部のKnowledge Baseを利用する',
        },
      },
    },
    error: {
      answerResponse: '回答中にエラーが発生しました。',
      notFoundConversation:
        '指定のチャットは存在しないため、新規チャット画面を表示しました。',
      notFoundPage: 'お探しのページが見つかりませんでした。',
      unexpectedError: {
        title: '予期せぬエラーが発生しました',
        restore: 'TOPページに戻る',
      },
      predict: {
        general: '推論中にエラーが発生しました。',
        invalidResponse: '想定外のResponseが返ってきました。',
      },
      notSupportedImage: '選択しているモデルは、画像を利用できません。',
      unsupportedFileFormat: '選択したファイル形式はサポートされていません。',
      totalFileSizeToSendExceeded:
        'ファイルサイズの合計が{{maxSize}}を超えています。',
      attachment: {
        fileSizeExceeded: 'ファイルサイズは{{maxSize}}以下にしてください。',
        fileCountExceeded: 'ファイル数は{{maxCount}}以下にしてください。',
      },
      cannotAccessBot:
        'このボットにアクセスできません。新しいチャットへリダイレクトしました。',
      share: {
        markedEssential: {
          title: '共有設定を変更できません',
          content:
            'このボットは管理者によって利用推奨ボットに登録されています。利用推奨ボットは全ユーザーに共有する必要があります。',
        },
        publication: {
          title: '共有設定を変更できません',
          content:
            'このボットは管理者によってAPIとして公開されています。APIを公開するためには、全ユーザーに共有する必要があります。',
        },
      },
      invalidMermaidFormat: "ダイアグラム描画時にエラーが発生しました"
    },
    validation: {
      title: 'バリデーションエラー',
      maxRange: {
        message: '設定できる最大値は{{size}}です',
      },
      minRange: {
        message: '設定できる最小値は{{size}}です',
      },
      chunkOverlapLessThanChunkSize: {
        message:
          'チャンクオーバーラップはチャンクサイズより小さく設定する必要があります',
      },
      parentTokenRange: {
        message:
          '親トークンのサイズは子トークンのサイズより大きくする必要があります',
      },
      quickStarter: {
        message: 'タイトルと入力例は、どちらも入力してください。',
      },
      maxBudgetTokens: {
        message:
          '思考予算トークンは、トークンの最大長である{{size}}より大きい値を設定できません。',
      },
      required: '{{key}}は必須入力です。',
      number: {
        greaterThen: '{{key}}は{{value}}より大きい数字にしてください。',
      },
    },
    helper: {
      shortcuts: {
        title: 'ショートカットキー',
        items: {
          focusInput: 'チャット入力にフォーカスを移す',
          newChat: '新しいチャットを開く',
        },
      },
    },
    guardrails: {
      title: 'ガードレール',
      label: 'Amazon Bedrockのガードレールを有効にする',
      hint: 'Amazon Bedrockのガードレールは、ユースケースや責任あるAIポリシーに基づいてアプリケーション固有の保護機能を実装するために使用されます。',
      harmfulCategories: {
        label: '有害カテゴリー',
        hint: 'コンテンツフィルタを構成して、ユーザー入力やモデル応答が使用ポリシーに違反する有害な内容を検出してブロックするフィルタリングの度合いを調整します。0: 無効, 1: 低, 2: 中, 3: 高',
        hate: {
          label: '憎悪',
          hint: '人種、民族、性別、宗教、性的指向、能力、国籍などのアイデンティティに基づいて、個人やグループを差別、批判、侮辱、非難、または非人間化する入力やモデル応答を示します。0: 無効, 1: 低, 2: 中, 3: 高',
        },
        insults: {
          label: '侮辱',
          hint: '蔑視、屈辱、嘲笑、侮辱、軽蔑の言葉を含む入力やモデル応答を示します。このタイプの言葉は、いじめとも呼ばれます。0: 無効, 1: 低, 2: 中, 3: 高',
        },
        sexual: {
          label: '性的',
          hint: '体の部位、身体的特徴、性行為に対する直接的または間接的な言及を含む性的な興味や行動、または興奮を示す入力やモデル応答を示します。0: 無効, 1: 低, 2: 中, 3: 高',
        },
        violence: {
          label: '暴力',
          hint: '個人、グループ、または物体に対する身体的な痛み、傷害を称賛したり、脅迫する内容を含む入力やモデル応答を示します。0: 無効, 1: 低, 2: 中, 3: 高',
        },
        misconduct: {
          label: '不正行為',
          hint: '不正行為や、人、グループ、機関を害したり、騙したり、悪用したりする情報を求めたり提供したりする入力やモデル応答を示します。0: 無効, 1: 低, 2: 中, 3: 高',
        },
      },
      contextualGroundingCheck: {
        label: 'コンテキストベースの根拠確認',
        hint: 'このポリシーを使用して、モデル応答が参照ソースに基づいており、ユーザーの質問に関連しているかどうかを検証し、モデルの幻覚をフィルタリングします。',
        groundingThreshold: {
          label: '根拠',
          hint: 'モデル応答が参照ソースに基づいて事実に即しているかどうかを確認し、定義された根拠の閾値を下回る応答をブロックします。0: 何もブロックしない, 1: ほぼすべてをブロックする',
        },
        relevanceThreshold: {
          label: '関連性',
          hint: 'モデル応答がユーザーの質問に関連しているかどうかを確認し、関連性の閾値を下回る応答をブロックします。0: 何もブロックしない, 1: ほぼすべてをブロックする',
        },
      },
    },
    reasoning: {
      button: {
        label: '深い思考',
      },
      card: {
        label: '思考過程',
      },
    },
  },
};

export default translation;
