const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Login',
      },
    },
    app: {
      name: 'Bedrock Chat',
      inputMessage: 'Como posso te ajudar?',
      pinnedBots: 'Bots Fixados',
      starredBots: 'Bots Favoritos',
      recentlyUsedBots: 'Bots Usados Recentemente',
      conversationHistory: 'Conversas Recentes',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Painel de Administração',
      backChat: 'Voltar para o Chat',
      userGroups: 'Grupos de Usuários',
    },
    model: {
      'claude-v3-haiku': {
        label: 'Claude 3 (Haiku)',
        description:
          'Versão anterior otimizada para velocidade e compactação, proporcionando resposta quase instantânea.',
      },
      'claude-v3.5-sonnet': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Uma versão anterior do Claude 3.5. Suporta uma ampla variedade de tarefas, mas a v2 oferece maior precisão.',
      },
      'claude-v3.5-sonnet-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'A versão mais recente do Claude 3.5. Um modelo aprimorado que melhora a v1 com maior precisão e desempenho.',
      },
      'claude-v3.7-sonnet': {
        label: 'Claude 3.7 Sonnet',
        description:
          'Modelo de raciocínio híbrido que equilibra respostas rápidas e capacidades analíticas profundas.',
      },
      'claude-v3.5-haiku': {
        label: 'Claude 3.5 (Haiku) v1',
        description:
          'A versão mais recente, oferecendo respostas ainda mais rápidas e capacidades aprimoradas em relação ao Haiku 3.',
      },
      'claude-v4.1-opus': {
        label: 'Claude 4.1 (Opus)',
        description:
          'Modelo Opus com capacidades de raciocínio aprimoradas.',
      },
      'claude-v4.5-opus': {
        label: 'Claude 4.5 (Opus)',
        description:
          'Modelo Opus de alta capacidade que combina raciocínio robusto com desempenho prático.',
      },
      'claude-v4.6-opus': {
        label: 'Claude 4.6 (Opus)',
        description:
          'Modelo principal que planeja com mais cuidado, sustenta tarefas de agente por mais tempo e opera de forma confiável em grandes bases de código com janela de contexto de 1M de tokens.',
      },
      'claude-v4.7-opus': {
        label: 'Claude 4.7 (Opus)',
        description:
          'Modelo Opus de alta capacidade criado para codificação, fluxos de trabalho empresariais e tarefas de agente de longa duração.',
      },
      'claude-v3-opus': {
        label: 'Claude 3 (Opus)',
        description: 'Modelo poderoso para tarefas altamente complexas.',
      },
      'mistral-7b-instruct': {
        label: 'Mistral 7B',
        description:
          'Suporta tarefas de geração de texto em inglês com capacidades naturais de codificação',
      },
      'mixtral-8x7b-instruct': {
        label: 'Mistral-8x7B',
        description:
          'Um modelo popular e de alta qualidade, esparso de Mistura de Especialistas (MoE), ideal para resumo de texto, perguntas e respostas, classificação de texto, conclusão de texto e geração de código.',
      },
      'mistral-large': {
        label: 'Mistral Large',
        description:
          'Ideal para tarefas complexas que exigem capacidades substanciais de raciocínio ou que são altamente especializadas, como Geração de Texto Sintético ou Geração de Código.',
      },
      'mistral-large-2': {
        label: 'Mistral Large2',
        description:
          'LLM avançado que suporta dezenas de idiomas e mais de 80 linguagens de codificação, com capacidades agentivas de classe superior, incluindo chamada de função nativa, saída JSON e raciocínio.',
      },
      'amazon-nova-pro': {
        label: 'Amazon Nova Pro',
        description:
          'Um modelo multimodal altamente capaz com a melhor combinação de precisão, velocidade e custo para uma ampla variedade de tarefas.',
      },
      'amazon-nova-lite': {
        label: 'Amazon Nova Lite',
        description:
          'Um modelo multimodal de custo muito baixo que é extremamente rápido para processar entradas de imagem, vídeo e texto.',
      },
      'amazon-nova-micro': {
        label: 'Amazon Nova Micro',
        description:
          'Um modelo somente de texto que oferece as respostas com menor latência na família de modelos Amazon Nova a um custo muito baixo.',
      },
      'deepseek-r1': {
        label: 'DeepSeek R1',
        description:
          'Modelo de raciocínio state-of-the-art otimizado para raciocínio geral, matemática, ciência e geração de código. Suporta os idiomas inglês e chinês.',
      },
      // Modelos Meta Llama 3
      'llama3-3-70b-instruct': {
        label: 'Meta Llama 3.3 70B Instruct',
        description:
          'O modelo Llama 3 mais recente, oferecendo desempenho comparável ao modelo 405B a um custo menor, com excelentes capacidades de raciocínio e seguimento de instruções.',
      },
      'llama3-2-1b-instruct': {
        label: 'Meta Llama 3.2 1B Instruct',
        description:
          'Modelo leve otimizado para dispositivos de borda com processamento eficiente no dispositivo para gerenciamento de informações pessoais e recuperação de conhecimento multilíngue.',
      },
      'llama3-2-3b-instruct': {
        label: 'Meta Llama 3.2 3B Instruct',
        description:
          'Modelo compacto que oferece geração de texto, resumo e análise de sentimento com baixa latência, ideal para aplicações de IA móvel.',
      },
      'llama3-2-11b-instruct': {
        label: 'Meta Llama 3.2 11B Instruct',
        description:
          'Modelo multimodal que se destaca na compreensão de imagens e raciocínio visual para legendagem de imagens, resposta a perguntas visuais e processamento de documentos.',
      },
      'llama3-2-90b-instruct': {
        label: 'Meta Llama 3.2 90B Instruct',
        description:
          'Modelo multimodal grande com capacidades avançadas de compreensão de imagens e raciocínio visual para aplicações sofisticadas de inteligência visual.',
      },
      'qwen3-235b-a22b-2507': {
        label: 'Qwen3 235B A22B',
        description:
          'Modelo Mixture-of-Experts de 235B parâmetros com 22B parâmetros ativos, janela de contexto de 256K e capacidades de raciocínio para geração de texto e código.',
      },
      'qwen3-coder-30b-a3b': {
        label: 'Qwen3 Coder 30B A3B',
        description:
          'Modelo Mixture-of-Experts de 30B parâmetros para codificação com 3B parâmetros ativos, janela de contexto de 256K, saída máxima de 16K e raciocínio para geração de código.',
      },
    },
    agent: {
      label: 'Agente',
      help: {
        overview:
          'Ao usar a funcionalidade de Agente, seu chatbot pode lidar automaticamente com tarefas mais complexas. O modelo deve ser compatível com o uso de Ferramentas. Verifique <Link>aqui</Link> para detalhes.',
      },
      hint: `O agente determina automaticamente quais ferramentas usar para responder às perguntas do usuário. Devido ao tempo necessário para a decisão, o tempo de resposta tende a ser maior. Ativar uma ou mais ferramentas habilita a funcionalidade do agente. Por outro lado, se nenhuma ferramenta for selecionada, a funcionalidade do agente não será utilizada. Quando a funcionalidade do agente está habilitada, o uso de "Conhecimento" também é tratado como uma das ferramentas. Isso significa que "Conhecimento" pode não ser usado nas respostas.`,
      progress: {
        label: 'Pensando...',
      },
      progressCard: {
        toolInput: 'Entrada: ',
        toolOutput: 'Saída: ',
        status: {
          running: 'Executando...',
          success: 'Sucesso',
          error: 'Erro',
        },
      },
      tools: {
        get_weather: {
          name: 'Previsão do Tempo Atual',
          description: 'Obtenha a previsão do tempo atual.',
        },
        sql_db_query: {
          name: 'Consulta ao Banco de Dados',
          description:
            'Execute uma consulta SQL detalhada e correta para recuperar resultados do banco de dados.',
        },
        sql_db_schema: {
          name: 'Esquema do Banco de Dados',
          description:
            'Recupere o esquema e linhas de exemplo para uma lista de tabelas.',
        },
        sql_db_list_tables: {
          name: 'Listar Tabelas do Banco de Dados',
          description: 'Liste todas as tabelas disponíveis no banco de dados.',
        },
        sql_db_query_checker: {
          name: 'Verificador de Consulta',
          description: 'Verifique se sua consulta SQL está correta antes da execução.',
        },
        internet_search: {
          name: 'Busca na Internet',
          description: 'Pesquise na internet por informações.',
          settings: 'Configurações de Busca',
          engine: 'Mecanismo de Busca',
          engines: {
            duckduckgo: {
              label: 'DuckDuckGo (Para Teste)',
              hint: 'Taxa limitada, mas gratuita. Projetado para uso em testes.',
            },
            firecrawl: {
              label: 'Firecrawl (Para Negócios)',
              hint: 'Os limites de taxa podem ser expandidos. Projetado para uso comercial. É necessária uma chave de API. https://www.firecrawl.dev/',
            },
          },
        },
        knowledge_base_tool: {
          name: 'Recuperar Conhecimento',
          description: 'Recupere informações do conhecimento.',
        },
        bedrock_agent: {
          name: 'Agente Bedrock',
          description: 'Faça uma pergunta ao Agente Bedrock configurado',
        },
        firecrawl: {
          apiKey: 'Chave de API do Firecrawl',
          maxResults: 'Máximo de Resultados',
        },
        bedrockAgent: {
          name: 'Agente Bedrock',
          description: 'Use o Agente Bedrock como uma ferramenta.',
          agentId: {
            label: 'ID do Agente',
            placeholder: 'Digite o ID do Agente',
          },
          aliasId: {
            label: 'ID do Alias',
            placeholder: 'Digite o ID do Alias',
          },
        },
      },
    },
    bot: {
      label: {
        myBots: 'Meus Bots',
        recentlyUsedBots: 'Bots Usados Recentemente',
        knowledge: 'Conhecimento',
        url: 'URL',
        s3url: 'Fonte de Dados S3',
        sitemap: 'URL do Sitemap',
        file: 'Arquivo',
        loadingBot: 'Carregando...',
        normalChat: 'Chat',
        notAvailableBot: '[NÃO Disponível]',
        notAvailableBotInputMessage: 'Este bot NÃO está disponível.',
        noDescription: 'Sem Descrição',
        notAvailable: 'Este bot NÃO está disponível.',
        noBots: 'Nenhum Bot.',
        noBotsRecentlyUsed: 'Nenhum Bot Usado Recentemente.',
        noStarredBots: 'Nenhum Bot Favoritado.',
        retrievingKnowledge: '[Recuperando Conhecimento...]',
        dndFileUpload:
          'Você pode enviar arquivos arrastando e soltando.\nArquivos suportados: {{fileExtensions}}',
        uploadError: 'Mensagem de Erro',
        referenceLink: 'Link de Referência',
        syncStatus: {
          queue: 'Aguardando Sincronização',
          running: 'Sincronizando',
          success: 'Sincronização Concluída',
          fail: 'Falha na Sincronização',
        },
        fileUploadStatus: {
          uploading: 'Enviando...',
          uploaded: 'Enviado',
          error: 'ERRO',
        },
        quickStarter: {
          title: 'Iniciador Rápido de Conversa',
          exampleTitle: 'Título',
          example: 'Exemplo de Conversa',
        },
        citeRetrievedContexts: 'Citação de Contextos Recuperados',
        unsupported: 'Não Suportado, Somente Leitura',
      },
      titleSubmenu: {
        edit: 'Editar',
        copyLink: 'Copiar Link',
        copiedLink: 'Copiado',
        markAsEssential: 'Marcar como Essencial',
        removeEssential: 'Remover Status de Essencial',
      },
      help: {
        overview:
          'Os bots operam de acordo com instruções pré-definidas. O chat não funciona conforme o esperado, a menos que o contexto seja definido na mensagem, mas com os bots, não há necessidade de definir o contexto.',
        instructions:
          'Defina como o bot deve se comportar. Dar instruções ambíguas pode levar a movimentos imprevisíveis, portanto, forneça instruções claras e específicas.',
        knowledge: {
          overview:
            'Ao fornecer conhecimento externo ao bot, ele se torna capaz de lidar com dados nos quais não foi pré-treinado.',
          url: 'As informações da URL especificada serão usadas como Conhecimento.',
          s3url:
            'Ao inserir o URI do S3, você pode adicionar o S3 como uma fonte de dados. Você pode adicionar até 4 fontes. Ele só suporta buckets que existem na mesma conta e na mesma região que a região do bedrock.',
          sitemap:
            'Ao especificar a URL do sitemap, as informações obtidas através da raspagem automática de sites dentro dele serão usadas como Conhecimento.',
          file: 'Os arquivos enviados serão usados como Conhecimento.',
          citeRetrievedContexts:
            'Configure se deseja exibir o contexto recuperado para responder às consultas do usuário como informações de citação.\nSe habilitado, os usuários podem acessar as URLs ou arquivos originais.',
        },
        quickStarter: {
          overview:
            'Ao iniciar uma conversa, forneça exemplos. Os exemplos ilustram como usar o bot.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Erro de Sincronização de Conhecimento',
            body: 'Ocorreu um erro ao sincronizar o Conhecimento. Por favor, verifique a seguinte mensagem:',
          },
          incomplete: {
            title: 'NÃO Pronto',
            body: 'Este bot não concluiu a sincronização do conhecimento, então o conhecimento antes da atualização é usado.',
          },
        },
      },
      samples: {
        title: 'Exemplos de Instruções',
        anthropicLibrary: {
          title: 'Biblioteca de Prompts da Anthropic',
          sentence: 'Precisa de mais exemplos? Visite: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Assistente de Código Python',
          prompt: `Escreva um script Python curto e de alta qualidade para a tarefa dada, algo que um especialista em Python muito habilidoso escreveria. Você está escrevendo código para um desenvolvedor experiente, então adicione apenas comentários para coisas que não são óbvias. Certifique-se de incluir quaisquer importações necessárias. 
NUNCA escreva nada antes do bloco \`\`\`python\`\`\`. Depois de gerar o código e após o bloco \`\`\`python\`\`\`, verifique seu trabalho cuidadosamente para garantir que não há erros, inconsistências ou falhas. Se houver erros, liste esses erros em tags <error>, então gere uma nova versão com os erros corrigidos. Se não houver erros, escreva "VERIFICADO: SEM ERROS" em tags <error>.`,
        },
        mailCategorizer: {
          title: 'Categorizador de E-mails',
          prompt: `Você é um agente de atendimento ao cliente responsável por classificar e-mails por tipo. Por favor, forneça sua resposta e justifique sua classificação. 

As categorias de classificação são: 
(A) Pergunta sobre pré-venda 
(B) Item quebrado ou defeituoso 
(C) Pergunta sobre cobrança 
(D) Outro (por favor, explique)

Como você categorizaria este e-mail?`,
        },
        fitnessCoach: {
          title: 'Personal Trainer',
          prompt: `Você é um personal trainer animado e entusiasmado chamado Sam. Sam é apaixonado por ajudar clientes a ficarem em forma e levar estilos de vida mais saudáveis. Você escreve em um tom encorajador e amigável e sempre tenta guiar seus clientes para melhores metas de fitness. Se o usuário perguntar algo não relacionado a fitness, ou traga o tópico de volta para fitness, ou diga que não pode responder.`,
        },
      },
      create: {
        pageTitle: 'Criar Meu Bot',
      },
      edit: {
        pageTitle: 'Editar Meu Bot',
      },
      my: {
        label: {
          pageTitle: 'Meus Bots',
        },
      },
      item: {
        title: 'Nome',
        description: 'Descrição',
        instruction: 'Instruções',
      },
      apiSettings: {
        pageTitle: 'Configurações de API de Bot Compartilhado',
        label: {
          endpoint: 'Endpoint da API',
          usagePlan: 'Plano de Uso',
          allowOrigins: 'Origens Permitidas',
          apiKeys: 'Chaves de API',
          period: {
            day: 'Por DIA',
            week: 'Por SEMANA',
            month: 'Por MÊS',
          },
          apiKeyDetail: {
            creationDate: 'Data de criação',
            active: 'Ativo',
            inactive: 'Inativo',
            key: 'Chave de API',
          },
        },
        item: {
          throttling: 'Limitação',
          burstLimit: 'Limite de Pico',
          rateLimit: 'Taxa',
          quota: 'Cota',
          requestLimit: 'Solicitações',
          offset: 'Deslocamento',
        },
        help: {
          overview:
            "Criar uma API permite que as funções do Bot sejam acessadas por clientes externos; APIs permitem integração com aplicações externas.",
          endpoint: 'O cliente pode usar o Bot a partir deste endpoint.',
          usagePlan:
            'Planos de uso especificam o número ou taxa de solicitações que sua API aceita de um cliente. Associe uma API a um plano de uso para rastrear as solicitações que sua API recebe.',
          throttling: 'Limite a taxa com que os usuários podem chamar sua API.',
          rateLimit:
            'Insira a taxa, em solicitações por segundo, com que os clientes podem chamar sua API.',
          burstLimit:
            'Insira o número de solicitações concorrentes que um cliente pode fazer para sua API.',
          quota:
            'Ative cotas para limitar o número de solicitações que um usuário pode fazer para sua API em um determinado período de tempo.',
          requestLimit:
            'Insira o número total de solicitações que um usuário pode fazer no período de tempo selecionado na lista suspensa.',
          allowOrigins:
            'Origens de cliente permitidas para acesso. Se a origem não for permitida, o chamador recebe uma resposta 403 Forbidden e é negado o acesso à API. A origem deve seguir o formato: "(http|https)://host-name" ou "(http|https)://host-name:port" e curingas (*) podem ser usados.',
          allowOriginsExample:
            'ex. https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
          apiKeys:
            'Uma chave de API é uma string alfanumérica usada para identificar um cliente da sua API. Caso contrário, o chamador recebe uma resposta 403 Forbidden e é negado o acesso à API.',
        },
        button: {
          ApiKeyShow: 'Mostrar',
          ApiKeyHide: 'Ocultar',
        },
        alert: {
          botUnshared: {
            title: 'Por favor, Compartilhe o Bot com Todos os Usuários',
            body: 'Você não pode publicar uma API para o bot que não está compartilhado com todos os usuários.',
          },
          deploying: {
            title: 'A implantação da API está em ANDAMENTO',
            body: 'Por favor, aguarde até que a implantação seja concluída.',
          },
          deployed: {
            title: 'A API foi IMPLANTADA',
            body: 'Você pode acessar a API do Cliente usando o Endpoint da API e a Chave de API.',
          },
          deployError: {
            title: 'FALHA ao implantar a API',
            body: 'Por favor, exclua a API e recrie-a.',
          },
        },
        deleteApiDaialog: {
          title: 'Excluir?',
          content:
            'Tem certeza de que deseja excluir a API? O endpoint da API será excluído e o cliente não terá mais acesso a ele.',
        },
        addApiKeyDialog: {
          title: 'Adicionar Chave de API',
          content: 'Digite um nome para identificar a Chave de API.',
        },
        deleteApiKeyDialog: {
          title: 'Excluir?',
          content:
            'Tem certeza de que deseja excluir <Bold>{{title}}</Bold>?\nOs clientes usando esta Chave de API serão negados o acesso à API.',
        },
      },
      button: {
        newBot: 'Criar Novo Bot',
        create: 'Criar',
        edit: 'Editar',
        save: 'Salvar',
        delete: 'Excluir',
        share: 'Compartilhar',
        apiSettings: 'Configurações de Publicação da API',
        copy: 'Copiar',
        copied: 'Copiado',
        instructionsSamples: 'Exemplos',
        chooseFiles: 'Escolher arquivos',
        viewAll: 'Ver Todos',
        removeFromRecent: 'Remover do Histórico',
      },
      deleteDialog: {
        title: 'Excluir?',
        content: 'Tem certeza de que deseja excluir <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Compartilhar',
        switchLabel: 'Compartilhar este Bot',
        label: {
          selectShare: 'Compartilhar com',
          all: 'TODOS os Usuários',
          partial: 'Usuários Selecionados',
          search: 'Pesquisar Usuários e Grupos',
          noSearchResults: 'Nenhum resultado de pesquisa encontrado',
          memberManagement: 'Editar Membros',
          sharing: {
            not_shared: 'Não compartilhado com nenhum grupo ou usuário',
            shared_only_users: 'Compartilhado com {{count}} usuário',
            shared_only_users_plural: 'Compartilhado com {{count}} usuários',
            shared_only_groups: 'Compartilhado com {{count}} grupo',
            shared_only_groups_plural: 'Compartilhado com {{count}} grupos',
            shared_both:
              'Compartilhado com {{groupCount}} grupo e {{userCount}} usuário',
            shared_both_user_plural:
              'Compartilhado com {{groupCount}} grupo e {{userCount}} usuários',
            shared_both_group_plural:
              'Compartilhado com {{groupCount}} grupos e {{userCount}} usuário',
            shared_both_plural:
              'Compartilhado com {{groupCount}} grupos e {{userCount}} usuários',
          },
          user: 'Usuário',
          group: 'Grupo',
        },
        off: {
          content: 'Este bot é privado e apenas você tem acesso a ele.',
        },
        on: {
          content:
            'Este bot é compartilhado e acessível a outros usuários. Os usuários compartilhados podem encontrar e usar este bot através da página <Link>Descobrir Bot</Link>.',
          linkDescription:
            'Você também pode conversar com o bot usando este link compartilhado.',
        },
        button: {
          manage: 'Gerenciar',
          removeAccess: 'Remover Acesso',
          cancelRemoval: 'Cancelar Remoção',
          cancelAddition: 'Cancelar Adição',
        },
      },
      error: {
        notSupportedFile: 'Este arquivo não é suportado.',
        duplicatedFile: 'Um arquivo com o mesmo nome já foi enviado.',
        failDeleteApi: 'Falha ao excluir a API.',
      },
      activeModels: {
        title: 'Ativação de Modelos',
        description: 'Configure quais modelos de IA podem ser usados com este bot.',
      },
    },
    admin: {
      botAnalytics: {
        label: {
          pageTitle: 'Análise de Bots',
          noBotUsages: 'Durante o Período de Cálculo, nenhum bot foi utilizado.',
          published: 'API está publicada.',
          SearchCondition: {
            title: 'Período de Cálculo',
            from: 'De',
            to: 'Até',
          },
          sortByCost: 'Ordenar por Custo',
        },
        help: {
          overview: 'Monitore o status de uso dos Bots e APIs de Bot Publicadas.',
          calculationPeriod:
            'Se o Período de Cálculo não for definido, o custo de hoje será exibido.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'Gerenciamento de API',
          publishedDate: 'Data de Publicação',
          noApi: 'Nenhuma API.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Gerenciamento de Bots',
          sharedUrl: 'URL do Bot',
          apiSettings: 'Configurações de Publicação da API',
          noKnowledge: 'Este bot não tem Conhecimento.',
          notPublishApi: "A API deste bot não está publicada.",
          deployStatus: 'Status de Implantação',
          cfnStatus: 'Status do CloudFormation',
          codebuildStatus: 'Status do CodeBuild',
          codeBuildId: 'ID do CodeBuild',
          usagePlanOn: 'LIGADO',
          usagePlanOff: 'DESLIGADO',
          rateLimit:
            '<Bold>{{limit}}</Bold> solicitações por segundo, que os clientes podem chamar a API.',
          burstLimit:
            'O cliente pode fazer <Bold>{{limit}}</Bold> solicitações concorrentes para a API.',
          requestsLimit:
            'Você pode fazer <Bold>{{limit}}</Bold> solicitações <Bold>{{period}}</Bold>.',
          sharedAllUsers: 'Compartilhado com TODOS os Usuários',
          privateBot: 'Este bot não está compartilhado.',
          owner: 'Proprietário',
        },
        alert: {
          noApiKeys: {
            title: 'Nenhuma Chave de API',
            body: 'Todos os clientes não podem acessar a API.',
          },
        },
        button: {
          deleteApi: 'Excluir API',
        },
      },
      validationError: {
        period: 'Insira De e Até',
      },
    },
    discover: {
      pageTitle: 'Descobrir Bot',
      description:
        'Visualize e pesquise bots que são públicos ou permitidos para seu acesso.',
      search: {
        placeholder: 'Pesquisar Bots',
        searching: 'Pesquisando...',
        results: 'Encontrados {{count}} resultados para "{{query}}"',
        noResults: 'Nenhum resultado encontrado para "{{query}}"',
        tryDifferent: 'Tente palavras-chave diferentes.',
        backToHome: 'Voltar para a Página Inicial',
      },
      essential: {
        label: 'Essencial',
        description:
          'Estes bots são selecionados oficialmente pelos administradores. Use-os ativamente para melhorar sua eficiência de trabalho como parte das operações padrão.',
        noEssentialBotsMessage: {
          title: 'Nenhum Bot Essencial',
          content: `A seção Essencial está oculta para usuários não administradores, pois não há bots Essenciais.<br/>
          Bots compartilhados com Todos os Usuários podem ser marcados como Essenciais.<br/>
          Use o menu do bot em Chat, Meus Bots, Bots Favoritos ou Bots Usados Recentemente para marcar um bot como Essencial.<br/>
          Clique no botão <MenuButton/> nessas visualizações para acessar o menu.`,
        },
      },
      trending: {
        label: 'Em Alta',
        description: 'Bots mais populares.',
      },
      discover: {
        label: 'Descobrir',
        description: 'Mostruário aleatório de bots.',
      },
    },
    conversationHistory: {
      pageTitle: 'Histórico de Conversas',
      label: {
        noConversations: 'Nenhum Histórico de Conversas',
      },
      searchConversation: {
        placeholder: 'Pesquisar conversas...',
        searching: 'Pesquisando...',
        results: 'Encontradas {{count}} conversas correspondentes a "{{query}}"',
        noResults: 'Nenhuma conversa correspondente a "{{query}}"',
        tryDifferentKeywords: 'Tente palavras-chave diferentes',
        resultsCount: '{{count}} resultados encontrados',
      },
    },
    deleteDialog: {
      title: 'Excluir?',
      content: 'Tem certeza de que deseja excluir <Bold>{{title}}</Bold>?',
      pinnedBotError: {
        title: 'Não é possível excluir',
        content:
          'Este bot está marcado como essencial. O status essencial pode ser alterado pelo administrador.',
      },
    },
    clearDialog: {
      title: 'Excluir TUDO?',
      content: 'Tem certeza de que deseja excluir TODAS as conversas?',
    },
    languageDialog: {
      title: 'Mudar idioma',
    },
    drawerOptionsDialog: {
      title: 'Opções do Menu Lateral',
      label: {
        displayCount: 'Contagem de Exibição',
      },
    },
    feedbackDialog: {
      title: 'Feedback',
      content: 'Por favor, forneça mais detalhes.',
      categoryLabel: 'Categoria',
      commentLabel: 'Comentário',
      commentPlaceholder: '(Opcional) Digite seu comentário',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'Não é factualmente correto',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'Não segue totalmente minha solicitação',
        },
        {
          value: 'other',
          label: 'Outro',
        },
      ],
    },
    button: {
      newChat: 'Nova Conversa',
      backToConversationHistory: 'Voltar para o Histórico de Conversas',
      botConsole: 'Console do Bot',
      botAnalytics: 'Análise de Bot Compartilhado',
      apiManagement: 'Gerenciamento de API',
      userUsages: 'Usos do Usuário',
      SaveAndSubmit: 'Salvar & Enviar',
      resend: 'Reenviar',
      regenerate: 'Regenerar',
      delete: 'Excluir',
      deleteAll: 'Excluir Tudo',
      done: 'Concluído',
      ok: 'OK',
      cancel: 'Cancelar',
      back: 'Voltar',
      menu: 'Menu',
      language: 'Idioma',
      clearConversation: 'Excluir TODAS as Conversas',
      signOut: 'Sair',
      close: 'Fechar',
      add: 'Adicionar',
      continue: 'Continuar a Gerar',
      botManagement: 'Gerenciamento de Bots',
      mode: 'Modo',
      drawerOption: 'Opções do Menu Lateral',
    },
    input: {
      hint: {
        required: '* Obrigatório',
      },
      validationError: {
        required: 'Este campo é obrigatório.',
        invalidOriginFormat: 'Formato de Origem inválido.',
      },
    },
    embeddingSettings: {
      title: 'Configuração de Embedding',
      description:
        'Você pode configurar os parâmetros para embeddings vetoriais. Ao ajustar os parâmetros, você pode alterar a precisão da recuperação de documentos.',
      chunkSize: {
        label: 'tamanho do chunk',
        hint: 'O tamanho do chunk refere-se ao tamanho em que um documento é dividido em segmentos menores',
      },
      chunkOverlap: {
        label: 'sobreposição de chunk',
        hint: 'Você pode especificar o número de caracteres sobrepostos entre chunks adjacentes.',
      },
      enablePartitionPdf: {
        label:
          'Ativar análise detalhada de PDF. Se ativado, o PDF será analisado em detalhes ao longo do tempo.',
        hint: 'É eficaz quando você deseja melhorar a precisão da pesquisa. Os custos de computação aumentam porque a computação leva mais tempo.',
      },
      help: {
        chunkSize:
          "Quando o tamanho do chunk é muito pequeno, informações contextuais podem ser perdidas, e quando é muito grande, diferentes informações contextuais podem existir dentro do mesmo chunk, potencialmente reduzindo a precisão da pesquisa.",
        chunkOverlap:
          'Ao especificar a sobreposição de chunks, você pode preservar informações contextuais ao redor dos limites dos chunks. Aumentar o tamanho do chunk pode às vezes melhorar a precisão da pesquisa. No entanto, esteja ciente de que aumentar a sobreposição de chunks pode levar a custos computacionais mais altos.',
        overlapTokens:
          'Você configura o número de tokens para sobrepor ou repetir em chunks adjacentes. Por exemplo, se você definir sobreposição de tokens para 60, os últimos 60 tokens no primeiro chunk também são incluídos no início do segundo chunk.',
        maxParentTokenSize:
          'Você pode definir o tamanho do chunk pai. Durante a recuperação, o sistema inicialmente recupera chunks filhos, mas os substitui por chunks pais mais amplos para fornecer ao modelo um contexto mais abrangente',
        maxChildTokenSize:
          'Você pode definir o tamanho do chunk filho. Durante a recuperação, o sistema inicialmente recupera chunks filhos, mas os substitui por chunks pais mais amplos para fornecer ao modelo um contexto mais abrangente',
        bufferSize:
          'Este parâmetro pode influenciar quanto texto é examinado junto para determinar os limites de cada chunk, impactando a granularidade e coerência dos chunks resultantes. Um tamanho de buffer maior pode capturar mais contexto, mas também pode introduzir ruído, enquanto um tamanho de buffer menor pode perder contexto importante, mas garante um chunking mais preciso.',
        breakpointPercentileThreshold:
          'Um limite mais alto requer que as frases sejam mais distinguíveis para serem divididas em chunks diferentes. Um limite mais alto resulta em menos chunks e normalmente em um tamanho médio de chunk maior.',
      },
      alert: {
        sync: {
          error: {
            title: 'Erro de Divisão de Frases',
            body: 'Tente novamente com um valor menor de sobreposição de chunk',
          },
        },
      },
    },
    generationConfig: {
      title: 'Configuração de Geração',
      description:
        'Você pode configurar os parâmetros de inferência do LLM para controlar a resposta dos modelos.',
      maxTokens: {
        label: 'Comprimento máximo de geração/máximo de novos tokens',
        hint: 'O número máximo de tokens permitidos na resposta gerada',
      },
      temperature: {
        label: 'Temperatura',
        hint: 'Afeta a forma da distribuição de probabilidade para a saída prevista e influencia a probabilidade do modelo selecionar saídas de menor probabilidade',
        help: 'Escolha um valor mais baixo para influenciar o modelo a selecionar saídas de maior probabilidade; Escolha um valor mais alto para influenciar o modelo a selecionar saídas de menor probabilidade',
      },
      topK: {
        label: 'Top-k',
        hint: 'O número de candidatos mais prováveis que o modelo considera para o próximo token',
        help: 'Escolha um valor mais baixo para diminuir o tamanho do pool e limitar as opções a saídas mais prováveis; Escolha um valor mais alto para aumentar o tamanho do pool e permitir que o modelo considere saídas menos prováveis',
      },
      topP: {
        label: 'Top-p',
        hint: 'A porcentagem de candidatos mais prováveis que o modelo considera para o próximo token',
        help: 'Escolha um valor mais baixo para diminuir o tamanho do pool e limitar as opções a saídas mais prováveis; Escolha um valor mais alto para aumentar o tamanho do pool e permitir que o modelo considere saídas menos prováveis',
      },
      stopSequences: {
        label: 'Token de fim/sequência de fim',
        hint: 'Especifique sequências de caracteres que impedem o modelo de gerar mais tokens. Use vírgulas para separar várias palavras',
      },
      budgetTokens: {
        label: 'Tokens de Orçamento de Raciocínio',
        hint: 'O número máximo de tokens a serem alocados para etapas de raciocínio. Valores maiores permitem raciocínios mais complexos, mas podem aumentar o tempo de resposta',
        help: 'Define o orçamento de tokens para etapas de raciocínio. Não pode exceder o valor de Max Tokens.',
      },
    },
    searchSettings: {
      title: 'Configurações de Busca',
      description:
        'Você pode configurar parâmetros de busca para buscar documentos relevantes do armazenamento vetorial.',
      maxResults: {
        label: 'Máximo de Resultados',
        hint: 'O número máximo de registros buscados do armazenamento vetorial',
      },
      searchType: {
        label: 'Tipo de Busca',
        hybrid: {
          label: 'Busca híbrida',
          hint: 'Combina pontuações de relevância de busca semântica e de texto para fornecer maior precisão.',
        },
        semantic: {
          label: 'Busca semântica',
          hint: 'Usa embeddings vetoriais para entregar resultados relevantes.',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'Configurações Detalhadas de Conhecimento',
      description:
        'Selecione o modelo incorporado para configurar o conhecimento e defina o método para dividir documentos adicionados como conhecimento. Essas configurações não podem ser alteradas após a criação do bot.',
      embeddingModel: {
        label: 'Modelo de Embeddings',
        titan_v2: {
          label: 'Titan Embedding Text v2',
        },
        cohere_multilingual_v3: {
          label: 'Embed Multilingual v3',
        },
      },
      chunkingStrategy: {
        label: 'Estratégia de Chunking',
        default: {
          label: 'Chunking padrão',
          hint: "Divide automaticamente o texto em chunks de cerca de 300 tokens de tamanho, por padrão. Se um documento tiver menos ou já tiver 300 tokens, ele não será dividido.",
        },
        fixed_size: {
          label: 'Chunking de tamanho fixo',
          hint: 'Divide o texto em seu tamanho aproximado de token definido.',
        },
        hierarchical: {
          label: 'chunking hierárquico',
          hint: 'Divide o texto em estruturas aninhadas de chunks filhos e pais.',
        },
        semantic: {
          label: 'chunking semântico',
          hint: 'Divide o texto em chunks significativos para melhorar a compreensão e recuperação de informações.',
        },
        none: {
          label: 'Sem chunking',
          hint: 'Os documentos não serão divididos.',
        },
      },
      chunkingMaxTokens: {
        label: 'Máximo de Tokens',
        hint: 'O número máximo de tokens por chunk',
      },
      chunkingOverlapPercentage: {
        label: 'Porcentagem de Sobreposição entre Chunks',
        hint: 'A sobreposição do chunk pai depende do tamanho do token filho e da porcentagem de sobreposição filho que você especificar.',
      },
      overlapTokens: {
        label: 'Tokens de Sobreposição',
        hint: 'O número de tokens para repetir em chunks na mesma camada',
      },
      maxParentTokenSize: {
        label: 'Tamanho Máximo de Token Pai',
        hint: 'O número máximo de tokens que um chunk pode conter na camada Pai',
      },
      maxChildTokenSize: {
        label: 'Tamanho Máximo de Token Filho',
        hint: 'O número máximo de tokens que um chunk pode conter na camada Filho',
      },
      bufferSize: {
        label: 'Tamanho do Buffer',
        hint: 'o número de frases circundantes a serem adicionadas para criação de embeddings. Um tamanho de buffer de 1 resulta em 3 frases (atual, anterior e próxima frase) a serem combinadas e incorporadas',
      },
      breakpointPercentileThreshold: {
        label: 'Limite de percentil de ponto de quebra',
        hint: 'O limite de percentil de distância/dissimilaridade de frase para desenhar pontos de quebra entre frases.',
      },
      opensearchAnalyzer: {
        label: 'Analisador (Tokenização, Normalização)',
        hint: 'Você pode especificar o analisador para tokenizar e normalizar os documentos registrados como conhecimento. Selecionar um analisador apropriado melhorará a precisão da pesquisa. Por favor, escolha o analisador ideal que corresponda ao idioma do seu conhecimento.',
        icu: {
          label: 'Analisador ICU',
          hint: 'Para tokenização, {{tokenizer}} é usado, e para normalização, {{normalizer}} é usado.',
        },
        kuromoji: {
          label: 'Analisador japonês (kuromoji)',
          hint: 'Para tokenização, {{tokenizer}} é usado, e para normalização, {{normalizer}} é usado.',
        },
        none: {
          label: 'Analisador padrão do sistema',
          hint: 'O analisador padrão definido pelo sistema (OpenSearch) será usado.',
        },
        tokenizer: 'Tokenizador:',
        normalizer: 'Normalizador:',
        token_filter: 'Filtro de Token:',
        not_specified: 'Não especificado',
      },
      advancedParsing: {
        label: 'Análise Avançada',
        description:
          'Selecione um modelo para usar para capacidades avançadas de análise de documentos.',
        hint: 'Adequado para análise além do texto padrão em formatos de documentos suportados, incluindo tabelas dentro de PDFs com sua estrutura intacta. Custos adicionais são incorridos para análise usando IA generativa.',
      },
      parsingModel: {
        label: 'Modelo de Análise Avançada',
        none: {
          label: 'Desativado',
          hint: 'Nenhuma análise avançada será aplicada.',
        },
        claude_3_5_sonnet_v1: {
          label: 'Claude 3.5 Sonnet v1',
          hint: 'Use Claude 3.5 Sonnet v1 para análise avançada de documentos.',
        },
        claude_3_haiku_v1: {
          label: 'Claude 3 Haiku v1',
          hint: 'Use Claude 3 Haiku v1 para análise avançada de documentos.',
        },
      },
      webCrawlerConfig: {
        title: 'Configuração do Web Crawler',
        crawlingScope: {
          label: 'Escopo de Crawling',
          default: {
            label: 'Padrão',
            hint: 'Limita o crawling a páginas da web que pertencem ao mesmo host e com o mesmo caminho inicial de URL. Por exemplo, com uma URL inicial de "https://aws.amazon.com/bedrock/" então apenas este caminho e páginas da web que estendem deste caminho serão rastreadas, como "https://aws.amazon.com/bedrock/agents/". URLs irmãs como "https://aws.amazon.com/ec2/" não são rastreadas, por exemplo.',
          },
          subdomains: {
            label: 'Subdomínios',
            hint: 'Inclui o crawling de qualquer página da web que tenha o mesmo domínio principal que a URL inicial. Por exemplo, com uma URL inicial de "https://aws.amazon.com/bedrock/" então qualquer página da web que contenha "amazon.com" será rastreada, como "https://www.amazon.com".',
          },
          hostOnly: {
            label: 'Apenas Host',
            hint: 'Limita o crawling a páginas da web que pertencem ao mesmo host. Por exemplo, com uma URL inicial de "https://aws.amazon.com/bedrock/", então páginas da web com "https://docs.aws.amazon.com" também serão rastreadas, como "https://aws.amazon.com/ec2".',
          },
        },
        includePatterns: {
          label: 'Padrões de Inclusão',
          hint: 'Especifique padrões para incluir no web crawling. Apenas URLs correspondentes a esses padrões serão rastreadas.',
        },
        excludePatterns: {
          label: 'Padrões de Exclusão',
          hint: 'Especifique padrões para excluir do web crawling. URLs correspondentes a esses padrões não serão rastreadas.',
        },
      },
      advancedConfigration: {
        existingKnowledgeBaseId: {
          label: 'ID para a Base de Conhecimento Amazon Bedrock',
          description:
            'Por favor, especifique o ID da sua base de conhecimento Amazon Bedrock existente.',
        },
        createDedicatedKnowledgeBase: {
          label: 'Criar nova Base de Conhecimento dedicada',
        },
        createTenantInSharedKnowledgeBase: {
          label: 'Crie um inquilino em uma Base de Conhecimento compartilhada',
        },
        useExistingKnowledgeBase: {
          label: 'Use sua Base de Conhecimento existente',
        },
      },
    },
    error: {
      answerResponse: 'Ocorreu um erro ao responder.',
      notFoundConversation:
        'Como o chat especificado não existe, uma nova tela de chat é exibida.',
      notFoundPage: 'A página que você está procurando não foi encontrada.',
      cannotAccessBot: 'Não é possível acessar este bot. Redirecionado para Novo Chat.',
      unexpectedError: {
        title: 'Ocorreu um erro inesperado.',
        restore: 'Ir para a página INICIAL',
      },
      predict: {
        general: 'Ocorreu um erro ao prever.',
        invalidResponse:
          'Resposta inesperada recebida. O formato da resposta não corresponde ao formato esperado.',
      },
      notSupportedImage: 'O modelo selecionado não suporta imagens.',
      unsupportedFileFormat: 'O formato de arquivo selecionado não é suportado.',
      totalFileSizeToSendExceeded:
        'O tamanho total do arquivo deve ser no máximo {{maxSize}}.',
      attachment: {
        fileSizeExceeded:
          'Cada tamanho de documento deve ser no máximo {{maxSize}}.',
        fileCountExceeded: 'Não foi possível enviar mais de {{maxCount}} arquivos.',
      },
      share: {
        markedEssential: {
          title: 'Não é possível alterar as configurações de compartilhamento',
          content:
            'Este bot está marcado como Essencial pelo administrador. Bots essenciais devem ser compartilhados com todos os usuários.',
        },
        publication: {
          title: 'Não é possível alterar as configurações de compartilhamento',
          content:
            'Este bot é publicado como API pelo administrador. APIs publicadas devem ser compartilhadas com todos os usuários.',
        },
      },
    },
    validation: {
      title: 'Erro de Validação',
      maxRange: {
        message: 'O valor máximo que pode ser definido é {{size}}',
      },
      minRange: {
        message: 'O valor mínimo que pode ser definido é {{size}}',
      },
      maxBudgetTokens: {
        message: 'O maxBudgetToken não pode exceder o maxTokens {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message: 'A sobreposição de chunk deve ser definida como menor que o tamanho do chunk',
      },
      parentTokenRange: {
        message: 'O tamanho do token pai deve ser maior que o tamanho do token filho',
      },
      quickStarter: {
        message: 'Por favor, insira Título e Exemplo de Conversa.',
      },
      required: '{{key}} é obrigatório',
      number: {
        greaterThen: '{{key}} deve ser maior que {{value}} ',
      },
    },
    helper: {
      shortcuts: {
        title: 'Teclas de Atalho',
        items: {
          focusInput: 'Mudar o foco para a entrada do chat',
          newChat: 'Abrir novo chat',
        },
      },
    },
    guardrails: {
      title: 'Guardrails',
      label: 'Ativar Guardrails para Amazon Bedrock',
      hint: 'Guardrails para Amazon Bedrock são usados para implementar salvaguardas específicas da aplicação com base em seus casos de uso e políticas de IA responsável.',
      harmfulCategories: {
        label: 'Categorias Nocivas',
        hint: 'Configure filtros de conteúdo ajustando o grau de filtragem para detectar e bloquear entradas de usuário nocivas e respostas do modelo que violem suas políticas de uso. 0: desativar, 1: baixo, 2: médio, 3: Alto',
        hate: {
          label: 'Ódio',
          hint: 'Descreve prompts de entrada e respostas do modelo que discriminam, criticam, insultam, denunciam ou desumanizam uma pessoa ou grupo com base em uma identidade (como raça, etnia, gênero, religião, orientação sexual, habilidade e nacionalidade). 0: desativar, 1: baixo, 2: médio, 3: Alto',
        },
        insults: {
          label: 'Insultos',
          hint: 'Descreve prompts de entrada e respostas do modelo que incluem linguagem depreciativa, humilhante, zombeteira, insultuosa ou menosprezadora. Este tipo de linguagem também é rotulado como bullying. 0: desativar, 1: baixo, 2: médio, 3: Alto',
        },
        sexual: {
          label: 'Sexual',
          hint: 'Descreve prompts de entrada e respostas do modelo que indicam interesse, atividade ou excitação sexual usando referências diretas ou indiretas a partes do corpo, traços físicos ou sexo. 0: desativar, 1: baixo, 2: médio, 3: Alto',
        },
        violence: {
          label: 'Violência',
          hint: 'Descreve prompts de entrada e respostas do modelo que incluem glorificação ou ameaças de infligir dor física, ferimentos ou danos a uma pessoa, grupo ou coisa. 0: desativar, 1: baixo, 2: médio, 3: Alto ',
        },
        misconduct: {
          label: 'Má Conduta',
          hint: 'Descreve prompts de entrada e respostas do modelo que buscam ou fornecem informações sobre se envolver em atividade de má conduta, ou prejudicar, fraudar ou tirar vantagem de uma pessoa, grupo ou instituição. 0: desativar, 1: baixo, 2: médio, 3: Alto',
        },
      },
      contextualGroundingCheck: {
        label: 'Verificação de Aterramento Contextual',
        hint: 'Use esta política para validar se as respostas do modelo estão fundamentadas na fonte de referência e são relevantes para a consulta do usuário para filtrar alucinações do modelo.',
        groundingThreshold: {
          label: 'Aterramento',
          hint: 'Valide se as respostas do modelo estão fundamentadas e factualmente corretas com base nas informações fornecidas na fonte de referência, e bloqueie respostas que estão abaixo do limite definido de aterramento. 0: não bloqueia nada, 1: bloqueia quase tudo',
        },
        relevanceThreshold: {
          label: 'Relevância',
          hint: "Valide se as respostas do modelo são relevantes para a consulta do usuário e bloqueie respostas que estão abaixo do limite definido de relevância. 0: não bloqueia nada, 1: bloqueia quase tudo",
        },
      },
    },
    reasoning: {
      button: {
        label: 'Raciocínio',
      },
      card: {
        label: 'Processo de Raciocínio',
      },
    },
  },
};

export default translation;
