const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Iniciar sesión',
      },
    },
    app: {
      name: 'Chat Bedrock',
      inputMessage: 'Enviar un mensaje',
      pinnedBots: 'Bots Fijados',
      starredBots: 'Bots Favoritos',
      recentlyUsedBots: 'Bots Usados Recientemente',
      conversationHistory: 'Historial',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Solo Administrador',
    },
    model: {
      'claude-v3-haiku': {
        label: 'Claude 3 (Haiku)',
        description:
          'Versión anterior optimizada para velocidad y compacidad, brindando respuesta casi instantánea.',
      },
      'claude-v3.5-sonnet': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Versión anterior de Claude 3.5. Soporta una amplia gama de tareas, pero la v2 ofrece mayor precisión.',
      },
      'claude-v3.5-sonnet-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'La última versión de Claude 3.5. Un modelo mejorado que supera a la v1 en precisión y rendimiento.',
      },
      'claude-v3.5-haiku': {
        label: 'Claude 3.5 (Haiku)',
        description:
          'La última versión, con una capacidad de respuesta aún más rápida y mejor rendimiento respecto a Haiku 3.',
      },
      'claude-v4.1-opus': {
        label: 'Claude 4.1 (Opus)',
        description:
          'Modelo Opus con capacidades de razonamiento mejoradas.',
      },
      'claude-v4.5-opus': {
        label: 'Claude 4.5 (Opus)',
        description:
          'Modelo Opus de alta capacidad que combina razonamiento sólido con rendimiento práctico.',
      },
      'claude-v4.6-opus': {
        label: 'Claude 4.6 (Opus)',
        description:
          'Modelo insignia que planifica con más cuidado, mantiene tareas de agente por más tiempo y opera de forma fiable en grandes bases de código con ventana de contexto de 1M de tokens.',
      },
      'claude-v4.7-opus': {
        label: 'Claude 4.7 (Opus)',
        description:
          'Modelo Opus de alta capacidad diseñado para codificación, flujos de trabajo empresariales y tareas de agente de larga duración.',
      },
      'claude-v3-opus': {
        label: 'Claude 3 (Opus)',
        description: 'Modelo potente para tareas altamente complejas.',
      },
      'mistral-7b-instruct': {
        label: 'Mistral 7B',
      },
      'mixtral-8x7b-instruct': {
        label: 'Mistral-8x7B',
      },
      'mistral-large': {
        label: 'Mistral Grande',
      },
      'gpt-oss-20b': {
        label: 'GPT-OSS 20B',
        description:
          'Modelo de peso abierto de 20B parámetros con ventana de contexto de 128K y capacidades de razonamiento.',
      },
      'gpt-oss-120b': {
        label: 'GPT-OSS 120B',
        description:
          'Modelo de peso abierto de 120B parámetros con ventana de contexto de 128K y capacidades avanzadas de razonamiento.',
      },
      'qwen3-235b-a22b-2507': {
        label: 'Qwen3 235B A22B',
        description:
          'Modelo Mixture-of-Experts de 235B parámetros con 22B parámetros activos, ventana de contexto de 256K y capacidades de razonamiento para generación de texto y código.',
      },
      'qwen3-coder-30b-a3b': {
        label: 'Qwen3 Coder 30B A3B',
        description:
          'Modelo Mixture-of-Experts de 30B parámetros para codificación con 3B parámetros activos, ventana de contexto de 256K, salida máxima de 16K y razonamiento para generación de código.',
      },
    },
    agent: {
      label: 'Agente',
      help: {
        overview:
          'Usando la funcionalidad de Agente, tu chatbot puede manejar automáticamente tareas más complejas.',
      },
      hint: `El agente determina automáticamente qué herramientas usar para responder a las preguntas del usuario. Debido al tiempo necesario para la toma de decisiones, el tiempo de respuesta tiende a ser más largo. Al activar una o más herramientas, se habilita la funcionalidad del agente. Si no se selecciona ninguna herramienta, la funcionalidad del agente no se utiliza. Cuando la funcionalidad del agente está habilitada, el uso de "Conocimiento" también se trata como una de las herramientas. Esto significa que "Conocimiento" puede no usarse en las respuestas.`,
      progress: {
        label: 'Pensando...',
      },
      progressCard: {
        toolInput: 'Entrada: ',
        toolOutput: 'Salida: ',
        status: {
          running: 'Ejecutando...',
          success: 'Éxito',
          error: 'Error',
        },
      },
      tools: {
        get_weather: {
          name: 'Clima Actual',
          description: 'Obtener el pronóstico del clima actual.',
        },
        sql_db_query: {
          name: 'Consulta de Base de Datos',
          description:
            'Ejecuta una consulta SQL detallada y correcta para obtener resultados de la base de datos.',
        },
        sql_db_schema: {
          name: 'Esquema de Base de Datos',
          description:
            'Obtén el esquema y muestras de filas de una lista de tablas.',
        },
        sql_db_list_tables: {
          name: 'Listar Tablas de Base de Datos',
          description:
            'Listar todas las tablas disponibles en la base de datos.',
        },
        sql_db_query_checker: {
          name: 'Verificador de Consultas',
          description:
            'Verifica si tu consulta SQL es correcta antes de ejecutarla.',
        },
        internet_search: {
          name: 'Búsqueda en Internet',
          description: 'Buscar información en internet.',
        },
      },
    },
    bot: {
      label: {
        myBots: 'Mis Bots',
        recentlyUsedBots: 'Bots Compartidos Usados Recientemente',
        knowledge: 'Conocimiento',
        url: 'URL',
        s3url: 'Fuente de Datos S3',
        sitemap: 'URL del Sitemap',
        file: 'Archivo',
        loadingBot: 'Cargando...',
        normalChat: 'Chat',
        notAvailableBot: '[NO Disponible]',
        notAvailableBotInputMessage: 'Este bot NO está disponible.',
        noDescription: 'Sin Descripción',
        notAvailable: 'Este bot NO está disponible.',
        noBots: 'No hay Bots.',
        noBotsRecentlyUsed: 'No hay Bots Compartidos Usados Recientemente.',
        retrievingKnowledge: '[Recuperando Conocimiento...]',
        dndFileUpload:
          'Puedes subir archivos arrastrándolos y soltándolos.\nArchivos soportados: {{fileExtensions}}',
        uploadError: 'Mensaje de Error',
        referenceLink: 'Enlace de Referencia',
        syncStatus: {
          queue: 'Esperando Sincronización',
          running: 'Sincronizando',
          success: 'Sincronización Completada',
          fail: 'Sincronización Fallida',
        },
        fileUploadStatus: {
          uploading: 'Subiendo...',
          uploaded: 'Subido',
          error: 'ERROR',
        },
        quickStarter: {
          title: 'Inicio Rápido de Conversación ',
          exampleTitle: 'Título',
          example: 'Ejemplo de Conversación',
        },
        citeRetrievedContexts: 'Cita de Contextos Recuperados',
        unsupported: 'No Compatible, Solo Lectura',
      },
      titleSubmenu: {
        edit: 'Editar',
        copyLink: 'Copiar Enlace',
        copiedLink: 'Enlace Copiado',
      },
      help: {
        overview:
          'Los bots operan de acuerdo con instrucciones predefinidas. El chat no funciona como se espera a menos que el contexto esté definido en el mensaje, pero con bots, no es necesario definir el contexto.',
        instructions:
          'Define cómo debe comportarse el bot. Dar instrucciones ambiguas puede llevar a comportamientos impredecibles, así que proporciona instrucciones claras y específicas.',
        knowledge: {
          overview:
            'Al proporcionar conocimiento externo al bot, este puede manejar datos sobre los cuales no ha sido preentrenado.',
          url: 'La información de la URL especificada se usará como Conocimiento. Si configuras la URL de un video de YouTube, la transcripción de ese video se usará como Conocimiento.',
          s3url:
            'Ingresando el URI de S3, puedes agregar S3 como fuente de datos. Puedes añadir hasta 4 fuentes. Solo admite buckets que existen en la misma cuenta y región de Bedrock.',
          sitemap:
            'Especificando la URL del sitemap, la información obtenida mediante scraping automático de los sitios web dentro de este se usará como Conocimiento.',
          file: 'Los archivos subidos se usarán como Conocimiento.',
          citeRetrievedContexts:
            'Configura si se debe mostrar el contexto recuperado para responder las consultas de los usuarios como información de citación.\nSi está habilitado, los usuarios pueden acceder a las URLs o archivos originales.',
        },
        quickStarter: {
          overview:
            'Al iniciar una conversación, proporciona ejemplos. Los ejemplos ilustran cómo usar el bot.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Error de Sincronización de Conocimiento',
            body: 'Ocurrió un error al sincronizar el Conocimiento. Por favor revisa el siguiente mensaje:',
          },
          incomplete: {
            title: 'NO Listo',
            body: 'Este bot no ha completado la sincronización de conocimiento, por lo que se usa el conocimiento previo a la actualización.',
          },
        },
      },
      samples: {
        title: 'Muestras de Instrucciones',
        anthropicLibrary: {
          title: 'Biblioteca de Prompts de Anthropic',
          sentence: '¿Necesitas más ejemplos? Visita: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Asistente de Código en Python',
          prompt: `Escribe un script corto y de alta calidad en Python para la tarea dada, algo que escribiría un experto en Python. Estás escribiendo código para un desarrollador experimentado, así que solo añade comentarios para cosas que no sean obvias. Asegúrate de incluir cualquier importación necesaria. 
NUNCA escribas nada antes del bloque \`\`\`python\`\`\`. Después de generar el código, revisa cuidadosamente para asegurarte de que no hay errores ni inconsistencias. Si hay errores, enuméralos en etiquetas <error> y luego genera una nueva versión con esos errores corregidos. Si no hay errores, escribe "CHECKED: NO ERRORS" en etiquetas <error>.`,
        },
        mailCategorizer: {
          title: 'Categorizador de Correos',
          prompt: `Eres un agente de servicio al cliente encargado de clasificar correos por tipo. Por favor, proporciona tu respuesta y justifica tu clasificación. 

Las categorías de clasificación son: 
(A) Pregunta antes de la venta 
(B) Artículo roto o defectuoso 
(C) Pregunta de facturación 
(D) Otro (por favor, explica)

¿Cómo clasificarías este correo?`,
        },
        fitnessCoach: {
          title: 'Entrenador Personal de Fitness',
          prompt: `Eres un entrenador personal entusiasta y positivo llamado Sam. Sam es apasionado por ayudar a los clientes a ponerse en forma y llevar estilos de vida más saludables. Escribes en un tono alentador y amigable y siempre intentas guiar a tus clientes hacia mejores metas de fitness. Si el usuario te pregunta algo no relacionado con el fitness, o lleva el tema de vuelta al fitness o dices que no puedes responder.`,
        },
      },
      create: {
        pageTitle: 'Crear Mi Bot',
      },
      edit: {
        pageTitle: 'Editar Mi Bot',
      },

      item: {
        title: 'Nombre',
        description: 'Descripción',
        instruction: 'Instrucciones',
      },
      explore: {
        label: {
          pageTitle: 'Consola de Bots',
        },
      },
      apiSettings: {
        pageTitle: 'Configuración de Publicación de API de Bot Compartido',
        label: {
          endpoint: 'Punto de Acceso de API',
          usagePlan: 'Plan de Uso',
          allowOrigins: 'Orígenes Permitidos',
          apiKeys: 'Claves de API',
          period: {
            day: 'Por DÍA',
            week: 'Por SEMANA',
            month: 'Por MES',
          },
          apiKeyDetail: {
            creationDate: 'Fecha de Creación',
            active: 'Activo',
            inactive: 'Inactivo',
            key: 'Clave de API',
          },
        },
        item: {
          throttling: 'Limitación',
          burstLimit: 'Ráfaga',
          rateLimit: 'Límite de Velocidad',
          quota: 'Cuota',
          requestLimit: 'Límite de Solicitudes',
          offset: 'Desplazamiento',
        },
        help: {
          overview:
            'Crear una API permite que las funciones del Bot sean accesibles para clientes externos; las APIs permiten la integración con aplicaciones externas.',
          endpoint: 'El cliente puede usar el Bot desde este punto de acceso.',
          usagePlan:
            'Los planes de uso especifican la cantidad o la tasa de solicitudes que tu API acepta de un cliente. Asocia una API con un plan de uso para rastrear las solicitudes que recibe tu API.',
          throttling:
            'Limita la velocidad con la que los usuarios pueden llamar a tu API.',
          rateLimit:
            'Introduce la tasa, en solicitudes por segundo, que los clientes pueden llamar a tu API.',
          burstLimit:
            'Introduce el número de solicitudes concurrentes que un cliente puede realizar a tu API.',
          quota:
            'Activa las cuotas para limitar el número de solicitudes que un usuario puede realizar a tu API en un período de tiempo determinado.',
          requestLimit:
            'Introduce el número total de solicitudes que un usuario puede hacer en el período de tiempo que selecciones en la lista desplegable.',
          allowOrigins:
            'Orígenes de clientes permitidos para el acceso. Si el origen no está permitido, el solicitante recibe una respuesta 403 Forbidden y se le niega el acceso a la API. El origen debe seguir el formato: "(http|https)://nombre-del-host" o "(http|https)://nombre-del-host:puerto" y se pueden usar comodines (*).',
          allowOriginsExample:
            'p.ej. https://tu-nombre-host.com, https://*.tu-nombre-host.com, http://localhost:8000',
          apiKeys:
            'Una clave de API es una cadena alfanumérica que se utiliza para identificar un cliente de tu API. De lo contrario, el solicitante recibe una respuesta 403 Forbidden y se le niega el acceso a la API.',
        },
        button: {
          ApiKeyShow: 'Mostrar',
          ApiKeyHide: 'Ocultar',
        },
        alert: {
          botUnshared: {
            title: 'Por favor, Comparte El Bot',
            body: 'No puedes publicar una API para el bot que no está compartido.',
          },
          deploying: {
            title: 'El despliegue de la API está en PROGRESO',
            body: 'Por favor, espera hasta que el despliegue esté completo.',
          },
          deployed: {
            title: 'La API ha sido DESPLEGADA',
            body: 'Puedes acceder a la API desde el Cliente usando el Punto de Acceso de la API y la Clave de API.',
          },
          deployError: {
            title: 'ERROR al desplegar la API',
            body: 'Por favor, elimina la API y vuelve a crearla.',
          },
        },
        deleteApiDaialog: {
          title: '¿Eliminar?',
          content:
            '¿Estás seguro de eliminar la API? El punto de acceso de la API será eliminado y el cliente ya no tendrá acceso a ella.',
        },
        addApiKeyDialog: {
          title: 'Agregar Clave de API',
          content: 'Ingresa un nombre para identificar la Clave de API.',
        },
        deleteApiKeyDialog: {
          title: '¿Eliminar?',
          content:
            '¿Estás seguro de eliminar <Bold>{{title}}</Bold>?\nLos clientes que usen esta Clave de API se les negará el acceso a la API.',
        },
      },
      button: {
        newBot: 'Crear Nuevo Bot',
        create: 'Crear',
        edit: 'Editar',
        save: 'Guardar',
        delete: 'Eliminar',
        share: 'Compartir',
        apiSettings: 'Configuración de Publicación de API',
        copy: 'Copiar',
        copied: 'Copiado',
        instructionsSamples: 'Ejemplos',
        chooseFiles: 'Elegir archivos',
      },
      deleteDialog: {
        title: '¿Eliminar?',
        content: '¿Estás seguro de eliminar <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Compartir',
        off: {
          content:
            'La compartición de enlaces está desactivada, por lo que solo tú puedes acceder a este bot a través de su URL.',
        },
        on: {
          content:
            'La compartición de enlaces está activada, por lo que TODOS los usuarios pueden usar este enlace para conversar.',
        },
      },
      error: {
        notSupportedFile: 'Este archivo no es compatible.',
        duplicatedFile: 'Un archivo con el mismo nombre ya ha sido subido.',
        failDeleteApi: 'No se pudo eliminar la API.',
      },
    },
    admin: {
      botAnalytics: {
        label: {
          pageTitle: 'Analíticas de Bot',
          noBotUsages: 'Durante el Período de Cálculo, no se utilizaron bots.',
          published: 'La API está publicada.',
          SearchCondition: {
            title: 'Período de Cálculo',
            from: 'Desde',
            to: 'Hasta',
          },
          sortByCost: 'Ordenar por Costo',
        },
        help: {
          overview:
            'Monitorea el estado de uso de Bots y APIs de Bots Publicadas.',
          calculationPeriod:
            'Si no se establece el Período de Cálculo, se mostrará el costo de hoy.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'Gestión de API',
          publishedDate: 'Fecha de Publicación',
          noApi: 'No hay APIs.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Gestión de Bots',
          sharedUrl: 'URL del Bot Compartido',
          apiSettings: 'Configuración de Publicación de API',
          noKnowledge: 'Este bot no tiene Conocimiento.',
          notPublishApi: 'La API de este bot no está publicada.',
          deployStatus: 'Estado del Despliegue',
          cfnStatus: 'Estado de CloudFormation',
          codebuildStatus: 'Estado de CodeBuild',
          codeBuildId: 'ID de CodeBuild',
          usagePlanOn: 'ACTIVADO',
          usagePlanOff: 'DESACTIVADO',
          rateLimit:
            '<Bold>{{limit}}</Bold> solicitudes por segundo que los clientes pueden hacer a la API.',
          burstLimit:
            'El cliente puede realizar <Bold>{{limit}}</Bold> solicitudes concurrentes a la API.',
          requestsLimit:
            'Puedes hacer <Bold>{{limit}}</Bold> solicitudes <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'No hay Claves de API',
            body: 'Todos los clientes no pueden acceder a la API.',
          },
        },
        button: {
          deleteApi: 'Eliminar API',
        },
      },
      validationError: {
        period: 'Introduce tanto Desde como Hasta',
      },
    },
    deleteDialog: {
      title: '¿Eliminar?',
      content: '¿Estás seguro de eliminar <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: '¿Eliminar TODO?',
      content: '¿Estás seguro de eliminar TODAS las conversaciones?',
    },
    languageDialog: {
      title: 'Cambiar idioma',
    },
    feedbackDialog: {
      title: 'Retroalimentación',
      content: 'Por favor proporciona más detalles.',
      categoryLabel: 'Categoría',
      commentLabel: 'Comentario',
      commentPlaceholder: '(Opcional) Introduce tu comentario',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'No es factualmente correcto',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'No sigue completamente mi solicitud',
        },
        {
          value: 'other',
          label: 'Otro',
        },
      ],
    },
    button: {
      newChat: 'Nuevo Chat',
      botConsole: 'Consola de Bot',
      botAnalytics: 'Analíticas de Bot',
      apiManagement: 'Gestión de API',
      userUsages: 'Usos de Usuario',
      SaveAndSubmit: 'Guardar y Enviar',
      resend: 'Reenviar',
      regenerate: 'Regenerar',
      delete: 'Eliminar',
      deleteAll: 'Eliminar Todo',
      done: 'Hecho',
      ok: 'OK',
      cancel: 'Cancelar',
      back: 'Atrás',
      menu: 'Menú',
      language: 'Idioma',
      clearConversation: 'Eliminar TODAS las conversaciones',
      signOut: 'Cerrar sesión',
      close: 'Cerrar',
      add: 'Agregar',
      continue: 'Continuar generando',
    },
    input: {
      hint: {
        required: '* Requerido',
      },
      validationError: {
        required: 'Este campo es requerido.',
        invalidOriginFormat: 'Formato de Origen Inválido.',
      },
    },
    embeddingSettings: {
      title: 'Configuración de Embeddings',
      description:
        'Puedes configurar los parámetros para las incrustaciones vectoriales. Al ajustar los parámetros, puedes cambiar la precisión de la recuperación de documentos.',
      chunkSize: {
        label: 'Tamaño de Fragmento',
        hint: 'El tamaño de fragmento se refiere al tamaño en el que un documento se divide en segmentos más pequeños',
      },
      chunkOverlap: {
        label: 'Superposición de Fragmentos',
        hint: 'Puedes especificar el número de caracteres superpuestos entre fragmentos adyacentes.',
      },
      enablePartitionPdf: {
        label:
          'Habilitar análisis detallado de PDF. Si está habilitado, el PDF se analizará en detalle con el tiempo.',
        hint: 'Es efectivo cuando deseas mejorar la precisión de búsqueda. Los costos de cálculo aumentan porque el procesamiento toma más tiempo.',
      },
      help: {
        chunkSize:
          'Cuando el tamaño del fragmento es demasiado pequeño, se puede perder información contextual, y cuando es demasiado grande, puede existir información contextual diferente dentro del mismo fragmento, lo que reduce la precisión de la búsqueda.',
        chunkOverlap:
          'Al especificar la superposición de fragmentos, puedes preservar información contextual en los límites de los fragmentos. Aumentar el tamaño del fragmento puede mejorar la precisión de búsqueda. Sin embargo, ten en cuenta que aumentar la superposición de fragmentos puede llevar a mayores costos computacionales.',
        overlapTokens:
          'Configura el número de tokens para superponer o repetir en fragmentos adyacentes. Por ejemplo, si configuras tokens de superposición en 60, los últimos 60 tokens en el primer fragmento también se incluirán al principio del segundo fragmento.',
        maxParentTokenSize:
          'Puedes definir el tamaño de fragmento en la capa de padre. Durante la recuperación, el sistema inicialmente recupera fragmentos secundarios, pero los reemplaza por fragmentos padres más amplios para proporcionar al modelo un contexto más completo',
        maxChildTokenSize:
          'Puedes definir el tamaño de fragmento en la capa de hijo. Durante la recuperación, el sistema inicialmente recupera fragmentos secundarios, pero los reemplaza por fragmentos padres más amplios para proporcionar al modelo un contexto más completo',
        bufferSize:
          'Este parámetro puede influir en cuánta cantidad de texto se examina en conjunto para determinar los límites de cada fragmento, afectando la granularidad y coherencia de los fragmentos resultantes. Un tamaño de buffer mayor podría capturar más contexto, pero también puede introducir ruido, mientras que un tamaño de buffer menor puede omitir contexto importante pero asegura fragmentos más precisos.',
        breakpointPercentileThreshold:
          'Un umbral más alto requiere que las oraciones sean más distinguibles para ser divididas en diferentes fragmentos. Un umbral más alto da como resultado menos fragmentos y generalmente un tamaño promedio de fragmento más grande.',
      },
      alert: {
        sync: {
          error: {
            title: 'Error de División de Oraciones',
            body: 'Intenta nuevamente con un valor menor de superposición de fragmentos',
          },
        },
      },
    },
    generationConfig: {
      title: 'Configuración de Generación',
      description:
        ' Puedes configurar los parámetros de inferencia de LLM para controlar la respuesta de los modelos.',
      maxTokens: {
        label: 'Longitud máxima de generación/nuevos tokens máximos',
        hint: 'El número máximo de tokens permitidos en la respuesta generada',
      },
      temperature: {
        label: 'Temperatura',
        hint: 'Afecta la forma de la distribución de probabilidad para la salida predicha e influye en la probabilidad de que el modelo seleccione salidas de menor probabilidad',
        help: 'Elige un valor menor para influir en que el modelo seleccione salidas de mayor probabilidad; elige un valor mayor para influir en que el modelo seleccione salidas de menor probabilidad',
      },
      topK: {
        label: 'Top-k',
        hint: 'El número de candidatos más probables que el modelo considera para el siguiente token',
        help: 'Elige un valor menor para reducir el tamaño del grupo y limitar las opciones a salidas más probables; elige un valor mayor para aumentar el tamaño del grupo y permitir que el modelo considere salidas menos probables',
      },
      topP: {
        label: 'Top-p',
        hint: 'El porcentaje de candidatos más probables que el modelo considera para el siguiente token',
        help: 'Elige un valor menor para reducir el tamaño del grupo y limitar las opciones a salidas más probables; elige un valor mayor para aumentar el tamaño del grupo y permitir que el modelo considere salidas menos probables',
      },
      stopSequences: {
        label: 'Token de finalización/secuencia de finalización',
        hint: 'Especifica secuencias de caracteres que detienen al modelo de generar más tokens. Usa comas para separar múltiples palabras',
      },
    },
    searchSettings: {
      title: 'Configuración de Búsqueda',
      description:
        'Puedes configurar los parámetros de búsqueda para obtener documentos relevantes de la tienda vectorial.',
      maxResults: {
        label: 'Máx. Resultados',
        hint: 'El número máximo de registros recuperados de la tienda vectorial',
      },
      searchType: {
        label: 'Tipo de Búsqueda',
        hybrid: {
          label: 'Búsqueda híbrida',
          hint: 'Combina las puntuaciones de relevancia de la búsqueda semántica y de texto para proporcionar mayor precisión.',
        },
        semantic: {
          label: 'Búsqueda semántica',
          hint: 'Utiliza incrustaciones vectoriales para ofrecer resultados relevantes.',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'Configuración de Detalle de Conocimiento',
      description:
        'Selecciona el modelo incrustado para configurar el conocimiento y establece el método para dividir los documentos añadidos como conocimiento. Estas configuraciones no se pueden cambiar después de crear el bot.',
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
        label: 'Estrategia de Fragmentación',
        default: {
          label: 'Fragmentación predeterminada',
          hint: 'Divide automáticamente el texto en fragmentos de aproximadamente 300 tokens por defecto. Si un documento es menor o ya tiene 300 tokens, no se divide más.',
        },
        fixed_size: {
          label: 'Fragmentación de tamaño fijo',
          hint: 'Divide el texto en el tamaño de tokens aproximado que configures.',
        },
        hierarchical: {
          label: 'Fragmentación jerárquica',
          hint: 'Divide el texto en estructuras anidadas de fragmentos hijo y padre.',
        },
        semantic: {
          label: 'Fragmentación semántica',
          hint: 'Divide el texto en fragmentos significativos para mejorar la comprensión y la recuperación de información.',
        },
        none: {
          label: 'Sin fragmentación',
          hint: 'Los documentos no se dividirán.',
        },
      },
      chunkingMaxTokens: {
        label: 'Máx. Tokens',
        hint: 'El número máximo de tokens por fragmento',
      },
      chunkingOverlapPercentage: {
        label: 'Porcentaje de Superposición entre Fragmentos',
        hint: 'La superposición del fragmento padre depende del tamaño de token del hijo y del porcentaje de superposición que especifiques para el hijo.',
      },
      overlapTokens: {
        label: 'Tokens de Superposición',
        hint: 'El número de tokens para repetir en fragmentos de la misma capa',
      },
      maxParentTokenSize: {
        label: 'Máx. Tamaño de Token de Padre',
        hint: 'El número máximo de tokens que puede contener un fragmento en la capa de Padre',
      },
      maxChildTokenSize: {
        label: 'Máx. Tamaño de Token de Hijo',
        hint: 'El número máximo de tokens que puede contener un fragmento en la capa de Hijo',
      },
      bufferSize: {
        label: 'Tamaño de Buffer',
        hint: 'el número de oraciones circundantes que se agregarán para la creación de embeddings. Un tamaño de buffer de 1 resulta en 3 oraciones (actual, anterior y siguiente) para ser combinadas e incrustadas',
      },
      breakpointPercentileThreshold: {
        label: 'Umbral percentil de punto de ruptura',
        hint: 'El umbral percentil de distancia/diferencia de oraciones para establecer puntos de ruptura entre las oraciones.',
      },
      opensearchAnalyzer: {
        label: 'Analizador (Tokenización, Normalización)',
        hint: 'Puedes especificar el analizador para tokenizar y normalizar los documentos registrados como conocimiento. Seleccionar un analizador apropiado mejorará la precisión de búsqueda. Elige el analizador óptimo que coincida con el idioma de tu conocimiento.',
        icu: {
          label: 'Analizador ICU',
          hint: 'Para tokenización, {{tokenizer}} se usa, y para normalización, {{normalizer}} se usa.',
        },
        kuromoji: {
          label: 'Analizador Japonés (kuromoji)',
          hint: 'Para tokenización, {{tokenizer}} se usa, y para normalización, {{normalizer}} se usa.',
        },
        none: {
          label: 'Analizador predeterminado del sistema',
          hint: 'Se usará el analizador predeterminado definido por el sistema (OpenSearch).',
        },
        tokenizer: 'Tokenizador:',
        normalizer: 'Normalizador:',
        token_filter: 'Filtro de Token:',
        not_specified: 'No especificado',
      },
    },
    error: {
      answerResponse: 'Ocurrió un error mientras se respondía.',
      notFoundConversation:
        'Dado que el chat especificado no existe, se muestra una nueva pantalla de chat.',
      notFoundPage: 'La página que buscas no se encontró.',
      unexpectedError: {
        title: 'Ocurrió un error inesperado.',
        restore: 'Ir a la página PRINCIPAL',
      },
      predict: {
        general: 'Ocurrió un error mientras se predecía.',
        invalidResponse:
          'Respuesta inesperada recibida. El formato de respuesta no coincide con el esperado.',
      },
      notSupportedImage: 'El modelo seleccionado no soporta imágenes.',
      unsupportedFileFormat:
        'El formato de archivo seleccionado no es compatible.',
      totalFileSizeToSendExceeded:
        'El tamaño total del archivo no debe superar {{maxSize}}.',
      attachment: {
        fileSizeExceeded:
          'El tamaño de cada documento no debe superar {{maxSize}}.',
        fileCountExceeded: 'No se pudo subir más de {{maxCount}} archivos.',
      },
    },
    validation: {
      title: 'Error de Validación',
      maxRange: {
        message: 'El valor máximo que se puede configurar es {{size}}',
      },
      minRange: {
        message: 'El valor mínimo que se puede configurar es {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message:
          'La superposición de fragmentos debe configurarse en menos que el tamaño del fragmento',
      },
      parentTokenRange: {
        message: 'El tamaño de token del padre debe ser mayor que el del hijo',
      },
      quickStarter: {
        message:
          'Por favor, introduce tanto el Título como el Ejemplo de Conversación.',
      },
    },
    helper: {
      shortcuts: {
        title: 'Teclas de Acceso Rápido',
        items: {
          focusInput: 'Enfocar entrada de chat',
          newChat: 'Abrir nuevo chat',
        },
      },
    },
    guardrails: {
      title: 'Guardrails',
      label: 'Habilitar Guardrails para Amazon Bedrock',
      hint: 'Los Guardrails para Amazon Bedrock se usan para implementar medidas de seguridad específicas de la aplicación según tus casos de uso y políticas de IA responsable.',
      harmfulCategories: {
        label: 'Categorías de Contenido Dañino',
        hint: 'Configura filtros de contenido ajustando el grado de filtrado para detectar y bloquear entradas de usuario y respuestas del modelo dañinas que violen tus políticas de uso. 0: desactivar, 1: bajo, 2: medio, 3: Alto',
        hate: {
          label: 'Odio',
          hint: 'Describe indicaciones de entrada y respuestas del modelo que discriminan, critican, insultan, denuncian o deshumanizan a una persona o grupo en función de una identidad (como raza, etnia, género, religión, orientación sexual, habilidad y origen nacional). 0: desactivar, 1: bajo, 2: medio, 3: Alto',
        },
        insults: {
          label: 'Insultos',
          hint: 'Describe indicaciones de entrada y respuestas del modelo que incluyen lenguaje degradante, humillante, burlón, insultante o despectivo. Este tipo de lenguaje también se etiqueta como acoso. 0: desactivar, 1: bajo, 2: medio, 3: Alto',
        },
        sexual: {
          label: 'Sexual',
          hint: 'Describe indicaciones de entrada y respuestas del modelo que indican interés, actividad o excitación sexual utilizando referencias directas o indirectas a partes del cuerpo, rasgos físicos o sexo. 0: desactivar, 1: bajo, 2: medio, 3: Alto',
        },
        violence: {
          label: 'Violencia',
          hint: 'Describe indicaciones de entrada y respuestas del modelo que incluyen glorificación de amenazas o intención de infligir dolor físico, daño o lesión hacia una persona, grupo o cosa. 0: desactivar, 1: bajo, 2: medio, 3: Alto',
        },
        misconduct: {
          label: 'Conducta Inapropiada',
          hint: 'Describe indicaciones de entrada y respuestas del modelo que buscan o proporcionan información sobre actividades inapropiadas o malintencionadas, o de cómo dañar, defraudar o aprovecharse de una persona, grupo o institución. 0: desactivar, 1: bajo, 2: medio, 3: Alto',
        },
      },
      contextualGroundingCheck: {
        label: 'Verificación de Fundamento Contextual',
        hint: 'Usa esta política para validar si las respuestas del modelo están fundamentadas en la fuente de referencia y son relevantes para la consulta del usuario para filtrar la alucinación del modelo.',
        groundingThreshold: {
          label: 'Fundamento',
          hint: 'Valida si las respuestas del modelo están fundamentadas y son factualmente correctas en función de la información proporcionada en la fuente de referencia y bloquea las respuestas que estén por debajo del umbral de fundamento definido. 0: no bloquea nada, 0.99: bloquea casi todo',
        },
        relevanceThreshold: {
          label: 'Relevancia',
          hint: 'Valida si las respuestas del modelo son relevantes para la consulta del usuario y bloquea las respuestas que estén por debajo del umbral de relevancia definido. 0: no bloquea nada, 0.99: bloquea casi todo',
        },
      },
    },
  },
};

export default translation;
