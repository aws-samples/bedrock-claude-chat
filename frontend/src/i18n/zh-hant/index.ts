// Check for any missing settings by uncomment
// import en from '../en';
// const translation: typeof en = {
  const translation = {
    translation: {
      app: {
        name: 'Bedrock Claude Chat',
        inputMessage: '請輸入訊息',
        starredBots: '我的最愛 Bots',
        recentlyUsedBots: '最近用過的 Bots',
        conversationHistory: '交談紀錄',
        chatWaitingSymbol: '▍',
        adminConsoles: '僅供管理員使用',
      },
      bot: {
        label: {
          myBots: '我的 Bots',
          recentlyUsedBots: '最近使用過的共用 Bots',
          knowledge: '知識',
          url: 'URL',
          sitemap: 'Sitemap URL',
          file: '檔案',
          loadingBot: '載入中...',
          normalChat: '聊天',
          notAvailableBot: '[不存在]',
          notAvailableBotInputMessage: '這個 Bot 不存在。',
          noDescription: '沒有描述',
          notAvailable: '這個 Bot 不存在。',
          noBots: '沒有 Bots.',
          noBotsRecentlyUsed: '最近沒有使用過共用 Bots。',
          retrievingKnowledge: '[擷取知識中...]',
          dndFileUpload:
            '您可以透過拖拉的方式上傳檔案。\n支援的檔案類型: {{fileExtensions}}',
          uploadError: '錯誤訊息',
          syncStatus: {
            queue: '等待同步',
            running: '同步中',
            success: '同步完成',
            fail: '同步失敗',
          },
          fileUploadStatus: {
            uploading: '上傳中...',
            uploaded: '上傳完成',
            error: '錯誤',
          },
        },
        titleSubmenu: {
          edit: '編輯',
          copyLink: '複製連結',
          copiedLink: '已複製到剪貼簿',
        },
        help: {
          overview:
            'Bots 根據預先定義的指示 (instruction) 進行回應。為了讓聊天 (Chat) 能按預期操作，通常需要在訊息中定義上下文。但若於 Bots 內事先定義好，則於聊天時無需定義上下文。',
          instructions:
            '定義 Bot 應如何行為。給予模糊的指令可能會導致不可預測的行為，因此請提供清晰且具體的指令。',
          knowledge: {
            overview:
              '透過向 Bot 提供外部知識，它就能夠回答那些不包括在預訓練資料的問題。',
            url: '透過 URL 指定網頁內容作為知識。如果您設定 YouTube 影片的 URL，該影片的文字記錄將作為知識。',
            sitemap:
              '透過指定網站的 sitemap URL，Bot 將自動抓取 sitemap 中的網頁資訊作為知識。',
            file: '上傳的檔案將作為知識。',
          },
        },
        alert: {
          sync: {
            error: {
              title: '知識同步錯誤',
              body: '知識同步時發生錯誤。請檢查以下錯誤訊息:',
            },
            incomplete: {
              title: '尚未完成',
              body: 'Bot 尚未完成知識同步，將使用之前已同步的知識進行回答。',
            },
          },
        },
        samples: {
          title: 'Bot 指示 (instruction) 範例',
          anthropicLibrary: {
            title: 'Anthropic Prompt 庫',
            sentence: '您需要更多範例嗎? 請至: ',
            url: 'https://docs.anthropic.com/claude/prompt-library',
          },
          pythonCodeAssistant: {
            title: 'Python 程式開發助手',
            prompt: `Write a short and high-quality python script for the given task, something a very skilled python expert would write. You are writing code for an experienced developer so only add comments for things that are non-obvious. Make sure to include any imports required. 
  NEVER write anything before the \`\`\`python\`\`\` block. After you are done generating the code and after the \`\`\`python\`\`\` block, check your work carefully to make sure there are no mistakes, errors, or inconsistencies. If there are errors, list those errors in <error> tags, then generate a new version with those errors fixed. If there are no errors, write "CHECKED: NO ERRORS" in <error> tags.`,
          },
          mailCategorizer: {
            title: 'Mail 分類器',
            prompt: `You are a customer service agent tasked with classifying emails by type. Please output your answer and then justify your classification. 
  
  The classification categories are: 
  (A) Pre-sale question 
  (B) Broken or defective item 
  (C) Billing question 
  (D) Other (please explain)
  
  How would you categorize this email?`,
          },
          fitnessCoach: {
            title: 'Personal Fitness Coach',
            prompt: `You are an upbeat, enthusiastic personal fitness coach named Sam. Sam is passionate about helping clients get fit and lead healthier lifestyles. You write in an encouraging and friendly tone and always try to guide your clients toward better fitness goals. If the user asks you something unrelated to fitness, either bring the topic back to fitness, or say that you cannot answer.`,
          },
        },
        create: {
            pageTitle: '建立我的 Bot',
          },
          edit: {
            pageTitle: '編輯我的 Bot',
          },
          item: {
            title: '名稱',
            description: '描述',
            instruction: '指示 (instruction)',
          },  
        apiSettings: {
          pageTitle: '共用的 Bot 發佈 API 設定',
          label: {
            endpoint: 'API Endpoint',
            usagePlan: '用量計畫',
            allowOrigins: 'Allowed Origins',
            apiKeys: 'API 金鑰',
            period: {
              day: '每天',
              week: '每週',
              month: '每月',
            },
            apiKeyDetail: {
              creationDate: '建立日期',
              active: '有效',
              inactive: '失效',
              key: 'API 金鑰',
            },
          },
          item: {
            throttling: '限流',
            burstLimit: 'Burst',
            rateLimit: 'Rate',
            quota: '額度',
            requestLimit: '請求',
            offset: 'Offset',
          },
          help: {
            overview:
              "建立 API 可讓外部客戶端可以存取 Bot 的功能; 透過 API 與外部應用程式整合。",
            endpoint: '用戶端可透過此 endpoint 存取 Bot。',
            usagePlan:
              '用量計畫 (Usage plans) 將設定您的 API 可以從用戶端接收的請求數量和頻率。將 API 和用量計畫關聯以追蹤 API 收到的請求。',
            throttling: '限制用戶端呼叫您的 API 的速率',
            rateLimit:
              '輸入客戶端可以呼叫您的 API 的速率（以每秒請求數為單位）。',
            burstLimit:
              '輸入客戶端可以向您的 API 發出的併發 (concurrent) 請求數。',
            quota:
              '開啟配額以限制使用者在特定時間內可以向您的 API 發出的請求數量。',
            requestLimit:
              'Enter the total number of requests that a user can make in the time period you select in the dropdown list.',
            allowOrigins:
              'Allowed client origins for access. If the origin is not allowed, the caller receives a 403 Forbidden response and is denied access to the API. The Origin must follow the format: "(http|https)://host-name" or "(http|https)://host-name:port" and wildcards(*) can be used.',
            allowOriginsExample:
              'e.g. https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
            apiKeys:
              'An API key is an alphanumeric string that used to identify a client of your API. Otherwise, the caller receives a 403 Forbidden response and is denied access to the API.',
          },
          button: {
            ApiKeyShow: '顯示',
            ApiKeyHide: '隱藏',
          },
          alert: {
            botUnshared: {
              title: 'Please Share The Bot',
              body: 'You cannot publish an API for the bot that is not shared.',
            },
            deploying: {
              title: 'The API deployment is in PROGRESS',
              body: 'Please wait until the deployment is complete.',
            },
            deployed: {
              title: 'The API has been DEPLOYED',
              body: 'You can access the API from the Client using the API Endpoint and API Key.',
            },
            deployError: {
              title: 'FAILED to deploy the API',
              body: 'Please delete the API and re-create the API.',
            },
          },
          deleteApiDaialog: {
            title: 'Delete?',
            content:
              'Are you sure to delete the API? The API endpoint will be deleted, and the client will no longer have access to it.',
          },
          addApiKeyDialog: {
            title: 'Add API Key',
            content: 'Enter a name to identify the API Key.',
          },
          deleteApiKeyDialog: {
            title: 'Delete?',
            content:
              'Are you sure to delete <Bold>{{title}}</Bold>?\nClients using this API Key will be denied access to the API.',
          },
        },
        button: {
          newBot: '建立一個新的 Bot',
          create: '建立',
          edit: '編輯',
          delete: '刪除',
          share: '共用',
          apiSettings: 'API 發佈設定',
          copy: '複製',
          copied: '複製完成',
          instructionsSamples: '範本',
          chooseFiles: '選取檔案',
        },
        deleteDialog: {
          title: '刪除?',
          content: '您確定要刪除 <Bold>{{title}}</Bold>?',
        },
        shareDialog: {
          title: '共用',
          off: {
            content:
              '連結分享已關閉，除了您之外，沒有其他人可以使用此 Bot。',
          },
          on: {
            content:
              '連結分享已啟用，所有使用者可以透過此連結和此 Bot 交談。',
          },
        },
        error: {
          notSupportedFile: '檔案類型不支援。',
          duplicatedFile: '重複檔名的檔案已經上傳過。',
          failDeleteApi: '刪除 API 失敗。',
        },
      },
      admin: {
        sharedBotAnalytics: {
          label: {
            pageTitle: 'Shared Bot Analytics',
            noPublicBotUsages:
              'During the Calculation Period, no public bots were utilized.',
            published: 'API is published.',
            SearchCondition: {
              title: 'Calculation Period',
              from: 'From',
              to: 'To',
            },
            sortByCost: 'Sort by Cost',
          },
          help: {
            overview:
              'Monitor the usage status of Shared Bots and Published Bot APIs.',
            calculationPeriod:
              'If the Calculation Period is not set, the cost for today will be displayed.',
          },
        },
        apiManagement: {
          label: {
            pageTitle: 'API 管理',
            publishedDate: '發佈日期',
            noApi: '沒有 API。',
          },
        },
        botManagement: {
          label: {
            pageTitle: 'Bot 管理',
            sharedUrl: '共用的 Bot URL',
            apiSettings: 'API 發佈設定',
            noKnowledge: '該 Bot 目前沒有設定知識。',
            notPublishApi: "該 Bot 的 API 尚未發佈。",
            deployStatus: '部署狀態',
            cfnStatus: 'CloudFormation 狀態',
            codebuildStatus: 'CodeBuild 狀態',
            codeBuildId: 'CodeBuild ID',
            usagePlanOn: '開啟',
            usagePlanOff: '關閉',
            rateLimit:
              '<Bold>{{limit}}</Bold> 請求數/秒，客戶端可以呼叫此 API。',
            burstLimit:
              '用戶端可以同時向 API 發出 <Bold>{{limit}}</Bold> 個同步 (concurrent) 請求。',
            requestsLimit:
              '您可以 <Bold>{{period}}</Bold> 發出 <Bold>{{limit}}</Bold> 個請求 。',
          },
          alert: {
            noApiKeys: {
              title: '沒有 API 金鑰',
              body: '所有用戶端都無法存取該 API。',
            },
          },
          button: {
            deleteApi: '刪除 API',
          },
        },
        validationError: {
          period: '請提供 From 和 To',
        },
      },
      deleteDialog: {
        title: '刪除?',
        content: '您確定要刪除 <Bold>{{title}}</Bold> 嗎?',
      },
      clearDialog: {
        title: '刪除全部?',
        content: '您確定要刪除全部對話嗎?',
      },
      languageDialog: {
        title: '切換語言',
      },
      button: {
        newChat: '新的聊天',
        botConsole: 'Bot 主控台',
        sharedBotAnalytics: '共用 Bot 用量分析',
        apiManagement: 'API 管理',
        userUsages: '使用者用量',
        SaveAndSubmit: '保存並提交',
        resend: '重新發送',
        regenerate: '重新生成',
        delete: '刪除',
        deleteAll: '刪除全部',
        done: '完成',
        ok: '確定',
        cancel: '取消',
        back: '退回',
        menu: '選單',
        language: '切換語言',
        clearConversation: '刪除所有對話',
        signOut: '登出',
        close: '關閉',
        add: '新增',
      },
      input: {
        hint: {
          required: '* 必填',
        },
        validationError: {
          required: '這是必要欄位。',
          invalidOriginFormat: 'Origin 格式無效。',
        },
      },
      error: {
        answerResponse: '在回答時發生了錯誤。',
        notFoundConversation:
          '由於指定的聊天不存在，因此顯示了新的聊天視窗。',
        notFoundPage: '找不到您需要的頁面。',
        predict: {
          general: '在預測時發生了錯誤。',
          invalidResponse:
            '收到了未預期的回應。回應的格式不符合預期。',
        },
        notSupportedImage: '目前選取的模型不支援影像。',
      },
    },
  };
  
  export default translation;
  