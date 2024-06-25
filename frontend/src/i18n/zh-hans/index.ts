// Check for any missing settings by uncomment
// import en from '../en';
// const translation: typeof en = {
  const translation = {
    translation: {
      app: {
        name: 'Bedrock Claude Chat',
        nameWithoutClaude: 'Bedrock Chat',
        inputMessage: '请输入',
        starredBots: '我的 Bots 收藏',
        recentlyUsedBots: '最近使用过的 Bots',
        conversationHistory: '交谈纪录',
        chatWaitingSymbol: '▍',
        adminConsoles: '仅供管理员使用',
      },
      bot: {
        label: {
          myBots: '我的 Bots',
          recentlyUsedBots: '最近使用过的共用 Bots',
          knowledge: '知识',
          url: 'URL',
          sitemap: 'Sitemap URL',
          file: '档案',
          loadingBot: '加载中...',
          normalChat: '聊天',
          notAvailableBot: '[不存在]',
          notAvailableBotInputMessage: '这个 Bot 不存在。',
          noDescription: '没有描述',
          notAvailable: '这个 Bot 不存在。',
          noBots: '没有 Bots.',
          noBotsRecentlyUsed: '最近没有使用过共用 Bots。',
          retrievingKnowledge: '[撷取知识中...]',
          dndFileUpload:
            '您可以透过拖拉的方式上传档案。 \n支援的档案类型: {{fileExtensions}}',
          uploadError: '错误信息',
          syncStatus: {
            queue: '等待同步',
            running: '同步中',
            success: '同步完成',
            fail: '同步失败',
          },
          fileUploadStatus: {
            uploading: '上传中...',
            uploaded: '上传完成',
            error: '错误',
          },
        },
        titleSubmenu: {
          edit: '编辑',
          copyLink: '复制连结',
          copiedLink: '已复制到剪贴簿',
        },
        help: {
          overview:
            'Bots 根据预先定义的指示 (instruction) 进行回应。 为了让聊天 (Chat) 能按预期操作，通常需要在讯息中定义上下文。 但若于 Bots 内事先定义好，则于聊天时无需定义上下文。 ',
          instructions:
            '定义 Bot 应如何行为。 给予模糊的指令可能会导致不可预测的行为，因此请提供清晰且具体的指令。',
          knowledge: {
            overview:
              '透过向 Bot 提供外部知识，它就能够回答那些不包括在预训练资料的问题。',
            url: '透过 URL 指定网页内容作为知识。 如果您设定 YouTube 影片的 URL，该影片的文字记录将作为知识。',
            sitemap:
              '透过指定网站的 sitemap URL，Bot 将自动抓取 sitemap 中的网页资讯作为知识。',
             file: '上传的档案将作为知识。 ',
          },
        },
        alert: {
          sync: {
            error: {
              title: '知识同步错误',
              body: '知识同步时发生错误。 请检查以下错误讯息:',
            },
            incomplete: {
              title: '尚未完成',
              body: 'Bot 尚未完成知识同步，将使用之前已同步的知识进行回答。',
            },
          },
        },
        samples: {
          title: 'Bot 指示 (instruction) 范例',
          anthropicLibrary: {
            title: 'Anthropic Prompt 库',
            sentence: '您需要更多范例吗? 请至: ',
            url: 'https://docs.anthropic.com/claude/prompt-library',
          },
          pythonCodeAssistant: {
            title: 'Python 程式开发助手',
            prompt: `Write a short and high-quality python script for the given task, something a very skilled python expert would write. You are writing code for an experienced developer so only add comments for things that are non-obvious. Make sure to include any imports required. 
  NEVER write anything before the \`\`\`python\`\`\` block. After you are done generating the code and after the \`\`\`python\`\`\` block, check your work carefully to make sure there are no mistakes, errors, or inconsistencies. If there are errors, list those errors in <error> tags, then generate a new version with those errors fixed. If there are no errors, write "CHECKED: NO ERRORS" in <error> tags.`,
          },
          mailCategorizer: {
            title: 'Mail 分类器',
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
            pageTitle: '编辑我的 Bot',
          },
          item: {
            title: '名称',
            description: '描述',
            instruction: '指示 (instruction)',
          },  
        apiSettings: {
          pageTitle: '共用的 Bot 发布 API 设定',
          label: {
            endpoint: 'API Endpoint',
            usagePlan: '用量计画',
            allowOrigins: 'Allowed Origins',
            apiKeys: 'API 金钥',
            period: {
              day: '每天',
              week: '每周',
              month: '每月',
            },
            apiKeyDetail: {
              creationDate: '建立日期',
              active: '有效',
              inactive: '失效',
              key: 'API 金钥',
            },
          },
          item: {
            throttling: '限流',
            burstLimit: 'Burst',
            rateLimit: 'Rate',
            quota: '额度',
            requestLimit: '请求',
            offset: 'Offset',
          },
          help: {
            overview:
              "建立 API 可让外部客户端可以存取 Bot 的功能; 透过 API 与外部应用程式整合。",
            endpoint: '用户端可透过此 endpoint 存取 Bot。',
            usagePlan:
              '用量计画 (Usage plans) 将设定您的 API 可以从用户端接收的请求数量和频率。 将 API 和用量计画关联以追踪 API 收到的请求。',
            throttling: '限制用户端呼叫您的 API 的速率',
            rateLimit:
              '输入客户端可以呼叫您的 API 的速率（以每秒请求数为单位）。',
            burstLimit:
              '输入客户端可以向您的 API 发出的并发 (concurrent) 请求数。',
            quota:
              '开启配额以限制使用者在特定时间内可以向您的 API 发出的请求数量。',
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
            ApiKeyShow: '显示',
            ApiKeyHide: '隐藏',
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
          newBot: '建立一个新的 Bot',
          create: '建立',
          edit: '编辑',
          delete: '删除',
          share: '共用',
          apiSettings: 'API 发布设定',
          copy: '复制',
          copied: '复制完成',
          instructionsSamples: '范本',
          chooseFiles: '选取档案',
        },
        deleteDialog: {
          title: '删除?',
          content: '您确定要删除 <Bold>{{title}}</Bold>?',
        },
        shareDialog: {
          title: '共用',
          off: {
            content:
              '连结分享已关闭，除了您之外，没有其他人可以使用此 Bot。',
          },
          on: {
            content:
              '连结分享已启用，所有使用者可以透过此连结和此 Bot 交谈。',
          },
        },
        error: {
          notSupportedFile: '档案类型不支援。',
          duplicatedFile: '重复档名的档案已经上传过。',
          failDeleteApi: '删除 API 失败。',
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
            publishedDate: '发布日期',
            noApi: '没有 API。',
          },
        },
        botManagement: {
          label: {
            pageTitle: 'Bot 管理',
            sharedUrl: '共用的 Bot URL',
            apiSettings: 'API 发布设定',
            noKnowledge: '该 Bot 目前没有设定知识。',
            notPublishApi: "该 Bot 的 API 尚未发布。",
            deployStatus: '部署状态',
            cfnStatus: 'CloudFormation 状态',
            codebuildStatus: 'CodeBuild 状态',
            codeBuildId: 'CodeBuild ID',
            usagePlanOn: '开启',
            usagePlanOff: '关闭',
            rateLimit:
              '<Bold>{{limit}}</Bold> 请求数/秒，客户端可以呼叫此 API。',
            burstLimit:
              '用户端可以同时向 API 发出 <Bold>{{limit}}</Bold> 个同步 (concurrent) 请求。',
            requestsLimit:
              '您可以 <Bold>{{period}}</Bold> 发出 <Bold>{{limit}}</Bold> 个请求。',
          },
          alert: {
            noApiKeys: {
              title: '沒有 API 金钥',
              body: '所有用户端都无法存取该 API。',
            },
          },
          button: {
            deleteApi: '删除 API',
          },
        },
        validationError: {
          period: '请提供 From 和 To',
        },
      },
      deleteDialog: {
        title: '删除确认?',
        content: '您确定要删除聊天 "<Bold>title</Bold>" 吗？',
      },
      clearDialog: {
        title: '删除确认?',
        content: '是否删除所有聊天记录?',
      },
      languageDialog: {
        title: '切换语言',
      },
      button: {
        newChat: '新的聊天',
        botConsole: 'Bot 主控台',
        sharedBotAnalytics: '共用 Bot 用量分析',
        apiManagement: 'API 管理',
        userUsages: '使用者用量',
        SaveAndSubmit: '保存并提交',
        resend: '重新发送',
        regenerate: '重新生成',
        delete: '删除',
        deleteAll: '删除全部',
        done: '完成',
        ok: '确定',
        cancel: '取消',
        back: '退回',
        menu: '菜单',
        language: '切换语言',
        clearConversation: '清除所有对话',
        signOut: '退出登录',
        close: '关闭',
        add: '新增',
      },
      input: {
        hint: {
          required: '* 必填',
        },
        validationError: {
          required: '这是必要栏位。',
          invalidOriginFormat: 'Origin 格式无效。',
        },
      },
      generationConfig: {
        title: '推论参数',
        description: '您可以配置 LLM 推论参数来控制模型的响应',
        maxTokens: {
          label: '生成长度上限/新记号数上限',
          hint: '生成的回复中允许的最大记号数',
        },
        temperature: {
          label: '温度',
          hint: '影响预测输出的概率分布形状并影响模型选择较低概率输出的可能性',
          help: '选择较低的值来影响模型选择较高概率的输出；选择较高的值来影响模型选择较低概率的输出',
        },
        topK: {
          label: 'Top-k',
          hint: '模型考虑的最有可能的下一个记号的候选者数量',
          help: '选择较低的值以减小候选池的大小并将选项限制为更可能的选项；选择较高的值以增加候选池的大小并允许模型考虑不太可能的选项',
        },
        topP: {
          label: 'Top-p',
          hint: '模型考虑的最有可能的下一个记号的候选者百份比',
          help: '选择较低的值以减小候选池的大小并将选项限制为更可能的选项；选择较高的值以增加候选池的大小并允许模型考虑不太可能的选项',
        },
        stopSequences: {
          label: '结束记号/结束序列',
          hint: '指定阻止模型生成更多标记的字符序列。使用逗号分隔多个单词',
        }
      },
      searchSettings: {
        title: '搜索参数',
        description: '您可以配置搜索参数以从矢量数据库中获取相关文档。',
        maxResults: {
          label: '最大返回记录数',
          hint: '从矢量数据库中获取的最大返回记录数',
        }
      },
      error: {
        answerResponse: '在回答时发生了错误。',
        notFoundConversation:
          '由于指定的聊天不存在，因此显示了新的聊天窗口。',
        notFoundPage: '找不到您要查找的页面。',
        predict: {
          general: '在预测时发生了错误。',
          invalidResponse:
            '收到了意外的回应。',
        },
        notSupportedImage: '目前选取的模型不支援影像。',
      },
    },
  };
  
  export default translation;
  