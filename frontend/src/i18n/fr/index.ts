const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Envoyer message',
      starredBots: 'Bots favoris',
      recentlyUsedBots: 'Bots récemment utilisés',
      conversationHistory: 'Historique',
      chatWaitingSymbol: '▍',
    },
    bot: {
      label: {
        myBots: 'Mes Bots',
        recentlyUsedBots: 'Bots partagés récemment utilisés',
        knowledge: 'Connaissance',
        url: 'URL',
        sitemap: 'URL de la sitemap',
        file: 'Fichier',
        loadingBot: 'Chargement...',
        normalChat: 'Chat',
        notAvailableBot: '[NON Disponible]',
        notAvailableBotInputMessage: 'Ce bot n\'est PAS disponbile.',
        noDescription: 'Aucune Description',
        notAvailable: 'Ce bot n\'est PAS disponbile.',
        noBots: 'Pas de bots.',
        noBotsRecentlyUsed: 'Aucun bot partagé récement utilisé.',
        retrievingKnowledge: '[Récupération de la connaissance...]',
        dndFileUpload:
          'Vous pouvez télécharger vos fichier en glissé/déposé.\nFichiers supportés: {{fileExtensions}}',
        uploadError: 'Message d\'erreur',
        syncStatus: {
          queue: 'En attente de syncrhonisation',
          running: 'Synchronisation',
          success: 'Synchronisation terminée',
          fail: 'Erreur de synchronisation',
        },
        fileUploadStatus: {
          uploading: 'Téléchargement...',
          uploaded: 'Téléchargé',
          error: 'ERREUR',
        },
      },
      titleSubmenu: {
        edit: 'Editer',
        copyLink: 'Copier le lien',
        copiedLink: 'Copié',
      },
      help: {
        overview:
          'Les bots fonctionnent selon des instructions prédéfinies. Les chats ne fonctionnent pas comme prévu à moins que le contexte ne soit défini dans le message, mais avec les bots, il n\'est pas nécessaire de définir le contexte.',
				instructions: 'Définissez comment le bot doit se comporter. Donner des instructions ambiguës peut entraîner des résultats imprévisibles, alors fournissez des instructions claires et spécifiques.',
        knowledge: {
        	overview: 'En fournissant des connaissances externes au bot, il devient capable de gérer des données sur lesquelles il n\'a pas été pré-entraîné.',
        	url: 'Les informations de l\'URL spécifiée seront utilisées comme connaissances. Si vous définissez l\'URL d\'une vidéo YouTube, la transcription de cette vidéo sera utilisée comme connaissance.',
          sitemap: 'En spécifiant l\'URL du sitemap, les informations obtenues par le scraping automatique des sites Web qu\'il contient seront utilisées comme base de connaissances.',
          file: 'Les fichiers téléchargés seront utilisés comme base de connaissances.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Erreur de synchronisation de la base de connaissance',
            body: 'Une erreur s\'est produite lors de la syncrhonisation de la base de connaissance. Merci d\'analyser le message suivant :',
          },
          incomplete: {
            title: 'Pas Prêt',
            body: 'Ce bot n\'a pas terminé la synchronisation des connaissances, donc les connaissances avant la mise à jour sont utilisées.',
          },
        },
      },
      samples: {
        title: 'Exemples d\'instructions',
        anthropicLibrary: {
          title: 'Bibliothèque de prompt d\'Anthropic',
          sentence: 'Avez-vous besoin de plus d\'exemples ? Visitez : ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Assistant de codage en Python',
          prompt: `Write a short and high-quality python script for the given task, something a very skilled python expert would write. You are writing code for an experienced developer so only add comments for things that are non-obvious. Make sure to include any imports required. 
NEVER write anything before the \`\`\`python\`\`\` block. After you are done generating the code and after the \`\`\`python\`\`\` block, check your work carefully to make sure there are no mistakes, errors, or inconsistencies. If there are errors, list those errors in <error> tags, then generate a new version with those errors fixed. If there are no errors, write "CHECKED: NO ERRORS" in <error> tags.`,
        },
        mailCategorizer: {
          title: 'Classifieur de mails',
          prompt: `You are a customer service agent tasked with classifying emails by type. Please output your answer and then justify your classification. 

The classification categories are: 
(A) Pre-sale question 
(B) Broken or defective item 
(C) Billing question 
(D) Other (please explain)

How would you categorize this email?`,
        },
        fitnessCoach: {
          title: 'Coach personnel de fitness',
          prompt: `You are an upbeat, enthusiastic personal fitness coach named Sam. Sam is passionate about helping clients get fit and lead healthier lifestyles. You write in an encouraging and friendly tone and always try to guide your clients toward better fitness goals. If the user asks you something unrelated to fitness, either bring the topic back to fitness, or say that you cannot answer.`,
        },
      },
      create: {
        pageTitle: 'Créer mon Bot',
      },
      edit: {
        pageTitle: 'Modifier mon Bot',
      },
      item: {
        title: 'Nom',
        description: 'Description',
        instruction: 'Instructions',
      },
      button: {
        newBot: 'Créer un nouveau bot',
        create: 'Créer',
        edit: 'Modifier',
        delete: 'Supprimer',
        share: 'Partager',
        copy: 'Copier',
        copied: 'Copié',
        instructionsSamples: 'Exemples',
        chooseFiles: 'Choisir les fichiers',
      },
      deleteDialog: {
        title: 'Supprimer ?',
        content: 'Êtes-vous sûr de vouloir supprimer <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Partager',
        off: {
          content:
            'Le partage de lien est désactivé, donc seul vous pouvez accéder à ce bot via son URL.',
        },
        on: {
          content:
            'Le partage de lien est activé, donc TOUS les utilisateurs peuvent utiliser ce lien pour converser.',
        },
      },
      error: {
        notSupportedFile: 'Ce fichier n\'est pas pris en charge.',
        duplicatedFile: 'Un fichier avec le même nom a été téléchargé.',
      },
    },
    deleteDialog: {
      title: 'Supprimer ?',
      content: 'Êtes-vous sur de vouloir supprimer <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'TOUT supprimer ?',
      content: 'Êtes-vous sur de vouloir supprimer TOUTES les conversations ?',
    },
    languageDialog: {
      title: 'SChanger de langue',
    },
    button: {
      newChat: 'Nouveau Chat',
      botConsole: 'Console bot',
      SaveAndSubmit: 'Enregistrer et Envoyer',
      resend: 'Rennvoyer',
      regenerate: 'Regénérer',
      delete: 'Supprimer',
      deleteAll: 'Tout supprimer',
      done: 'Terminé',
      ok: 'OK',
      cancel: 'Annuler',
      back: 'Retour',
      menu: 'Menu',
      language: 'Langue',
      clearConversation: 'Supprimer TOUTES les conversations',
      signOut: 'Se déconnecter',
      close: 'Fermer',
      add: 'Ajouter',
    },
    input: {
      hint: {
        required: '* Requis',
      },
    },
    error: {
      answerResponse: 'An error occurred while responding.',
      notFoundConversation:
        'Since the specified chat does not exist, a new chat screen is displayed.',
      notFoundPage: 'The page you are looking for is not found.',
      predict: {
        general: 'Une erreur s\'est produite lors de la prédiction.',
        invalidResponse:
          'Réponse inattendue reçue. Le format de la réponse ne correspond pas au format attendu.',
      },
      notSupportedImage: 'Le modèle sélectionné ne prend pas en charge les images.',
    },
  },
};

export default translation;
