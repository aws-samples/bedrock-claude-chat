const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Iniciar sesión',
      },
    },
    app: {
      name: 'Bedrock Claude Chat',
      nameWithoutClaude: 'Bedrock Chat',
      inputMessage: 'Enviar un mensaje',
      starredBots: 'Bots Favoritos',
      recentlyUsedBots: 'Bots Usados Recientemente',
      conversationHistory: 'Historial',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Solo Administradores',
    },
    bot: {
      label: {
        myBots: 'Mis Bots',
        recentlyUsedBots: 'Bots Compartidos Usados Recientemente',
        knowledge: 'Conocimiento',
        url: 'URL',
        sitemap: 'URL del Mapa del Sitio',
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
        dndFileUpload: 'Puedes subir archivos arrastrando y soltando.\nArchivos soportados: {{fileExtensions}}',
        uploadError: 'Error al subir',
        referenceLink: 'Enlace de Referencia',
        syncStatus: {
          queue: 'Sincronización en Espera',
          running: 'Sincronizando',
          success: 'Sincronización Completada',
          fail: 'Sincronización Fallida',
        },
        fileUploadStatus: {
          uploading: 'Subiendo...',
          uploaded: 'Subido',
          error: 'ERROR',
        },
      },
      titleSubmenu: {
        edit: 'Editar',
        copyLink: 'Copiar Enlace',
        copiedLink: 'Copiado',
      },
      help: {
        overview: 'Los bots operan según instrucciones predefinidas. El chat no funciona como se espera a menos que el contexto esté definido en el mensaje, pero con los bots, no es necesario definir el contexto.',
        instructions: 'Define cómo debe comportarse el bot. Dar instrucciones ambiguas puede llevar a movimientos impredecibles, por lo tanto, proporciona instrucciones claras y específicas.',
        knowledge: {
          overview: 'Al proporcionar conocimiento externo al bot, este puede manejar datos sobre los que no ha sido preentrenado.',
          url: 'La información de la URL especificada se utilizará como Conocimiento. Si configuras la URL de un video de YouTube, la transcripción de ese video se utilizará como Conocimiento.',
          sitemap: 'Al especificar la URL del mapa del sitio, la información obtenida al raspar automáticamente los sitios web dentro de él se utilizará como Conocimiento.',
          file: 'Los archivos subidos se utilizarán como Conocimiento.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Error de Sincronización de Conocimiento',
            body: 'Ocurrió un error durante la sincronización de Conocimiento. Por favor revisa el siguiente mensaje:',
          },
          incomplete: {
            title: 'NO Listo',
            body: 'Este bot no ha completado la sincronización de conocimiento, por lo que se utiliza el conocimiento antes de la actualización.',
          },
        },
      },
      samples: {
        title: 'Muestras de Instrucciones',
        anthropicLibrary: {
          title: 'Biblioteca de Peticiones Antropicas',
          sentence: '¿Necesitas más ejemplos? Visita: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Asistente de Código Python',
          prompt: `Escribe un script de python corto y de alta calidad para la tarea dada, algo que escribiría un experto en python muy hábil. Estás escribiendo código para un desarrollador experimentado, así que solo añade comentarios para cosas que no son obvias. Asegúrate de incluir cualquier importación requerida. 
NUNCA escribas nada antes del bloque \`\`\`python\`\`\`. Después de haber terminado de generar el código y después del bloque \`\`\`python\`\`\`, revisa tu trabajo cuidadosamente para asegurarte de que no hay errores, fallos o inconsistencias. Si hay errores, enumera esos errores en etiquetas <error>, luego genera una nueva versión con esos errores corregidos. Si no hay errores, escribe "VERIFICADO: SIN ERRORES" en etiquetas <error>.`,
        },
        mailCategorizer: {
          title: 'Categorizador de Correos',
          prompt: `Eres un agente de servicio al cliente encargado de clasificar correos electrónicos por tipo. Por favor, emite tu respuesta y luego justifica tu clasificación. 

Las categorías de clasificación son: 
(A) Pregunta de pre-venta 
(B) Artículo roto o defectuoso 
(C) Pregunta de facturación 
(D) Otro (por favor explica)

¿Cómo clasificarías este correo electrónico?`,
        },
        fitnessCoach: {
          title: 'Entrenador Personal de Fitness',
          prompt: `Eres un entrenador personal de fitness entusiasta y animado llamado Sam. Sam es apasionado por ayudar a los clientes a ponerse en forma y llevar estilos de vida más saludables. Escribes en un tono alentador y amistoso y siempre tratas de guiar a los clientes hacia mejores objetivos de fitness. Si el usuario pregunta algo no relacionado con el fitness, vuelve a llevar el tema al fitness, o di que no puedes responder.`,
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
      apiSettings: {
        pageTitle: 'Configuración de Publicación API de Bot Compartido',
        label: {
          endpoint: 'Punto Final de API',
          usagePlan: 'Plan de Uso',
          allowOrigins: 'Orígenes Permitidos',
          apiKeys: 'Claves API',
          period: {
            day: 'Por DÍA',
            week: 'Por SEMANA',
            month: 'Por MES',
          },
          apiKeyDetail: {
            creationDate: 'Fecha de creación',
            active: 'Activo',
            inactive: 'Inactivo',
            key: 'Clave API',
          },
        },
        item: {
          throttling: 'Limitación',
          burstLimit: 'Límite de ráfaga',
          rateLimit: 'Límite de tasa',
          quota: 'Cuota',
          requestLimit: 'Límites de solicitud',
          offset: 'Compensación',
        },
        help: {
          overview: "Crear una API permite que las funciones del Bot sean accesibles por clientes externos; las APIs permiten la integración con aplicaciones externas.",
          endpoint: 'El cliente puede usar el Bot desde este punto final.',
          usagePlan: 'Los planes de uso especifican el número o la tasa de solicitudes que tu API acepta de un cliente. Asocia una API con un plan de uso para rastrear las solicitudes que recibe tu API.',
          throttling: 'Limita la tasa a la que los usuarios pueden llamar a tu API.',
          rateLimit: 'Ingresa la tasa, en solicitudes por segundo, que los clientes pueden llamar a tu API.',
          burstLimit: 'Ingresa el número de solicitudes concurrentes que un cliente puede hacer a tu API.',
          quota: 'Activa las cuotas para limitar el número de solicitudes que un usuario puede hacer a tu API en un período de tiempo dado.',
          requestLimit: 'Ingresa el número total de solicitudes que un usuario puede hacer en el período de tiempo que selecciones en la lista desplegable.',
          allowOrigins: 'Orígenes de clientes permitidos para el acceso. Si el origen no está permitido, el llamador recibe una respuesta 403 Prohibido y se le niega el acceso a la API. El origen debe seguir el formato: "(http|https)://nombre-de-host" o "(http|https)://nombre-de-host:puerto" y se pueden usar comodines(*).',
          allowOriginsExample: 'ej. https://tu-nombre-de-host.com, https://*.tu-nombre-de-host.com, http://localhost:8000',
          apiKeys: 'Una clave API es una cadena alfanumérica que se utiliza para identificar a un cliente de tu API. De lo contrario, el llamador recibe una respuesta 403 Prohibido y se le niega el acceso a la API.',
        },
        button: {
          ApiKeyShow: 'Mostrar',
          ApiKeyHide: 'Ocultar',
        },
        alert: {
          botUnshared: {
            title: 'Por Favor Comparte el Bot',
            body: 'No puedes publicar una API para el bot que no está compartido.',
          },
          deploying: {
            title: 'La implementación de la API está en PROGRESO',
            body: 'Por favor espera hasta que la implementación esté completa.',
          },
          deployed: {
            title: 'La API ha sido DESPLEGADA',
            body: 'Puedes acceder a la API desde el Cliente usando el Punto Final de API y la Clave API.',
          },
          deployError: {
            title: 'FALLÓ la implementación de la API',
            body: 'Por favor elimina la API y vuelve a crearla.',
          },
        },
        deleteApiDaialog: {
          title: '¿Eliminar?',
          content: '¿Estás seguro de eliminar la API? El punto final de la API será eliminado, y el cliente ya no tendrá acceso a ella.',
        },
        addApiKeyDialog: {
          title: 'Agregar Clave API',
          content: 'Ingresa un nombre para identificar la Clave API.',
        },
        deleteApiKeyDialog: {
          title: '¿Eliminar?',
          content: '¿Estás seguro de eliminar <Bold>{{title}}</Bold>?\nLos clientes que usan esta Clave API se les negará el acceso a la API.',
        },
      },
      button: {
        newBot: 'Crear Nuevo Bot',
        create: 'Crear',
        edit: 'Editar',
        delete: 'Eliminar',
        share: 'Compartir',
        apiSettings: 'Configuración de Publicación de API',
        copy: 'Copiar',
        copied: 'Copiado',
        instructionsSamples: 'Muestras',
        chooseFiles: 'Elegir archivos',
      },
      deleteDialog: {
        title: '¿Eliminar?',
        content: '¿Estás seguro de eliminar <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Compartir',
        off: {
          content: 'La compartición de enlace está desactivada, por lo tanto, solo tú puedes acceder a este bot a través de su URL.',
        },
        on: {
          content: 'La compartición de enlace está activada, por lo que TODOS los usuarios pueden usar este enlace para conversación.',
        },
      },
      error: {
        notSupportedFile: 'Este archivo no es compatible.',
        duplicatedFile: 'Se ha subido un archivo con el mismo nombre.',
        failDeleteApi: 'Error al eliminar la API.',
      },
    },
    admin: {
      sharedBotAnalytics: {
        label: {
          pageTitle: 'Análisis de Bots Compartidos',
          noPublicBotUsages: 'Durante el Período de Cálculo, no se utilizaron bots públicos.',
          published: 'API publicada.',
          SearchCondition: {
            title: 'Período de Cálculo',
            from: 'Desde',
            to: 'Hasta',
          },
          sortByCost: 'Ordenar por Costo',
        },
        help: {
          overview: 'Monitorea el estado de uso de Bots Compartidos y APIs de Bots Publicadas.',
          calculationPeriod: 'Si no se establece el Período de Cálculo, se mostrará el costo de hoy.',
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
          sharedUrl: 'URL de Bot Compartido',
          apiSettings: 'Configuración de Publicación de API',
          noKnowledge: 'Este bot no tiene Conocimiento.',
          notPublishApi: 'La API de este bot no está publicada.',
          deployStatus: 'Estado de Despliegue',
          cfnStatus: 'Estado de CloudFormation',
          codebuildStatus: 'Estado de CodeBuild',
          codeBuildId: 'ID de CodeBuild',
          usagePlanOn: 'ACTIVADO',
          usagePlanOff: 'DESACTIVADO',
          rateLimit: '<Bold>{{limit}}</Bold> solicitudes por segundo, que los clientes pueden hacer a la API.',
          burstLimit: 'El cliente puede hacer <Bold>{{limit}}</Bold> solicitudes concurrentes a la API.',
          requestsLimit: 'Puedes hacer <Bold>{{limit}}</Bold> solicitudes <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'No hay Claves API',
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
    button: {
      newChat: 'Chat Nuevo',
      botConsole: 'Consola de Bot',
      sharedBotAnalytics: 'Análisis de Bots Compartidos',
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
      continue: 'Seguir generando',
    },
    input: {
      hint: {
        required: '* Requerido',
      },
      validationError: {
        required: 'Este campo es obligatorio.',
        invalidOriginFormat: 'Formato de origen inválido.',
      },
    },
    embeddingSettings: {
      title: 'Configuración de Incrustación',
      description: 'Puedes configurar los parámetros para las incrustaciones vectoriales. Al ajustar los parámetros, puedes cambiar la precisión de la recuperación de documentos.',
      chunkSize: {
        label: 'tamaño de fragmento',
        hint: 'El tamaño del fragmento se refiere al tamaño en que un documento se divide en segmentos más pequeños',
      },
      chunkOverlap: {
        label: 'solapamiento de fragmentos',
        hint: 'Puedes especificar el número de caracteres superpuestos entre fragmentos adyacentes.',
      },
      help: {
        chunkSize: "Cuando el tamaño del fragmento es demasiado pequeño, se puede perder información contextual, y cuando es demasiado grande, puede existir diferente información contextual dentro del mismo fragmento, lo que puede reducir la precisión de la búsqueda.",
        chunkOverlap: 'Al especificar el solapamiento de fragmentos, puedes preservar la información contextual alrededor de los límites de los fragmentos. Aumentar el tamaño del fragmento puede mejorar a veces la precisión de la búsqueda. Sin embargo, ten en cuenta que aumentar el solapamiento de los fragmentos puede llevar a costos computacionales más altos.',
      },
      alert: {
        sync: {
          error: {
            title: 'Error del Divisor de Frases',
            body: 'Intenta nuevamente con un valor de solapamiento de fragmentos menor',
          },
        },
      },
    },
    error: {
      answerResponse: 'Ocurrió un error al responder.',
      notFoundConversation: 'Dado que el chat especificado no existe, se muestra una nueva pantalla de chat.',
      notFoundPage: 'La página que buscas no se encuentra.',
      predict: {
        general: 'Ocurrió un error al predecir.',
        invalidResponse: 'Se recibió una respuesta inesperada. El formato de la respuesta no coincide con el formato esperado.',
      },
      notSupportedImage: 'El modelo seleccionado no admite imágenes.',
    },
    validation: {
      title: 'Error de Validación',
      maxRange: {
        message: 'El valor máximo que se puede establecer es {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message: 'El solapamiento de fragmentos debe ser menor que el tamaño de fragmento',
      },
    },
  },
};

export default translation;
