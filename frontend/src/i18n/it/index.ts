const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Login',
      },
    },
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Inviare un messaggio',
      starredBots: 'Bot preferiti',
      recentlyUsedBots: 'Bot utilizzati di recente',
      conversationHistory: 'Cronologia',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Solo Amministratore',
    },
    bot: {
      label: {
        myBots: 'I miei Bot',
        recentlyUsedBots: 'Bot condivisi utilizzati di recente',
        knowledge: 'Informazioni',
        url: 'URL',
        sitemap: 'URL della mappa del sito',
        file: 'File',
        loadingBot: 'Caricamento...',
        normalChat: 'Chat',
        notAvailableBot: '[NON Disponibile]',
        notAvailableBotInputMessage: 'Questo Bot NON è disponibile.',
        noDescription: 'Nessuna Descrizione',
        notAvailable: 'Questo Bot NON è disponibile.',
        noBots: 'Nessun Bot.',
        noBotsRecentlyUsed: 'Nessun Bot condiviso utilizzato di recente.',
        retrievingKnowledge: '[Recupero delle informazioni...]',
        dndFileUpload:
          'Puoi caricare i file trascinandoli.\nFile supportati: {{fileExtensions}}',
        uploadError: 'Messaggio di errore',
        referenceLink: 'Link di riferimento',
        syncStatus: {
          queue: 'In attesa della sincronizzazione',
          running: 'Sincronizzazione',
          success: 'Sincronizzazione Completata',
          fail: 'Sincronizzazione Fallita',
        },
        fileUploadStatus: {
          uploading: 'Caricamento...',
          uploaded: 'Caricato',
          error: 'ERRORE',
        },
      },
      titleSubmenu: {
        edit: 'Modifica',
        copyLink: 'Copia Link',
        copiedLink: 'Copiato',
      },
      help: {
        overview:
          'I Bot operano secondo istruzioni predefinite. La chat non funziona come previsto a meno che il contesto non sia definito nel messaggio, ma con i Bot non è necessario definire il contesto.',
        instructions:
          'Definisci come dovrebbe comportarsi il Bot. Dare istruzioni ambigue può portare a comportamenti imprevedibili, quindi fornisci istruzioni chiare e specifiche.',
        knowledge: {
          overview:
            'Fornendo conoscenza esterna al Bot, il Bot diventa in grado di gestire dati su cui non è stato pre-addestrato.',
          url: "Le informazioni dall'URL specificato verranno utilizzate come Apprendimento. Se imposti l'URL di un video di YouTube, la trascrizione di quel video verrà utilizzata come Apprendimento.",
          sitemap:
            "Specificando l'URL della mappa del sito, le informazioni ottenute attraverso lo scraping automatico dei siti Web al suo interno verranno utilizzate come Apprendimento.",
          file: 'I file caricati verranno utilizzati come Apprendimento.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Errore di sincronizzazione delle informazioni',
            body: 'Si è verificato un errore durante la sincronizzazione delle informazioni. Si prega di controllare il seguente messaggio:',
          },
          incomplete: {
            title: 'NON pronto',
            body: "Questo Bot non ha completato la sincronizzazione delle informazioni, verranno quindi utilizzate le finformazioni precedenti all'aggiornamento.",
          },
        },
      },
      samples: {
        title: 'Esempi di istruzioni',
        anthropicLibrary: {
          title: 'Biblioteca dei suggerimenti Anthropic',
          sentence: 'Hai bisogno di altri esempi? Visita: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Assistente di codifica Python',
          prompt: `Scrivi uno script Python breve e di alta qualità per l'attività assegnata, qualcosa che scriverebbe un esperto Python molto abile. Stai scrivendo codice per uno sviluppatore esperto, quindi aggiungi commenti solo per cose non ovvie. Assicurati di includere tutte le importazioni richieste.
          Non scrivere MAI nulla prima del blocco \`\`\`python\`\`\`. Dopo aver finito di generare il codice e dopo il blocco \`\`\`python\`\`\`, controlla attentamente il tuo lavoro per assicurarti che non ci siano errori o incoerenze. Se sono presenti errori, elencali nei tag <errori>, quindi genera una nuova versione con gli errori risolti. Se non ci sono errori, scrivere "VERIFICATO: NESSUN ERRORE" nei tag <errori>.`,
        },
        mailCategorizer: {
          title: 'Classificatore di posta',
          prompt: `Sei un agente del servizio clienti incaricato di classificare le e-mail per tipo. Per favore fornisci la tua risposta e poi giustifica la tua classificazione.

Le categorie di classificazione sono:
(A) Domanda prevendita
(B) Articolo rotto o difettoso
(C) Domanda sulla fatturazione
(D) Altro (per favore spiegare)

Come classificheresti questa email?`,
        },
        fitnessCoach: {
          title: 'Istruttore di fitness personale',
          prompt: `Sei un allenatore personale di fitness ottimista ed entusiasta di nome Sam. Sam è appassionato di aiutare i clienti a mettersi in forma e condurre stili di vita più sani. Scrivi con un tono incoraggiante e amichevole e cerchi sempre di guidare i tuoi clienti verso obiettivi di fitness migliori. Se l'utente ti chiede qualcosa che non ha nulla a che vedere con il fitness, riporta l'argomento al fitness oppure che non puoi rispondere.`,
        },
      },
      create: {
        pageTitle: 'Crea il mio Bot',
      },
      edit: {
        pageTitle: 'Modifica il mio Bot',
      },

      item: {
        title: 'Nome',
        description: 'Descrizione',
        instruction: 'Istruzioni',
      },
      apiSettings: {
        pageTitle: 'Configurazioni API Pubbliche del Bot Condiviso',
        label: {
          endpoint: 'Endpoint API',
          usagePlan: 'Piano di utilizzo',
          allowOrigins: 'Origini consentite',
          apiKeys: 'Chiavi API',
          period: {
            day: 'Al GIORNO',
            week: 'Alla SETTIMANA',
            month: 'Al MESE',
          },
          apiKeyDetail: {
            creationDate: 'Data di creazione',
            active: 'Attino',
            inactive: 'Inattivo',
            key: 'Chiavi API',
          },
        },
        item: {
          throttling: 'Limitazione',
          burstLimit: 'Velocità massima di trasferimento',
          rateLimit: 'Richieste al secondo',
          quota: 'Quota',
          requestLimit: 'Richieste',
          offset: 'Slittamento',
        },
        help: {
          overview:
            "La creazione di un'API consente l'accesso alle funzioni del Bot da parte di client e applicazioni esterni.",
          endpoint: 'Il client può utilizzare il Bot da questo endpoint.',
          usagePlan:
            "I piani di utilizzo specificano il numero o la frequenza di richieste che la tua API accetta da un client. Associa un'API a un piano di utilizzo per tenere traccia delle richieste ricevute dalla tua API.",
          throttling: 'Limita la frequenza con cui gli utenti possono chiamare la tua API.',
          rateLimit:
            'Inserisci la velocità, in richieste al secondo, con cui i client possono chiamare la tua API.',
          burstLimit:
            'Inserisci il numero di richieste simultanee che un client può effettuare alla tua API.',
          quota:
            'Attiva le quote per limitare il numero di richieste che un utente può effettuare alla tua API in un determinato periodo di tempo.',
          requestLimit:
            "Inserisci il numero totale di richieste che un utente può effettuare nel periodo di tempo selezionato nell'elenco a discesa.",
          allowOrigins:
            "Origini client consentite per l'accesso. Se l'origine non è consentita, il chiamante riceve una risposta 403 Forbidden e gli viene negato l'accesso all'API. L'origine deve seguire il formato:(http|https)://nome-host o (http|https)://nome-host:porta e possono essere utilizzati i caratteri jolly(*).",
          allowOriginsExample:
            'e.g. https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
          apiKeys:
            "Una chiave API è una stringa alfanumerica utilizzata per identificare un client della tua API. In caso contrario, il chiamante riceve una risposta 403 Forbidden e gli viene negato l'accesso all'API.",
        },
        button: {
          ApiKeyShow: 'Mostra',
          ApiKeyHide: 'Nascondi',
        },
        alert: {
          botUnshared: {
            title: 'Per favore condividi il Bot',
            body: "Non puoi pubblicare un'API per il Bot che non è condivisa.",
          },
          deploying: {
            title: "La distribuzione dell'API è in CORSO",
            body: 'Attendi il completamento della distribuzione.',
          },
          deployed: {
            title: "L'API è stata IMPLEMENTATA",
            body: "Puoi accedere all'API dal client utilizzando l'endpoint API e la chiave API.",
          },
          deployError: {
            title: "IMPOSSIBILE distribuire l'API",
            body: "Elimina l'API e ricreala.",
          },
        },
        deleteApiDaialog: {
          title: 'Eliminare?',
          content:
            "Sei sicuro di eliminare l'API? L'endpoint API verrà eliminato e il client non avrà più accesso ad esso.",
        },
        addApiKeyDialog: {
          title: 'Aggiungi chiave API',
          content: 'Inserisci un nome per identificare la chiave API.',
        },
        deleteApiKeyDialog: {
          title: 'Eliminare?',
          content:
            "Sei sicuro di eliminare <Bold>{{title}}</Bold>?\nAi client che utilizzano questa chiave API verrà negato l'accesso all'API.",
        },
      },
      button: {
        newBot: 'Crea nuovo Bot',
        create: 'Crea',
        edit: 'Modifica',
        delete: 'Elimina',
        share: 'Condividi',
        apiSettings: 'Impostazioni di pubblicazione API',
        copy: 'Copia',
        copied: 'Copiato',
        instructionsSamples: 'Esempi',
        chooseFiles: 'Seleziona files',
      },
      deleteDialog: {
        title: 'Eliminare?',
        content: 'Sei sicuro di eliminare <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Condividi',
        off: {
          content:
            'La condivisione dei collegamenti è disattivata, quindi solo tu puoi accedere a questo Bot tramite il suo URL.',
        },
        on: {
          content:
            'La condivisione dei collegamenti è attiva, quindi TUTTI gli utenti possono utilizzare questo collegamento per conversare.',
        },
      },
      error: {
        notSupportedFile: 'Questo file non è supportato.',
        duplicatedFile: 'È stato caricato un file con lo stesso nome.',
        failDeleteApi: "Impossibile eliminare l'API.",
      },
    },
    admin: {
      sharedBotAnalytics: {
        label: {
          pageTitle: 'Analisi dei Bot condivisi',
          noPublicBotUsages:
            'Durante il Periodo di Calcolo non sono stati utilizzati Bot pubblici.',
          published: "L'API è pubblicata.",
          SearchCondition: {
            title: 'Periodo di calcolo',
            from: 'Dal',
            to: 'Al',
          },
          sortByCost: 'Ordina per costo',
        },
        help: {
          overview:
            'Monitora lo stato di utilizzo dei bot condivisi e delle API dei bot pubblicati.',
          calculationPeriod:
            'Se il periodo di calcolo non è impostato, verrà visualizzato il costo per oggi.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: "Gestione dell'API",
          publishedDate: 'Data di pubblicazione',
          noApi: 'NESSUNA API.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Gestione dei Bot',
          sharedUrl: 'URL del Bot condiviso',
          apiSettings: 'Impostazioni di pubblicazione API',
          noKnowledge: 'Questo Bot non ha Informazioni.',
          notPublishApi: "L'API di questo Bot non è pubblicata.",
          deployStatus: 'Stato di distribuzione',
          cfnStatus: 'Stato di CloudFormation',
          codebuildStatus: 'Stato di CodeBuild',
          codeBuildId: 'CodeBuild ID',
          usagePlanOn: 'ON',
          usagePlanOff: 'OFF',
          rateLimit:
            "<Bold>{{limit}}</Bold> richieste al secondo, che i client possono chiamare l'API.",
          burstLimit:
            "Il client può effettuare <Bold>{{limit}}</Bold> richieste simultanee all'API.",
          requestsLimit:
            'Puoi effettuare <Bold>{{limit}}</Bold> richieste <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'Nessuna chiave API',
            body: "Nessun client può accedere all'API.",
          },
        },
        button: {
          deleteApi: 'Elimina API',
        },
      },
      validationError: {
        period: 'Inserisci sia Dal che Al',
      },
    },
    deleteDialog: {
      title: 'Eliminare?',
      content: 'Sei sicuro di eliminare <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Eliminare Tutto?',
      content: 'Sei sicuro di eliminare TUTTE le conversazioni?',
    },
    languageDialog: {
      title: 'Cambia lingua',
    },
    button: {
      newChat: 'Nuova Chat',
      botConsole: 'Console del Bot',
      sharedBotAnalytics: 'Analisi dei Bot condivisi',
      apiManagement: "Gestione dell'API",
      userUsages: 'Usi degli utenti',
      SaveAndSubmit: 'Salva & invia',
      resend: 'Invia nuovamente',
      regenerate: 'Rigenerare',
      delete: 'Eliminare',
      deleteAll: 'Elimina tutto',
      done: 'Fatto',
      ok: 'OK',
      cancel: 'Annulla',
      back: 'Indietro',
      menu: 'Menu',
      language: 'Lingua',
      clearConversation: 'Elimina TUTTE le conversazioni',
      signOut: 'Disconnessione',
      close: 'Chiudi',
      add: 'Aggiungi',
      continue: 'Continuare a generare',
    },
    input: {
      hint: {
        required: '* Obbligatorio',
      },
      validationError: {
        required: 'Questo campo è obbligatorio.',
        invalidOriginFormat: 'Formato di origine non valido.',
      },
    },
    embeddingSettings: {
      title: 'Impostazione di incorporamento',
      description:
        'È possibile configurare i parametri per gli incorporamenti di vettori. Regolando i parametri, è possibile modificare la precisione del recupero dei documenti.',
      chunkSize: {
        label: 'dimensione del blocco',
        hint: 'La dimensione del blocco si riferisce alla dimensione con cui un documento viene diviso in segmenti più piccoli',
      },
      chunkOverlap: {
        label: 'sovrapposizione dei blocchi',
        hint: 'È possibile specificare il numero di caratteri sovrapposti tra blocchi adiacenti.',
      },
      help: {
        chunkSize:
          "Quando la dimensione del blocco è troppo piccola, le informazioni contestuali possono andare perse, mentre quando è troppo grande possono esistere diverse informazioni contestuali all'interno dello stesso blocco, riducendo potenzialmente la precisione della ricerca.",
        chunkOverlap:
          "Specificando la sovrapposizione dei blocchi, puoi preservare le informazioni contestuali attorno ai limiti dei blocchi. L'aumento della dimensione del blocco a volte può migliorare la precisione della ricerca. Tuttavia, tieni presente che l'aumento della sovrapposizione dei blocchi può portare a costi computazionali più elevati.",
      },
      alert: {
        sync: {
          error: {
            title: 'Errore di suddivisione della frase',
            body: 'Riprovare con un valore di sovrapposizione dei blocchi inferiore',
          },
        },
      },
    },
    error: {
      answerResponse: 'Si è verificato un errore durante la risposta.',
      notFoundConversation:
        'Poiché la chat specificata non esiste, viene visualizzata una nuova schermata di chat.',
      notFoundPage: 'La pagina che stai cercando non è stata trovata.',
      predict: {
        general: 'Si è verificato un errore durante la previsione.',
        invalidResponse:
          'Ricevuta una risposta inaspettata. Il formato della risposta non corrisponde al formato previsto.',
      },
      notSupportedImage: 'Il modello selezionato non supporta le immagini.',
    },
    validation: {
      title: 'Errore di convalida',
      maxRange: {
        message: 'Il valore massimo che può essere impostato è {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message: 'La sovrapposizione dei blocchi deve essere impostata su un valore inferiore alla dimensione del blocco',
      },
    },
  },
};

export default translation;
