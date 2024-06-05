const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Login',
      },
    },
    app: {
      name: 'Bedrock Claude Chat',
      nameWithoutClaude: 'Bedrock Chat',
      inputMessage: 'Send a message',
      starredBots: 'Starred Bots',
      recentlyUsedBots: 'Recently Used Bots',
      conversationHistory: 'History',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Admin Only',
    },
    agent: {
      label: 'Agent',
      help: {
        overview:
          'By using the Agent functionality, your chatbot can automatically handle more complex tasks.',
      },
      hint: `The agent automatically determines which tools to use to answer the user's questions. Due to the time required for decision, the response time tends to be longer. Activating one or more tools enables the agent's functionality. Conversely, if no tools are selected, the agent's functionality is not utilized. When the agent's functionality is enabled, the use of "Knowledge" is also treated as one of the tools. This means that "Knowledge" may not be used in responses.`,
      progress: {
        label: 'Agent Thinking...',
      },
      tools: {
        get_weather: {
          name: 'Current Weather',
          description: 'Retrieve the current weather forecast.',
        },
        sql_db_query: {
          name: 'Database Query',
          description:
            'Execute a detailed and correct SQL query to retrieve results from the database.',
        },
        sql_db_schema: {
          name: 'Database Schema',
          description:
            'Retrieve the schema and sample rows for a list of tables.',
        },
        sql_db_list_tables: {
          name: 'List Database Tables',
          description: 'List all tables available in the database.',
        },
        sql_db_query_checker: {
          name: 'Query Checker',
          description: 'Check if your SQL query is correct before execution.',
        },
        internet_search: {
          name: 'Internet Search',
          desciription: 'Search the internet for information.',
        },
      },
    },
    bot: {
      label: {
        myBots: 'My Bots',
        recentlyUsedBots: 'Recently Used Shared Bots',
        knowledge: 'Knowledge',
        url: 'URL',
        sitemap: 'Sitemap URL',
        file: 'File',
        loadingBot: 'Loading...',
        normalChat: 'Chat',
        notAvailableBot: '[NOT Available]',
        notAvailableBotInputMessage: 'This bot is NOT available.',
        noDescription: 'No Description',
        notAvailable: 'This bot is NOT available.',
        noBots: 'No Bots.',
        noBotsRecentlyUsed: 'No Recently Used Shared Bots.',
        retrievingKnowledge: '[Retrieving Knowledge...]',
        dndFileUpload:
          'You can upload files by drag and drop.\nSupported files: {{fileExtensions}}',
        uploadError: 'Error Message',
        referenceLink: 'Reference Link',
        syncStatus: {
          queue: 'Waiting Sync',
          running: 'Syncing',
          success: 'Completed Sync',
          fail: 'Failed Sync',
        },
        fileUploadStatus: {
          uploading: 'Uploading...',
          uploaded: 'Uploaded',
          error: 'ERROR',
        },
        citeRetrievedContexts: 'Retrieved Context Citation',
      },
      titleSubmenu: {
        edit: 'Edit',
        copyLink: 'Copy Link',
        copiedLink: 'Copied',
      },
      help: {
        overview:
          'Bots operate according to predefined instructions. Chat does not work as intended unless the context is defined in the message, but with bots, there is no need to define the context.',
        instructions:
          'Define how the bot should behave. Giving ambiguous instructions may lead to unpredictable movements, so provide clear and specific instructions.',
        knowledge: {
          overview:
            'By providing external knowledge to the bot, it becomes able to handle data that it has not been pre-trained on.',
          url: 'The information from the specified URL will be used as Knowledge. If you set the URL of a YouTube video, the transcript of that video will be used as Knowledge.',
          sitemap:
            'By specifying the URL of the sitemap, the information obtained through automatically scraping websites within it will be used as Knowledge.',
          file: 'The uploaded files will be used as Knowledge.',
          citeRetrievedContexts:
            'Configure whether to display context retrieved to answer user queries as citation information.\nIf enabled, users can access the original source URLs or files.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Knowledge Sync Error',
            body: 'An error occurred while synchronizing Knowledge. Please check the following message:',
          },
          incomplete: {
            title: 'NOT Ready',
            body: 'This bot has not completed the knowledge synchronization, so the knowledge before the update is used.',
          },
        },
      },
      samples: {
        title: 'Instructions Samples',
        anthropicLibrary: {
          title: 'Anthropic Prompt Library',
          sentence: 'Do you need more examples? Visit: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Python Coding Assistant',
          prompt: `Write a short and high-quality python script for the given task, something a very skilled python expert would write. You are writing code for an experienced developer so only add comments for things that are non-obvious. Make sure to include any imports required. 
NEVER write anything before the \`\`\`python\`\`\` block. After you are done generating the code and after the \`\`\`python\`\`\` block, check your work carefully to make sure there are no mistakes, errors, or inconsistencies. If there are errors, list those errors in <error> tags, then generate a new version with those errors fixed. If there are no errors, write "CHECKED: NO ERRORS" in <error> tags.`,
        },
        mailCategorizer: {
          title: 'Mail Categorizer',
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
        pageTitle: 'Create My Bot',
      },
      edit: {
        pageTitle: 'Edit My Bot',
      },

      item: {
        title: 'Name',
        description: 'Description',
        instruction: 'Instructions',
      },
      apiSettings: {
        pageTitle: 'Shared Bot Publish API Settings',
        label: {
          endpoint: 'API Endpoint',
          usagePlan: 'Usage Plan',
          allowOrigins: 'Allowed Origins',
          apiKeys: 'API Keys',
          period: {
            day: 'Per DAY',
            week: 'Per WEEK',
            month: 'Per MONTH',
          },
          apiKeyDetail: {
            creationDate: 'Creation date',
            active: 'Active',
            inactive: 'Inactive',
            key: 'API Key',
          },
        },
        item: {
          throttling: 'Throttling',
          burstLimit: 'Burst',
          rateLimit: 'Rate',
          quota: 'Quota',
          requestLimit: 'Requests',
          offset: 'Offset',
        },
        help: {
          overview:
            "Creating an API enables the Bot's functions to be accessed by external clients; APIs enable integration with external applications.",
          endpoint: 'The client can use the Bot from this endpoint.',
          usagePlan:
            'Usage plans specify the number or rate of requests that your API accepts from a client. Associate an API with a usage plan to track the requests your API receives.',
          throttling: 'Limit the rate that users can call your API.',
          rateLimit:
            'Enter the rate, in requests per second, that clients can call your API.',
          burstLimit:
            'Enter the number of concurrent requests that a client can make to your API.',
          quota:
            'Turn on quotas to limit the number of requests a user can make to your API in a given time period.',
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
          ApiKeyShow: 'Show',
          ApiKeyHide: 'Hide',
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
        newBot: 'Create New Bot',
        create: 'Create',
        edit: 'Edit',
        delete: 'Delete',
        share: 'Share',
        apiSettings: 'API Publish Settings',
        copy: 'Copy',
        copied: 'Copied',
        instructionsSamples: 'Samples',
        chooseFiles: 'Choose files',
      },
      deleteDialog: {
        title: 'Delete?',
        content: 'Are you sure to delete <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Share',
        off: {
          content:
            'Link sharing is off, so only you can access this bot through its URL.',
        },
        on: {
          content:
            'Link sharing is on, so ALL users can use this link to conversation.',
        },
      },
      error: {
        notSupportedFile: 'This file is not supported.',
        duplicatedFile: 'A file with the same name has been uploaded.',
        failDeleteApi: 'Failed to delete the API.',
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
          pageTitle: 'API Management',
          publishedDate: 'Published Date',
          noApi: 'No APIs.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Bot Management',
          sharedUrl: 'Shared Bot URL',
          apiSettings: 'API Publish Settings',
          noKnowledge: 'This bot has no Knowledge.',
          notPublishApi: "This bot's API is not published.",
          deployStatus: 'Deploy Status',
          cfnStatus: 'CloudFormation Status',
          codebuildStatus: 'CodeBuild Status',
          codeBuildId: 'CodeBuild ID',
          usagePlanOn: 'ON',
          usagePlanOff: 'OFF',
          rateLimit:
            '<Bold>{{limit}}</Bold> requests per second, that clients can call the API.',
          burstLimit:
            'The client can make <Bold>{{limit}}</Bold> concurrent requests to the API.',
          requestsLimit:
            'You can make <Bold>{{limit}}</Bold> requests <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'No API Keys',
            body: 'All clients cannot access the API.',
          },
        },
        button: {
          deleteApi: 'Delete API',
        },
      },
      validationError: {
        period: 'Enter both From and To',
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
    feedbackDialog: {
      title: 'Feedback',
      content: 'Please provide more details.',
      categoryLabel: 'Category',
      commentLabel: 'Comment',
      commentPlaceholder: '(Optional) Enter your comment',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'Not factually correct',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'Not fully following my request',
        },
        {
          value: 'other',
          label: 'Other',
        },
      ],
    },
    button: {
      newChat: 'New Chat',
      botConsole: 'Bot Console',
      sharedBotAnalytics: 'Shared Bot Analytics',
      apiManagement: 'API Management',
      userUsages: 'User Usages',
      SaveAndSubmit: 'Save & Submit',
      resend: 'Resend',
      regenerate: 'Regenerate',
      delete: 'Delete',
      deleteAll: 'Delete All',
      done: 'Done',
      ok: 'OK',
      cancel: 'Cancel',
      back: 'Back',
      menu: 'Menu',
      language: 'Language',
      clearConversation: 'Delete ALL conversations',
      signOut: 'Sign out',
      close: 'Close',
      add: 'Add',
    },
    input: {
      hint: {
        required: '* Required',
      },
      validationError: {
        required: 'This field is required.',
        invalidOriginFormat: 'Invalid Origin format.',
      },
    },
    embeddingSettings: {
      title: 'Embedding Setting',
      description:
        'You can configure the parameters for vector embeddings. By adjusting the parameters, you can change the accuracy of document retrieval.',
      chunkSize: {
        label: 'chunk size',
        hint: 'The chunk size refers to the size at which a document is divided into smaller segments',
      },
      chunkOverlap: {
        label: 'chunk overlap',
        hint: 'You can specify the number of overlapping characters between adjacent chunks.',
      },
      enablePartitionPdf: {
        label:
          'Enable detailed PDF analysis. If enabled, the PDF will be analyzed in detail over time.',
        hint: 'It is effective when you want to improve search accuracy. Computation costs increase because computation takes more time.',
      },
      help: {
        chunkSize:
          "When the chunk size is too small, contextual information can be lost, and when it's too large, different contextual information may exist within the same chunk, potentially reducing search accuracy.",
        chunkOverlap:
          'By specifying chunk overlap, you can preserve contextual information around chunk boundaries. Increasing the chunk size can sometimes improve search accuracy. However, be aware that increasing the chunk overlap can lead to higher computational costs.',
      },
      alert: {
        sync: {
          error: {
            title: 'Sentence Splitte Error',
            body: 'Try again with less chunk overlap value',
          },
        },
      },
    },
    generationConfig: {
      title: 'Generation Config',
      description:
        ' You can configure LLM inference parameters to control the response from the models.',
      maxTokens: {
        label: 'Maximum generation length/maximum new tokens',
        hint: 'The maximum number of tokens allowed in the generated response',
      },
      temperature: {
        label: 'Temperature',
        hint: 'Affects the shape of the probability distribution for the predicted output and influences the likelihood of the model selecting lower-probability outputs',
        help: 'Choose a lower value to influence the model to select higher-probability outputs; Choose a higher value to influence the model to select lower-probability outputs',
      },
      topK: {
        label: 'Top-k',
        hint: 'The number of most-likely candidates that the model considers for the next token',
        help: 'Choose a lower value to decrease the size of the pool and limit the options to more likely outputs; Choose a higher value to increase the size of the pool and allow the model to consider less likely outputs',
      },
      topP: {
        label: 'Top-p',
        hint: 'The percentage of most-likely candidates that the model considers for the next token',
        help: 'Choose a lower value to decrease the size of the pool and limit the options to more likely outputs; Choose a higher value to increase the size of the pool and allow the model to consider less likely outputs',
      },
      stopSequences: {
        label: 'End token/end sequence',
        hint: 'Specify sequences of characters that stop the model from generating further tokens. Use commas to separate multiple words',
      },
    },
    searchSettings: {
      title: 'Search Settings',
      description:
        'You can configure search parameters to fetch relevant documents from vector store.',
      maxResults: {
        label: 'Max Results',
        hint: 'The maximum number of records fetched from vector store',
      },
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
      notSupportedImage: 'The selected model does not support images.',
    },
    validation: {
      title: 'Validation Error',
      maxRange: {
        message: 'The maximum value that can be set is {{size}}',
      },
      minRange: {
        message: 'The minimum value that can be set is {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message: 'Chunk overlap must be set to less than Chunk size',
      },
    },
  },
};

export default translation;
