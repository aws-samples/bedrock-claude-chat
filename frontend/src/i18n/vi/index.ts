const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Đăng nhập',
      },
    },
    app: {
      name: 'Bedrock Chat',
      inputMessage: 'Tôi có thể giúp gì cho bạn?',
      pinnedBots: 'Bot Ghim',
      starredBots: 'Bot Yêu Thích',
      recentlyUsedBots: 'Bot Đã Dùng Gần Đây',
      conversationHistory: 'Lịch sử',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Chỉ dành cho Quản trị',
    },
    model: {
      'claude-v3-haiku': {
        label: 'Claude 3 (Haiku)',
        description:
          'Phiên bản trước được tối ưu hóa cho tốc độ và gọn nhẹ, cho phép phản hồi gần như tức thời.',
      },
      'claude-v3.5-sonnet': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Phiên bản đầu của Claude 3.5. Hỗ trợ nhiều tác vụ, nhưng v2 mang lại độ chính xác được cải thiện.',
      },
      'claude-v3.5-sonnet-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'Phiên bản mới nhất của Claude 3.5. Một mô hình nâng cao dựa trên v1 với độ chính xác và hiệu suất cao hơn.',
      },
      'claude-v3.5-haiku': {
        label: 'Claude 3.5 (Haiku) v1',
        description:
          'Phiên bản mới nhất, phản hồi nhanh hơn và cải tiến khả năng so với Haiku 3.',
      },
      'claude-v4.1-opus': {
        label: 'Claude 4.1 (Opus)',
        description:
          'Mô hình Opus với khả năng lý luận được cải thiện.',
      },
      'claude-v4.5-opus': {
        label: 'Claude 4.5 (Opus)',
        description:
          'Mô hình Opus hiệu suất cao kết hợp khả năng lý luận mạnh mẽ với hiệu suất thực tế.',
      },
      'claude-v4.6-opus': {
        label: 'Claude 4.6 (Opus)',
        description:
          'Mô hình hàng đầu lập kế hoạch cẩn thận hơn, duy trì tác vụ agent lâu hơn và hoạt động đáng tin cậy trong các codebase lớn với cửa sổ ngữ cảnh 1M token.',
      },
      'claude-v4.7-opus': {
        label: 'Claude 4.7 (Opus)',
        description:
          'Mô hình Opus hiệu suất cao được xây dựng cho việc lập trình, quy trình doanh nghiệp và các tác vụ agent dài hạn.',
      },
      'claude-v3-opus': {
        label: 'Claude 3 (Opus)',
        description: 'Mô hình mạnh mẽ cho các tác vụ cực kỳ phức tạp.',
      },
      'mistral-7b-instruct': {
        label: 'Mistral 7B',
        description:
          'Hỗ trợ tạo văn bản tiếng Anh với khả năng mã hóa tự nhiên',
      },
      'mixtral-8x7b-instruct': {
        label: 'Mistral-8x7B',
        description:
          'Mô hình MoE thưa phổ biến, chất lượng cao, lý tưởng cho tóm tắt văn bản, hỏi đáp, phân loại, hoàn thành văn bản và sinh mã.',
      },
      'mistral-large': {
        label: 'Mistral Large',
        description:
          'Phù hợp cho các tác vụ phức tạp đòi hỏi suy luận đáng kể hoặc các tác vụ chuyên biệt như sinh văn bản tổng hợp hoặc sinh mã.',
      },
      'amazon-nova-pro': {
        label: 'Amazon Nova Pro',
        description:
          'Mô hình đa phương tiện rất mạnh mẽ, kết hợp tốt nhất giữa độ chính xác, tốc độ, và chi phí cho nhiều loại tác vụ.',
      },
      'amazon-nova-lite': {
        label: 'Amazon Nova Lite',
        description:
          'Mô hình đa phương tiện chi phí rất thấp, siêu nhanh trong xử lý hình ảnh, video và văn bản.',
      },
      'amazon-nova-micro': {
        label: 'Amazon Nova Micro',
        description:
          'Mô hình chỉ văn bản, cho độ trễ phản hồi thấp nhất trong họ Nova với chi phí rất thấp.',
      },
      'qwen3-235b-a22b-2507': {
        label: 'Qwen3 235B A22B',
        description:
          'Mô hình Mixture-of-Experts 235B tham số với 22B tham số hoạt động, cửa sổ ngữ cảnh 256K và khả năng suy luận để tạo văn bản và mã.',
      },
      'qwen3-coder-30b-a3b': {
        label: 'Qwen3 Coder 30B A3B',
        description:
          'Mô hình Mixture-of-Experts 30B tham số cho viết mã với 3B tham số hoạt động, cửa sổ ngữ cảnh 256K, đầu ra tối đa 16K và khả năng suy luận để tạo mã.',
      },
      'qwen3-32b': {
        label: 'Qwen3 32B',
        description:
          'Mô hình dense 32B tham số với cửa sổ ngữ cảnh 32K, đầu ra tối đa 8K và chế độ suy nghĩ kết hợp để phản hồi nhanh và suy luận sâu.',
      },
    },
    agent: {
      label: 'Tác tử',
      help: {
        overview:
          'Bằng cách sử dụng chức năng Tác tử, chatbot của bạn có thể tự động xử lý các tác vụ phức tạp hơn.',
      },
      hint: `Tác tử tự động quyết định công cụ để sử dụng để trả lời câu hỏi của người dùng. Do cần thời gian để quyết định, thời gian phản hồi thường dài hơn. Kích hoạt một hoặc nhiều công cụ sẽ bật chức năng của Tác tử. Ngược lại, nếu không chọn công cụ nào, chức năng Tác tử sẽ không được sử dụng. Khi chức năng Tác tử được bật, việc sử dụng "Kiến thức" cũng được xem là một trong các công cụ, nghĩa là "Kiến thức" có thể sẽ không được dùng trong phản hồi.`,
      progress: {
        label: 'Đang suy nghĩ...',
      },
      progressCard: {
        toolInput: 'Đầu vào: ',
        toolOutput: 'Đầu ra: ',
        status: {
          running: 'Đang chạy...',
          success: 'Thành công',
          error: 'Lỗi',
        },
      },
      tools: {
        get_weather: {
          name: 'Thời tiết hiện tại',
          description: 'Lấy dự báo thời tiết hiện tại.',
        },
        sql_db_query: {
          name: 'Truy vấn CSDL',
          description:
            'Thực thi một truy vấn SQL chi tiết và chính xác để lấy kết quả từ cơ sở dữ liệu.',
        },
        sql_db_schema: {
          name: 'Lược đồ CSDL',
          description: 'Lấy lược đồ và một số dòng mẫu cho danh sách các bảng.',
        },
        sql_db_list_tables: {
          name: 'Liệt kê bảng CSDL',
          description: 'Liệt kê tất cả các bảng có trong cơ sở dữ liệu.',
        },
        sql_db_query_checker: {
          name: 'Kiểm tra truy vấn',
          description:
            'Kiểm tra xem truy vấn SQL của bạn có chính xác không trước khi thực thi.',
        },
        internet_search: {
          name: 'Tìm kiếm Internet',
          description: 'Tìm kiếm thông tin trên internet.',
        },
        knowledge_base_tool: {
          name: 'Truy xuất Kiến thức',
          description: 'Truy xuất thông tin từ kiến thức.',
        },
      },
    },
    bot: {
      label: {
        myBots: 'Bot của tôi',
        recentlyUsedBots: 'Bot Chia Sẻ Đã Dùng Gần Đây',
        knowledge: 'Kiến thức',
        url: 'URL',
        s3url: 'Nguồn Dữ liệu S3',
        sitemap: 'URL Sitemap',
        file: 'Tệp',
        loadingBot: 'Đang tải...',
        normalChat: 'Trò chuyện',
        notAvailableBot: '[KHÔNG khả dụng]',
        notAvailableBotInputMessage: 'Bot này KHÔNG khả dụng.',
        noDescription: 'Không có mô tả',
        notAvailable: 'Bot này KHÔNG khả dụng.',
        noBots: 'Không có Bot.',
        noBotsRecentlyUsed: 'Không có Bot Chia Sẻ Đã Dùng Gần Đây.',
        retrievingKnowledge: '[Đang truy xuất Kiến thức...]',
        dndFileUpload:
          'Bạn có thể tải lên tệp bằng cách kéo thả.\nCác tệp hỗ trợ: {{fileExtensions}}',
        uploadError: 'Thông báo Lỗi',
        referenceLink: 'Liên kết Tham khảo',
        syncStatus: {
          queue: 'Chờ Đồng bộ',
          running: 'Đang đồng bộ',
          success: 'Đã đồng bộ xong',
          fail: 'Đồng bộ thất bại',
        },
        fileUploadStatus: {
          uploading: 'Đang tải lên...',
          uploaded: 'Đã tải lên',
          error: 'LỖI',
        },
        quickStarter: {
          title: 'Bắt đầu hội thoại nhanh',
          exampleTitle: 'Tiêu đề',
          example: 'Ví dụ Hội thoại',
        },
        citeRetrievedContexts: 'Trích dẫn Ngữ cảnh Truy xuất',
        unsupported: 'Không hỗ trợ, Chỉ đọc',
      },
      titleSubmenu: {
        edit: 'Chỉnh sửa',
        copyLink: 'Sao chép Liên kết',
        copiedLink: 'Đã sao chép',
      },
      help: {
        overview:
          'Bot hoạt động theo hướng dẫn định sẵn. Trò chuyện sẽ không hoạt động như mong muốn trừ khi ngữ cảnh được định nghĩa trong tin nhắn, nhưng với bot, bạn không cần định nghĩa ngữ cảnh.',
        instructions:
          'Định nghĩa cách bot nên hành xử. Nếu đưa ra hướng dẫn mơ hồ, bot có thể hành động không thể đoán. Hãy cung cấp hướng dẫn rõ ràng và cụ thể.',
        knowledge: {
          overview:
            'Bằng cách cung cấp kiến thức bên ngoài cho bot, nó có thể xử lý dữ liệu mà nó chưa được huấn luyện sẵn.',
          url: 'Thông tin từ URL được chỉ định sẽ được sử dụng làm Kiến thức.',
          s3url:
            'Bằng cách nhập URI của S3, bạn có thể thêm S3 làm nguồn dữ liệu. Bạn có thể thêm tối đa 4 nguồn. Chỉ hỗ trợ bucket ở cùng tài khoản và cùng khu vực với khu vực bedrock.',
          sitemap:
            'Bằng cách chỉ định URL của sitemap, thông tin thu thập được thông qua việc tự động quét web trong sitemap sẽ được sử dụng làm Kiến thức.',
          file: 'Các tệp tải lên sẽ được dùng làm Kiến thức.',
          citeRetrievedContexts:
            'Cấu hình việc hiển thị ngữ cảnh được truy xuất để trả lời câu hỏi người dùng dưới dạng thông tin trích dẫn.\nNếu bật, người dùng có thể truy cập URL hoặc tệp nguồn gốc.',
        },
        quickStarter: {
          overview:
            'Khi bắt đầu hội thoại, hãy cung cấp ví dụ. Ví dụ minh họa cách sử dụng bot.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Lỗi Đồng bộ Kiến thức',
            body: 'Đã xảy ra lỗi khi đồng bộ Kiến thức. Vui lòng kiểm tra thông báo sau:',
          },
          incomplete: {
            title: 'CHƯA SẴN SÀNG',
            body: 'Bot này chưa hoàn thành đồng bộ kiến thức, vì vậy đang sử dụng kiến thức trước khi cập nhật.',
          },
        },
      },
      samples: {
        title: 'Mẫu Hướng dẫn',
        anthropicLibrary: {
          title: 'Thư viện Prompt Anthropic',
          sentence: 'Bạn cần thêm ví dụ? Tham khảo: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Trợ lý Lập trình Python',
          prompt: `Viết một đoạn mã python ngắn và chất lượng cao cho tác vụ được đưa ra, giống như một chuyên gia Python rất tài năng sẽ viết. Bạn đang viết mã cho một lập trình viên có kinh nghiệm, nên chỉ thêm chú thích cho những điều không rõ ràng. Đảm bảo thêm bất kỳ import nào cần thiết. 
KHÔNG bao giờ viết gì trước khối \`\`\`python\`\`\`. Sau khi bạn tạo mã xong và sau khối \`\`\`python\`\`\`, hãy kiểm tra cẩn thận để đảm bảo không có lỗi, sai sót hoặc không nhất quán. Nếu có lỗi, liệt kê những lỗi đó trong thẻ <error>, sau đó tạo phiên bản mới đã sửa lỗi. Nếu không có lỗi, viết "CHECKED: NO ERRORS" trong thẻ <error>.`,
        },
        mailCategorizer: {
          title: 'Phân Loại Email',
          prompt: `Bạn là một nhân viên chăm sóc khách hàng, nhiệm vụ là phân loại email theo loại. Vui lòng đưa ra câu trả lời và giải thích lý do phân loại.

Các loại phân loại là: 
(A) Câu hỏi trước mua hàng 
(B) Sản phẩm hỏng hoặc bị lỗi 
(C) Câu hỏi về thanh toán 
(D) Khác (vui lòng giải thích)

Bạn sẽ phân loại email này như thế nào?`,
        },
        fitnessCoach: {
          title: 'Huấn Luyện Viên Thể Hình Cá Nhân',
          prompt: `Bạn là một huấn luyện viên thể hình vui vẻ, nhiệt tình tên Sam. Sam đam mê giúp khách hàng trở nên khỏe mạnh hơn và sống lành mạnh. Bạn viết với giọng khuyến khích và thân thiện, luôn cố gắng hướng dẫn khách hàng đến mục tiêu thể chất tốt hơn. Nếu người dùng hỏi về chủ đề không liên quan đến thể hình, hoặc chuyển hướng chủ đề về thể hình, hoặc nói rằng bạn không thể trả lời.`,
        },
      },
      create: {
        pageTitle: 'Tạo Bot của Tôi',
      },
      edit: {
        pageTitle: 'Chỉnh sửa Bot của Tôi',
      },
      item: {
        title: 'Tên',
        description: 'Mô tả',
        instruction: 'Hướng dẫn',
      },
      explore: {
        label: {
          pageTitle: 'Bảng điều khiển Bot',
        },
      },
      apiSettings: {
        pageTitle: 'Cài đặt API Công bố Bot Chia Sẻ',
        label: {
          endpoint: 'Điểm cuối API',
          usagePlan: 'Kế hoạch Sử dụng',
          allowOrigins: 'Các Nguồn được Phép',
          apiKeys: 'Khóa API',
          period: {
            day: 'Mỗi NGÀY',
            week: 'Mỗi TUẦN',
            month: 'Mỗi THÁNG',
          },
          apiKeyDetail: {
            creationDate: 'Ngày tạo',
            active: 'Kích hoạt',
            inactive: 'Không kích hoạt',
            key: 'Khóa API',
          },
        },
        item: {
          throttling: 'Giới hạn tốc độ',
          burstLimit: 'Bùng nổ',
          rateLimit: 'Tốc độ',
          quota: 'Hạn mức',
          requestLimit: 'Số yêu cầu',
          offset: 'Độ trễ',
        },
        help: {
          overview:
            'Tạo một API cho phép chức năng của Bot được truy cập bởi các khách hàng bên ngoài; API cho phép tích hợp với ứng dụng bên ngoài.',
          endpoint: 'Khách hàng có thể sử dụng Bot từ điểm cuối API này.',
          usagePlan:
            'Kế hoạch sử dụng quy định số lượng hoặc tốc độ yêu cầu mà API của bạn chấp nhận từ một khách hàng. Liên kết một API với một kế hoạch sử dụng để theo dõi các yêu cầu.',
          throttling: 'Giới hạn tốc độ gọi API từ người dùng.',
          rateLimit:
            'Nhập tốc độ, tính bằng yêu cầu/giây, mà khách hàng có thể gọi API.',
          burstLimit:
            'Nhập số yêu cầu đồng thời mà khách hàng có thể thực hiện đến API.',
          quota:
            'Bật hạn mức để giới hạn số yêu cầu mà người dùng có thể thực hiện đến API trong một khoảng thời gian.',
          requestLimit:
            'Nhập tổng số yêu cầu mà người dùng có thể thực hiện trong khoảng thời gian bạn chọn trong danh sách.',
          allowOrigins:
            'Nguồn gốc được phép truy cập. Nếu nguồn không được cho phép, người gọi sẽ nhận mã 403 Forbidden và bị từ chối.',
          allowOriginsExample:
            'vd: https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
          apiKeys:
            'Khóa API là chuỗi chữ và số dùng để nhận diện một khách hàng API. Nếu không có, người gọi nhận 403 Forbidden và bị từ chối.',
        },
        button: {
          ApiKeyShow: 'Hiện',
          ApiKeyHide: 'Ẩn',
        },
        alert: {
          botUnshared: {
            title: 'Vui lòng Chia Sẻ Bot',
            body: 'Bạn không thể công bố API cho bot chưa được chia sẻ.',
          },
          deploying: {
            title: 'Đang TRIỂN KHAI API',
            body: 'Vui lòng đợi đến khi triển khai xong.',
          },
          deployed: {
            title: 'API đã được TRIỂN KHAI',
            body: 'Bạn có thể truy cập API từ phía Khách hàng bằng Điểm cuối API và Khóa API.',
          },
          deployError: {
            title: 'Không THỂ triển khai API',
            body: 'Vui lòng xóa API và tạo lại.',
          },
        },
        deleteApiDaialog: {
          title: 'Xóa?',
          content:
            'Bạn có chắc muốn xóa API không? Điểm cuối API sẽ bị xóa, và khách hàng sẽ không thể truy cập nữa.',
        },
        addApiKeyDialog: {
          title: 'Thêm Khóa API',
          content: 'Nhập tên để nhận diện Khóa API.',
        },
        deleteApiKeyDialog: {
          title: 'Xóa?',
          content:
            'Bạn có chắc muốn xóa <Bold>{{title}}</Bold>?\nKhách hàng dùng khóa API này sẽ bị từ chối truy cập API.',
        },
      },
      button: {
        newBot: 'Tạo Bot Mới',
        create: 'Tạo',
        edit: 'Chỉnh sửa',
        delete: 'Xóa',
        share: 'Chia sẻ',
        apiSettings: 'Cài đặt Công bố API',
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        instructionsSamples: 'Mẫu',
        chooseFiles: 'Chọn tệp',
      },
      deleteDialog: {
        title: 'Xóa?',
        content: 'Bạn có chắc muốn xóa <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Chia sẻ',
        off: {
          content:
            'Chia sẻ liên kết đang tắt, chỉ bạn có thể truy cập bot này qua URL của nó.',
        },
        on: {
          content:
            'Chia sẻ liên kết đang bật, TẤT CẢ người dùng có thể sử dụng liên kết này để trò chuyện.',
        },
      },
      error: {
        notSupportedFile: 'Tệp này không được hỗ trợ.',
        duplicatedFile: 'Tệp có cùng tên đã được tải lên.',
        failDeleteApi: 'Xóa API thất bại.',
      },
      activeModels: {
        title: 'Kích hoạt Mô hình',
        description: 'Cấu hình mô hình AI nào có thể được sử dụng với bot này.',
      },
    },
    admin: {
      botAnalytics: {
        label: {
          pageTitle: 'Phân tích Bot',
          noBotUsages:
            'Trong Thời gian Tính toán, không có bot nào được sử dụng.',
          published: 'API đã được công bố.',
          SearchCondition: {
            title: 'Thời gian Tính toán',
            from: 'Từ',
            to: 'Đến',
          },
          sortByCost: 'Sắp xếp theo Chi phí',
        },
        help: {
          overview:
            'Theo dõi tình trạng sử dụng của các Bot Chia Sẻ và API Bot được công bố.',
          calculationPeriod:
            'Nếu không đặt Thời gian Tính toán, chi phí hôm nay sẽ được hiển thị.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'Quản lý API',
          publishedDate: 'Ngày công bố',
          noApi: 'Không có API nào.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Quản lý Bot',
          sharedUrl: 'URL Bot Chia Sẻ',
          apiSettings: 'Cài đặt Công bố API',
          noKnowledge: 'Bot này không có Kiến thức.',
          notPublishApi: 'API của bot này chưa được công bố.',
          deployStatus: 'Trạng thái Triển khai',
          cfnStatus: 'Trạng thái CloudFormation',
          codebuildStatus: 'Trạng thái CodeBuild',
          codeBuildId: 'ID CodeBuild',
          usagePlanOn: 'BẬT',
          usagePlanOff: 'TẮT',
          rateLimit:
            '<Bold>{{limit}}</Bold> yêu cầu/giây mà khách hàng có thể gọi API.',
          burstLimit:
            'Khách hàng có thể thực hiện <Bold>{{limit}}</Bold> yêu cầu đồng thời.',
          requestsLimit:
            'Bạn có thể thực hiện <Bold>{{limit}}</Bold> yêu cầu <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'Không có Khóa API',
            body: 'Tất cả khách hàng đều không thể truy cập API.',
          },
        },
        button: {
          deleteApi: 'Xóa API',
        },
      },
      validationError: {
        period: 'Nhập cả Từ và Đến',
      },
    },
    deleteDialog: {
      title: 'Xóa?',
      content: 'Bạn có chắc muốn xóa <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Xóa TẤT CẢ?',
      content: 'Bạn có chắc muốn xóa TẤT CẢ hội thoại?',
    },
    languageDialog: {
      title: 'Chuyển ngôn ngữ',
    },
    feedbackDialog: {
      title: 'Phản hồi',
      content: 'Vui lòng cung cấp chi tiết hơn.',
      categoryLabel: 'Danh mục',
      commentLabel: 'Bình luận',
      commentPlaceholder: '(Tùy chọn) Nhập bình luận của bạn',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'Không chính xác về mặt thông tin',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'Không hoàn toàn theo yêu cầu của tôi',
        },
        {
          value: 'other',
          label: 'Khác',
        },
      ],
    },
    button: {
      newChat: 'Trò chuyện Mới',
      botConsole: 'Bảng điều khiển Bot',
      botAnalytics: 'Phân tích Bot',
      apiManagement: 'Quản lý API',
      userUsages: 'Lượt Sử dụng của Người dùng',
      SaveAndSubmit: 'Lưu & Gửi',
      resend: 'Gửi lại',
      regenerate: 'Tạo lại',
      delete: 'Xóa',
      deleteAll: 'Xóa Tất cả',
      done: 'Hoàn thành',
      ok: 'OK',
      cancel: 'Hủy',
      back: 'Quay lại',
      menu: 'Menu',
      language: 'Ngôn ngữ',
      clearConversation: 'Xóa TẤT CẢ hội thoại',
      signOut: 'Đăng xuất',
      close: 'Đóng',
      add: 'Thêm',
      continue: 'Tiếp tục tạo',
    },
    input: {
      hint: {
        required: '* Bắt buộc',
      },
      validationError: {
        required: 'Trường này là bắt buộc.',
        invalidOriginFormat: 'Định dạng Origin không hợp lệ.',
      },
    },
    embeddingSettings: {
      title: 'Cài đặt Embedding',
      description:
        'Bạn có thể cấu hình tham số cho việc tạo vector embedding. Bằng cách điều chỉnh các tham số, bạn có thể thay đổi độ chính xác của việc truy xuất tài liệu.',
      chunkSize: {
        label: 'kích thước chunk',
        hint: 'Kích thước chunk là số lượng ký tự chia tài liệu thành các đoạn nhỏ hơn',
      },
      chunkOverlap: {
        label: 'phần chồng lấp chunk',
        hint: 'Bạn có thể chỉ định số lượng ký tự chồng lấp giữa các chunk liền kề.',
      },
      enablePartitionPdf: {
        label:
          'Bật phân tích PDF chi tiết. Nếu bật, PDF sẽ được phân tích kỹ hơn trong thời gian dài.',
        hint: 'Hữu ích khi bạn muốn cải thiện độ chính xác tìm kiếm. Chi phí tính toán tăng do tốn nhiều thời gian hơn.',
      },
      help: {
        chunkSize:
          'Khi kích thước chunk quá nhỏ, thông tin ngữ cảnh có thể bị mất, còn quá lớn, nhiều thông tin ngữ cảnh khác nhau có thể nằm trong cùng một chunk, làm giảm độ chính xác tìm kiếm.',
        chunkOverlap:
          'Bằng cách chỉ định chồng lấp chunk, bạn có thể giữ lại thông tin ngữ cảnh quanh biên chunk. Tăng chồng lấp có thể cải thiện độ chính xác, nhưng cũng làm tăng chi phí tính toán.',
        overlapTokens:
          'Bạn có thể cấu hình số token để chồng lấp, hoặc lặp lại giữa các chunk liền kề. Ví dụ, nếu bạn đặt overlap tokens là 60, 60 token cuối trong chunk thứ nhất cũng xuất hiện ở đầu chunk thứ hai.',
        maxParentTokenSize:
          'Bạn có thể định nghĩa kích thước chunk cha. Khi truy xuất, hệ thống ban đầu truy xuất các chunk con, nhưng thay thế bằng các chunk cha rộng hơn để cung cấp ngữ cảnh đầy đủ hơn.',
        maxChildTokenSize:
          'Bạn có thể định nghĩa kích thước chunk con. Khi truy xuất, ban đầu hệ thống truy xuất các chunk con, sau đó thay thế bằng chunk cha rộng hơn để cung cấp ngữ cảnh đầy đủ hơn.',
        bufferSize:
          'Tham số này có thể ảnh hưởng đến lượng văn bản được xem xét cùng nhau để xác định ranh giới mỗi chunk, ảnh hưởng đến mức độ chi tiết và mạch lạc của chunk. Kích thước bộ đệm lớn có thể nắm bắt nhiều ngữ cảnh hơn nhưng dễ gây nhiễu.',
        breakpointPercentileThreshold:
          'Ngưỡng phần trăm cao hơn yêu cầu câu phải khác biệt hơn mới tách thành chunk mới. Ngưỡng cao hơn dẫn đến ít chunk hơn và kích thước chunk trung bình lớn hơn.',
      },
      alert: {
        sync: {
          error: {
            title: 'Lỗi Tách Câu',
            body: 'Hãy thử lại với giá trị phần chồng lấp chunk nhỏ hơn',
          },
        },
      },
    },
    generationConfig: {
      title: 'Cấu hình Tạo văn bản',
      description:
        'Bạn có thể cấu hình tham số suy luận LLM để kiểm soát phản hồi từ mô hình.',
      maxTokens: {
        label: 'Độ dài tạo tối đa/tối đa token mới',
        hint: 'Số lượng token tối đa cho phép trong phản hồi được tạo ra',
      },
      temperature: {
        label: 'Nhiệt độ',
        hint: 'Ảnh hưởng đến phân bố xác suất cho đầu ra dự đoán và khả năng mô hình chọn đầu ra xác suất thấp hơn',
        help: 'Chọn giá trị thấp để mô hình chọn đầu ra xác suất cao; Chọn giá trị cao để mô hình xem xét cả đầu ra xác suất thấp hơn',
      },
      topK: {
        label: 'Top-k',
        hint: 'Số lượng ứng viên có khả năng cao nhất mà mô hình xem xét cho token tiếp theo',
        help: 'Chọn giá trị thấp để thu hẹp phạm vi, chỉ xem xét đầu ra khả năng cao; Chọn giá trị cao để mở rộng phạm vi và xem xét cả các đầu ra ít khả năng hơn',
      },
      topP: {
        label: 'Top-p',
        hint: 'Tỷ lệ phần trăm các ứng viên có khả năng cao nhất mà mô hình xem xét cho token tiếp theo',
        help: 'Chọn giá trị thấp để giảm kích thước tập lựa chọn và chỉ xem xét đầu ra khả năng cao; Chọn giá trị cao để mở rộng tập và xem xét cả đầu ra ít khả năng hơn',
      },
      stopSequences: {
        label: 'Token dừng/chuỗi kết thúc',
        hint: 'Chỉ định các chuỗi ký tự dừng mô hình tạo thêm token. Dùng dấu phẩy để tách nhiều từ',
      },
    },
    searchSettings: {
      title: 'Cài đặt Tìm kiếm',
      description:
        'Bạn có thể cấu hình tham số tìm kiếm để lấy tài liệu liên quan từ kho vector.',
      maxResults: {
        label: 'Kết quả tối đa',
        hint: 'Số lượng bản ghi tối đa được lấy từ kho vector',
      },
      searchType: {
        label: 'Loại Tìm kiếm',
        hybrid: {
          label: 'Tìm kiếm lai',
          hint: 'Kết hợp điểm liên quan từ tìm kiếm ngữ nghĩa và tìm kiếm từ khóa để cho độ chính xác cao hơn.',
        },
        semantic: {
          label: 'Tìm kiếm ngữ nghĩa',
          hint: 'Dùng vector embeddings để trả về kết quả liên quan.',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'Cài đặt Chi tiết Kiến thức',
      description:
        'Chọn mô hình embedding để cấu hình kiến thức, và đặt phương pháp chia nhỏ tài liệu thêm vào. Các cài đặt này không thể thay đổi sau khi tạo bot.',
      embeddingModel: {
        label: 'Mô hình Embeddings',
        titan_v2: {
          label: 'Titan Embedding Text v2',
        },
        cohere_multilingual_v3: {
          label: 'Embed Multilingual v3',
        },
      },
      chunkingStrategy: {
        label: 'Chiến lược chia nhỏ',
        default: {
          label: 'Chia nhỏ mặc định',
          hint: 'Tự động chia văn bản thành các đoạn khoảng 300 token. Nếu tài liệu ít hơn hoặc đã 300 token, sẽ không chia thêm.',
        },
        fixed_size: {
          label: 'Chia nhỏ kích thước cố định',
          hint: 'Chia văn bản thành kích thước token xấp xỉ mà bạn đặt.',
        },
        hierarchical: {
          label: 'Chia nhỏ phân cấp',
          hint: 'Chia văn bản thành cấu trúc phân cấp của chunk con và chunk cha.',
        },
        semantic: {
          label: 'Chia nhỏ theo ngữ nghĩa',
          hint: 'Chia văn bản thành các đoạn có ý nghĩa để tăng cường hiểu và truy xuất thông tin.',
        },
        none: {
          label: 'Không chia nhỏ',
          hint: 'Tài liệu sẽ không được chia nhỏ.',
        },
      },
      chunkingMaxTokens: {
        label: 'Tối đa Token',
        hint: 'Số token tối đa mỗi chunk',
      },
      chunkingOverlapPercentage: {
        label: 'Tỷ lệ chồng lấp giữa các Chunk',
        hint: 'Phần chồng lấp chunk cha phụ thuộc vào kích thước token con và phần trăm chồng lấp con mà bạn chỉ định.',
      },
      overlapTokens: {
        label: 'Token chồng lấp',
        hint: 'Số lượng token lặp lại giữa các chunk trong cùng một tầng',
      },
      maxParentTokenSize: {
        label: 'Tối đa Token Chunk Cha',
        hint: 'Số token tối đa một chunk cha có thể chứa',
      },
      maxChildTokenSize: {
        label: 'Tối đa Token Chunk Con',
        hint: 'Số token tối đa một chunk con có thể chứa',
      },
      bufferSize: {
        label: 'Kích thước Bộ đệm',
        hint: 'Số câu xung quanh được thêm vào để tạo embeddings. Bộ đệm = 1 thì sẽ gộp 3 câu (hiện tại, trước và sau) để nhúng.',
      },
      breakpointPercentileThreshold: {
        label: 'Ngưỡng phần trăm ngắt câu',
        hint: 'Ngưỡng phần trăm khoảng cách/dissimilarity câu để tạo điểm ngắt giữa các câu.',
      },
      opensearchAnalyzer: {
        label: 'Bộ phân tích (Tokenization, Chuẩn hóa)',
        hint: 'Bạn có thể chỉ định bộ phân tích để tách và chuẩn hóa tài liệu đăng ký làm kiến thức. Chọn bộ phân tích phù hợp sẽ cải thiện độ chính xác tìm kiếm. Hãy chọn bộ phân tích tối ưu cho ngôn ngữ kiến thức của bạn.',
        icu: {
          label: 'Bộ phân tích ICU',
          hint: 'Để tokenization, sử dụng {{tokenizer}}, và cho chuẩn hóa, sử dụng {{normalizer}}.',
        },
        kuromoji: {
          label: 'Bộ phân tích tiếng Nhật (kuromoji)',
          hint: 'Để tokenization, sử dụng {{tokenizer}}, và cho chuẩn hóa, sử dụng {{normalizer}}.',
        },
        none: {
          label: 'Bộ phân tích mặc định hệ thống',
          hint: 'Sử dụng bộ phân tích mặc định do hệ thống (OpenSearch) định nghĩa.',
        },
        tokenizer: 'Tokenizer:',
        normalizer: 'Normalizer:',
        token_filter: 'Bộ lọc token:',
        not_specified: 'Không chỉ định',
      },
      advancedParsing: {
        label: 'Phân tích Nâng cao',
        description:
          'Chọn mô hình để sử dụng cho khả năng phân tích tài liệu nâng cao.',
        hint: 'Phù hợp cho việc phân tích nhiều hơn văn bản chuẩn trong các định dạng tài liệu được hỗ trợ, bao gồm cả bảng trong PDF với cấu trúc của chúng. Tốn chi phí thêm khi sử dụng AI sinh để phân tích.',
      },
      parsingModel: {
        label: 'Mô hình Phân tích Nâng cao',
        none: {
          label: 'Tắt',
          hint: 'Không áp dụng phân tích nâng cao.',
        },
        claude_3_5_sonnet_v1: {
          label: 'Claude 3.5 Sonnet v1',
          hint: 'Sử dụng Claude 3.5 Sonnet v1 cho phân tích tài liệu nâng cao.',
        },
        claude_3_haiku_v1: {
          label: 'Claude 3 Haiku v1',
          hint: 'Sử dụng Claude 3 Haiku v1 cho phân tích tài liệu nâng cao.',
        },
      },
      webCrawlerConfig: {
        title: 'Cấu hình Web Crawler',
        crawlingScope: {
          label: 'Phạm vi Thu thập Dữ liệu',
          default: {
            label: 'Mặc định',
            hint: 'Giới hạn thu thập dữ liệu các trang web cùng host và cùng đường dẫn URL ban đầu. Ví dụ, với seed URL "https://aws.amazon.com/bedrock/" thì chỉ thu thập trong đường dẫn này và các trang web mở rộng từ nó như "https://aws.amazon.com/bedrock/agents/". URL cùng domain khác như "https://aws.amazon.com/ec2/" sẽ không bị thu thập.',
          },
          subdomains: {
            label: 'Tên miền phụ',
            hint: 'Bao gồm thu thập dữ liệu bất kỳ trang web nào có cùng tên miền chính với seed URL. Ví dụ, seed URL "https://aws.amazon.com/bedrock/" thì trang "https://www.amazon.com" cũng được thu thập.',
          },
          hostOnly: {
            label: 'Chỉ host',
            hint: 'Giới hạn thu thập dữ liệu các trang web cùng host. Ví dụ, với seed URL "https://aws.amazon.com/bedrock/", thì trang "https://aws.amazon.com/ec2" cũng sẽ được thu thập.',
          },
        },
        includePatterns: {
          label: 'Mẫu Bao gồm',
          hint: 'Chỉ định mẫu để bao gồm khi thu thập. Chỉ các URL khớp mẫu này mới được thu thập.',
        },
        excludePatterns: {
          label: 'Mẫu Loại trừ',
          hint: 'Chỉ định mẫu để loại trừ. Các URL khớp mẫu này sẽ không được thu thập.',
        },
      },
    },
    error: {
      answerResponse: 'Đã xảy ra lỗi khi phản hồi.',
      notFoundConversation:
        'Do cuộc trò chuyện được chỉ định không tồn tại, màn hình trò chuyện mới sẽ được hiển thị.',
      notFoundPage: 'Trang bạn tìm kiếm không được tìm thấy.',
      unexpectedError: {
        title: 'Đã xảy ra lỗi không mong muốn.',
        restore: 'Đi đến trang TOP',
      },
      predict: {
        general: 'Đã xảy ra lỗi khi dự đoán.',
        invalidResponse:
          'Phản hồi nhận được không mong đợi. Định dạng phản hồi không khớp với định dạng dự kiến.',
      },
      notSupportedImage: 'Mô hình đã chọn không hỗ trợ hình ảnh.',
      unsupportedFileFormat: 'Định dạng tệp đã chọn không được hỗ trợ.',
      totalFileSizeToSendExceeded:
        'Tổng kích thước tệp không được vượt quá {{maxSize}}.',
      attachment: {
        fileSizeExceeded: 'Mỗi tệp không được vượt quá {{maxSize}}.',
        fileCountExceeded: 'Không thể tải lên quá {{maxCount}} tệp.',
      },
    },
    validation: {
      title: 'Lỗi Xác thực',
      maxRange: {
        message: 'Giá trị tối đa có thể đặt là {{size}}',
      },
      minRange: {
        message: 'Giá trị tối thiểu có thể đặt là {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message: 'Phần chồng lấp chunk phải nhỏ hơn kích thước chunk',
      },
      parentTokenRange: {
        message: 'Kích thước token cha phải lớn hơn kích thước token con',
      },
      quickStarter: {
        message: 'Vui lòng nhập cả Tiêu đề và Ví dụ Hội thoại.',
      },
    },
    helper: {
      shortcuts: {
        title: 'Phím tắt',
        items: {
          focusInput: 'Chuyển tiêu điểm vào ô nhập trò chuyện',
          newChat: 'Mở cuộc trò chuyện mới',
        },
      },
    },
    guardrails: {
      title: 'Guardrails',
      label: 'Bật Guardrails cho Amazon Bedrock',
      hint: 'Guardrails cho Amazon Bedrock dùng để thực hiện các biện pháp bảo vệ dựa trên trường hợp sử dụng và chính sách AI có trách nhiệm của bạn.',
      harmfulCategories: {
        label: 'Danh mục gây hại',
        hint: 'Cấu hình bộ lọc nội dung bằng cách điều chỉnh mức độ lọc để phát hiện và chặn đầu vào, phản hồi mô hình vi phạm chính sách sử dụng của bạn. 0: tắt, 1: thấp, 2: trung bình, 3: cao',
        hate: {
          label: 'Ngôn từ thù ghét',
          hint: 'Mô tả đầu vào và phản hồi mô hình phân biệt, chỉ trích, xúc phạm, hay hạ thấp một người hoặc nhóm người dựa trên đặc điểm (chủng tộc, dân tộc, giới tính, tôn giáo, xu hướng tính dục, khả năng, quốc tịch). 0: tắt, 1: thấp, 2: trung bình, 3: cao',
        },
        insults: {
          label: 'Xúc phạm',
          hint: 'Mô tả đầu vào và phản hồi mô hình bao gồm ngôn từ làm giảm giá trị, làm nhục, chế giễu, xúc phạm hay hạ thấp người khác. Loại ngôn ngữ này cũng gọi là bắt nạt. 0: tắt, 1: thấp, 2: trung bình, 3: cao',
        },
        sexual: {
          label: 'Tình dục',
          hint: 'Mô tả đầu vào và phản hồi mô hình thể hiện sự quan tâm, hoạt động tình dục, hoặc kích thích thông qua tham chiếu trực tiếp hoặc gián tiếp đến bộ phận cơ thể, đặc điểm thể chất, hoặc tình dục. 0: tắt, 1: thấp, 2: trung bình, 3: cao',
        },
        violence: {
          label: 'Bạo lực',
          hint: 'Mô tả đầu vào và phản hồi mô hình ca ngợi hoặc đe dọa gây đau đớn, tổn thương vật lý cho một người, nhóm hoặc vật. 0: tắt, 1: thấp, 2: trung bình, 3: cao',
        },
        misconduct: {
          label: 'Hành vi sai trái',
          hint: 'Mô tả đầu vào và phản hồi mô hình tìm kiếm hoặc cung cấp thông tin về việc tham gia vào hành vi sai trái, hoặc gây hại, lừa đảo, lợi dụng một người, nhóm hoặc tổ chức. 0: tắt, 1: thấp, 2: trung bình, 3: cao',
        },
      },
      contextualGroundingCheck: {
        label: 'Kiểm tra Định hướng Ngữ cảnh',
        hint: 'Dùng chính sách này để xác thực xem phản hồi mô hình có căn cứ vào nguồn tham chiếu và liên quan đến truy vấn người dùng hay không, nhằm lọc bỏ thông tin "hallucination" của mô hình.',
        groundingThreshold: {
          label: 'Căn cứ',
          hint: 'Xác nhận xem phản hồi mô hình có căn cứ và chính xác dựa trên thông tin trong nguồn tham chiếu hay không, và chặn phản hồi dưới ngưỡng căn cứ đã định. 0: không chặn, 1: chặn gần như tất cả',
        },
        relevanceThreshold: {
          label: 'Mức liên quan',
          hint: 'Xác nhận xem phản hồi mô hình có liên quan đến truy vấn người dùng không, và chặn phản hồi dưới ngưỡng liên quan đã định. 0: không chặn, 1: chặn gần như tất cả',
        },
      },
    },
  },
};

export default translation;
