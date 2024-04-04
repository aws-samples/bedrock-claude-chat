const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: 'Envoyer un message',
      starredBots: 'Epingler un bot',
      recentlyUsedBots: 'Bot utilisé récemment',
      conversationHistory: 'Historique',
      chatWaitingSymbol: '▍',
    },
    bot: {
      label: {
        myBots: 'Mes bots',
        recentlyUsedBots: 'Bots partagés utilisés récemment',
        knowledge: 'Connaissance',
        url: 'URL',
        sitemap: 'Sitemap URL',
        file: 'Fichier',
        loadingBot: 'Chargement...',
        normalChat: 'Chat',
        notAvailableBot: '[Indisponible]',
        notAvailableBotInputMessage: "Ce Bot n'est pas disponible.",
        noDescription: 'Aucune description',
        notAvailable: "Ce Bot n'est pas disponible.",
        noBots: 'Aucun bots.',
        noBotsRecentlyUsed: 'Aucun bot partagé utilisé récemment',
        retrievingKnowledge: '[Récupération des connaissances...]',
        dndFileUpload:
          'Vous pouvez télécharger des fichiers en les déposants.\nType de fichiers supportés: {{fileExtensions}}',
        uploadError: "Message d'erreur",
        syncStatus: {
          queue: 'En attente de synchronisation',
          running: 'Synchronisation',
          success: 'Synchronisation terminée',
          fail: 'Erreur lors de la synchronisation',
        },
        fileUploadStatus: {
          uploading: 'Chargement du fichier...',
          uploaded: 'Fichier chargé',
          error: 'ERREUR',
        },
      },
      titleSubmenu: {
        edit: 'Modifier',
        copyLink: 'Copier le lien',
        copiedLink: 'Copié',
      },
      help: {
        overview:
          "Les robots fonctionnent selon des instructions prédéfinies. Le chat ne fonctionne pas comme prévu à moins que le contexte ne soit défini dans le message, mais avec les robots, il n'est pas nécessaire de définir le contexte.",
        instructions:
          'Définissez comment le bot doit se comporter. Donner des instructions ambiguës peut conduire à des comportements imprévisibles, alors fournissez des instructions claires et spécifiques.',
        knowledge: {
          overview:
            "En fournissant des connaissances externes au bot, celui-ci devient capable de gérer des données sur lesquelles il 'a pas été pré-entraîné.",
          url: "Les informations de l'URL spécifiée seront utilisées comme connaissances. Si vous définissez l'URL d'une vidéo YouTube, la transcription de cette vidéo sera utilisée comme connaissance.",
          sitemap:
            "En spécifiant l'URL du plan du site, les informations obtenues en grattant automatiquement les sites Web qu'il contient seront utilisées comme connaissances.",
          file: 'Les fichiers téléchargés seront utilisés comme connaissances.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Erreur de synchronisation des connaissances',
            body: "Une erreur s'est produite lors de la synchronisation de Knowledge. Veuillez vérifier le message suivant :",
          },
          incomplete: {
            title: 'Pas prêt',
            body: "Ce bot n'a pas terminé la synchronisation des connaissances, donc les connaissances avant la mise à jour sont utilisées.",
          },
        },
      },
      samples: {
        title: "Exemple d'instructions",
        anthropicLibrary: {
          title: "Bibliothèque de prompt d'Anthropic",
          sentence: "Avez-vous besoin de plus d'exemples ? Visitez : ",
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Assistant de code Python',
          prompt: `Écrivez un script Python court et de haute qualité pour la tâche donnée, quelque chose qu'un expert Python très qualifié écrirait. Vous écrivez du code pour un développeur expérimenté, ajoutez donc des commentaires uniquement pour les éléments non évidents. Assurez-vous d'inclure toutes les importations requises.
          N'écrivez JAMAIS quoi que ce soit avant le bloc \`\`\`python\`\`\`. Une fois que vous avez fini de générer le code et après le bloc \`\`\`python\`\`\`, vérifiez soigneusement votre travail pour vous assurer qu'il n'y a pas d'erreurs, d'erreurs ou d'incohérences. S'il y a des erreurs, répertoriez ces erreurs dans les balises <error>, puis générez une nouvelle version avec ces erreurs corrigées. S'il n'y a pas d'erreurs, écrivez « CHECKED : NO ERRORS » dans les balises <error>.`,
        },
        mailCategorizer: {
          title: 'Classificateur de courrier',
          prompt: `Vous êtes un agent du service client chargé de classer les e-mails par type. Veuillez indiquer votre réponse, puis justifier votre classification. 

Les catégories de classification sont :
(A) Question préalable à la vente
(B) Article cassé ou défectueux
(C) Question sur la facturation
(D) Autre (veuillez expliquer)
          
Comment catégoriseriez-vous cet e-mail ?`,
        },
        fitnessCoach: {
          title: 'Coach personnel de remise en forme',
          prompt: `Vous êtes un coach de fitness personnel optimiste et enthousiaste nommé Sam. Sam a pour passion d'aider ses clients à se mettre en forme et à mener une vie plus saine. Vous écrivez sur un ton encourageant et amical et essayez toujours de guider vos clients vers de meilleurs objectifs de remise en forme. Si l'utilisateur vous demande quelque chose sans rapport avec la forme physique, ramenez le sujet à la condition physique ou dites que vous ne pouvez pas répondre.`,
        },
      },
      create: {
        pageTitle: 'Créer mon Bot',
      },
      edit: {
        pageTitle: 'Moifier mon Bot',
      },
      item: {
        title: 'Nom',
        description: 'Description',
        instruction: 'Instructions',
      },
      button: {
        newBot: 'Créeer un nouveau Bot',
        create: 'Créer',
        edit: 'Modifier',
        delete: 'Supprimer',
        share: 'Partager',
        copy: 'Copier',
        copied: 'Copié',
        instructionsSamples: 'Exemples',
        chooseFiles: 'Sélectionner un fichier',
      },
      deleteDialog: {
        title: 'Supprimer?',
        content: 'Êtes-vous sûr de vouloir supprimer <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Partager',
        off: {
          content:
            'Le partage de lien est désactivé, vous seul pouvez donc accéder à ce bot via son URL.',
        },
        on: {
          content:
            'Le partage de lien est activé, donc TOUS les utilisateurs peuvent utiliser ce lien pour discuter.',
        },
      },
      error: {
        notSupportedFile: "Ce fichier n'est pas pris en charge.",
        duplicatedFile: 'Un fichier du même nom a été téléchargé.',
      },
    },
    deleteDialog: {
      title: 'Supprimer?',
      content: 'Êtes-vous sûr de vouloir supprimer <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Delete ALL?',
      content: 'Êtes-vous sûr de supprimer TOUTES les conversations ?',
    },
    languageDialog: {
      title: 'Changer de langue',
    },
    button: {
      newChat: 'Nouvelle session',
      botConsole: 'Bot Console',
      SaveAndSubmit: 'Enregistrer et soumettre',
      resend: 'Renvoyer',
      regenerate: 'Regénerer',
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
      answerResponse: "Une erreur s'est produite lors de la réponse.",
      notFoundConversation:
        "Étant donné que le chat spécifié n'existe pas, un nouvel écran de conversation s'affiche.",
      notFoundPage: 'La page que vous recherchez est introuvable.',
      predict: {
        general: "Une erreur s'est produite lors de la prédiction.",
        invalidResponse:
          'Réponse inattendue reçue. Le format de la réponse ne correspond pas au format attendu.',
      },
      notSupportedImage:
        'Le modèle sélectionné ne prend pas en charge les images.',
    },
  },
};

export default translation;
