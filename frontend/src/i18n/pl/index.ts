const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Zaloguj się',
      },
    },
    app: {
      name: 'Bedrock Chat',
      inputMessage: 'Jak mogę pomóc?',
      pinnedBots: 'Przypięte boty',
      starredBots: 'Ulubione Boty',
      recentlyUsedBots: 'Ostatnio używane Boty',
      conversationHistory: 'Historia',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Administrator',
    },
    model: {
      'claude-v3-haiku': {
        label: 'Claude 3 (Haiku)',
        description:
          'Poprzednia wersja zoptymalizowana pod kątem szybkości i zwięzłości, zapewniająca niemal natychmiastową odpowiedź.',
      },
      'claude-v3.5-sonnet': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Wcześniejsza wersja Claude 3.5. Obsługuje szeroki zakres zadań, ale v2 oferuje lepszą dokładność.',
      },
      'claude-v3.5-sonnet-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'Najnowsza wersja Claude 3.5. Ulepszony model, który bazuje na v1 z większą dokładnością i wydajnością.',
      },
      'claude-v3.5-haiku': {
        label: 'Claude 3.5 (Haiku) v1',
        description:
          'Najnowsza wersja, oferująca jeszcze szybsze odpowiedzi i ulepszone możliwości w porównaniu do Haiku 3.',
      },
      'claude-v4.1-opus': {
        label: 'Claude 4.1 (Opus)',
        description:
          'Model Opus z ulepszonymi możliwościami rozumowania.',
      },
      'claude-v4.5-opus': {
        label: 'Claude 4.5 (Opus)',
        description:
          'Wysoko wydajny model Opus łączący silne zdolności rozumowania z praktyczną wydajnością.',
      },
      'claude-v4.6-opus': {
        label: 'Claude 4.6 (Opus)',
        description:
          'Flagowy model, który planuje staranniej, dłużej utrzymuje zadania agentowe i niezawodnie działa w dużych bazach kodu z oknem kontekstu 1M tokenów.',
      },
      'claude-v4.7-opus': {
        label: 'Claude 4.7 (Opus)',
        description:
          'Wysoko wydajny model Opus stworzony do kodowania, przepływów pracy w przedsiębiorstwach i długotrwałych zadań agentowych.',
      },
      'claude-v3-opus': {
        label: 'Claude 3 (Opus)',
        description: 'Potężny model do wysoce złożonych zadań.',
      },
      'mistral-7b-instruct': {
        label: 'Mistral 7B',
        description: 'Wspiera generowanie tekstu w języku angielskim oraz kodu',
      },
      'mixtral-8x7b-instruct': {
        label: 'Mistral-8x7B',
        description:
          'Popularny, wysokiej jakości model Mixture-of-Experts (MoE), idealny do podsumowywania tekstu, pytań i odpowiedzi, klasyfikacji tekstu, uzupełniania tekstu i generowania kodu.',
      },
      'mistral-large': {
        label: 'Mistral Large',
        description:
          'Idealny do złożonych zadań wymagających znacznych zdolności rozumowania lub wysoce specjalistycznych, takich jak generowanie tekstu syntetycznego lub generowanie kodu.',
      },
      'amazon-nova-pro': {
        label: 'Amazon Nova Pro',
        description:
          'Zaawansowany model multimodalny z najlepszą kombinacją dokładności, szybkości oraz kosztu dla szerokiego zakresu zadań.',
      },
      'amazon-nova-lite': {
        label: 'Amazon Nova Lite',
        description:
          'Tani model multimodalny, który jest błyskawicznie szybki w przetwarzaniu obrazów, wideo i tekstu.',
      },
      'amazon-nova-micro': {
        label: 'Amazon Nova Micro',
        description:
          'Model tylko tekstowy, który zapewnia najniższe opóźnienia odpowiedzi w rodzinie modeli Amazon Nova przy bardzo niskim koszcie.',
      },
      'qwen3-235b-a22b-2507': {
        label: 'Qwen3 235B A22B',
        description:
          'Model Mixture-of-Experts o 235B parametrach z 22B aktywnymi parametrami, oknem kontekstowym 256K i zdolnościami rozumowania do generowania tekstu i kodu.',
      },
      'qwen3-coder-30b-a3b': {
        label: 'Qwen3 Coder 30B A3B',
        description:
          'Model Mixture-of-Experts o 30B parametrach do kodowania z 3B aktywnymi parametrami, oknem kontekstowym 256K, maksymalnym wyjściem 16K i zdolnościami rozumowania do generowania kodu.',
      },
      'qwen3-32b': {
        label: 'Qwen3 32B',
        description:
          'Gęsty model o 32B parametrach z oknem kontekstowym 32K, maksymalnym wyjściem 8K i hybrydowymi trybami myślenia do szybkich odpowiedzi i głębokiego rozumowania.',
      },
    },
    agent: {
      label: 'Agent',
      help: {
        overview:
          'Używając funkcjonalności Agenta, Twój chatbot może automatycznie obsługiwać bardziej złożone zadania.',
      },
      hint: `Agent automatycznie określa, których narzędzi użyć do odpowiedzi na pytania użytkownika. Ze względu na czas potrzebny na decyzję, czas odpowiedzi zwykle jest dłuższy. Aktywacja jednego lub więcej narzędzi włącza funkcjonalność agenta. Odwrotnie, jeśli nie wybrano żadnych narzędzi, funkcjonalność agenta nie jest wykorzystywana. Gdy funkcjonalność agenta jest włączona, wykorzystanie Bazy Wiedzy jest również traktowane jako jedno z narzędzi. Oznacza to, że Baza Wiedzy może nie być wykorzystana w odpowiedziach.`,
      progress: {
        label: 'Myślenie...',
      },
      progressCard: {
        toolInput: 'Wejście: ',
        toolOutput: 'Wyjście: ',
        status: {
          running: 'W trakcie...',
          success: 'Sukces',
          error: 'Błąd',
        },
      },
      tools: {
        get_weather: {
          name: 'Aktualna Pogoda',
          description: 'Pobierz aktualną prognozę pogody.',
        },
        sql_db_query: {
          name: 'Zapytanie do Bazy Danych',
          description:
            'Wykonaj szczegółowe i poprawne zapytanie SQL, aby pobrać wyniki z bazy danych.',
        },
        sql_db_schema: {
          name: 'Schema Bazy Danych',
          description: 'Pobierz schemat i przykładowe wiersze dla listy tabel.',
        },
        sql_db_list_tables: {
          name: 'Lista Tabel Bazy Danych',
          description: 'Wyświetl wszystkie dostępne tabele w bazie danych.',
        },
        sql_db_query_checker: {
          name: 'Sprawdzanie Zapytań',
          description: 'Sprawdź poprawność zapytania SQL przed wykonaniem.',
        },
        internet_search: {
          name: 'Wyszukiwanie w Internecie',
          description: 'Wyszukaj informacje w internecie.',
        },
        knowledge_base_tool: {
          name: 'Pobierz Wiedzę',
          description: 'Pobierz informacje z Bazy Wiedzy.',
        },
      },
    },
    bot: {
      label: {
        myBots: 'Moje Boty',
        recentlyUsedBots: 'Ostatnio Używane Współdzielone Boty',
        knowledge: 'Wiedza',
        url: 'URL',
        s3url: 'Źródło Danych S3',
        sitemap: 'URL Strony',
        file: 'Plik',
        loadingBot: 'Ładowanie...',
        normalChat: 'Czat',
        notAvailableBot: '[Niedostępny]',
        notAvailableBotInputMessage: 'Ten bot jest niedostępny.',
        noDescription: 'Brak Opisu',
        notAvailable: 'Ten bot jest niedostępny.',
        noBots: 'Brak Botów.',
        noBotsRecentlyUsed: 'Brak Ostatnio Używanych Botów Współdzielonych.',
        retrievingKnowledge: '[Pobieranie Wiedzy...]',
        dndFileUpload:
          'Możesz przesłać pliki poprzez przeciągnięcie i upuszczenie.\nObsługiwane pliki: {{fileExtensions}}',
        uploadError: 'Komunikat Błędu',
        referenceLink: 'Link Referencyjny',
        syncStatus: {
          queue: 'Oczekiwanie na Synchronizację',
          running: 'Synchronizacja',
          success: 'Zakończono Synchronizację',
          fail: 'Błąd Synchronizacji',
        },
        fileUploadStatus: {
          uploading: 'Przesyłanie...',
          uploaded: 'Przesłano',
          error: 'BŁĄD',
        },
        quickStarter: {
          title: 'Szybki Start Konwersacji',
          exampleTitle: 'Tytuł',
          example: 'Przykład Konwersacji',
        },
        citeRetrievedContexts: 'Cytowanie Pobranego Kontekstu',
        unsupported: 'Nieobsługiwane, Tylko do Odczytu',
      },
      titleSubmenu: {
        edit: 'Edytuj',
        copyLink: 'Kopiuj Link',
        copiedLink: 'Skopiowano',
      },
      help: {
        overview:
          'Boty działają zgodnie z predefiniowanymi instrukcjami. Czat nie działa zgodnie z oczekiwaniami, jeśli kontekst nie jest zdefiniowany w wiadomości, ale w przypadku botów nie ma potrzeby definiowania kontekstu.',
        instructions:
          'Zdefiniuj, jak bot powinien się zachowywać. Podawanie niejednoznacznych instrukcji może prowadzić do nieprzewidywalnych działań, dlatego należy podawać jasne i konkretne instrukcje.',
        knowledge: {
          overview:
            'Poprzez dostarczenie botowi zewnętrznej wiedzy, staje się on zdolny do obsługi danych, na których nie był wcześniej trenowany.',
          url: 'Informacje z określonego URL będą wykorzystane jako Baza Wiedzy.',
          s3url:
            'Podając URI S3, możesz dodać S3 jako źródło danych. Możesz dodać do 4 źródeł. Obsługuje tylko S3 istniejące w tym samym koncie i regionie co Region Bedrock.',
          sitemap:
            'Określając URL witryny, informacje uzyskane poprzez automatyczne przeszukiwanie stron w niej zawartych będą wykorzystane jako Baza Wiedzy.',
          file: 'Przesłane pliki będą wykorzystane jako Baza Wiedzy.',
          citeRetrievedContexts:
            'Skonfiguruj, czy wyświetlać kontekst pobrany do odpowiedzi na zapytania użytkownika jako informacje o cytowaniu.\nJeśli włączone, użytkownicy mogą uzyskać dostęp do oryginalnych URL-i źródłowych lub plików.',
        },
        quickStarter: {
          overview:
            'Podczas rozpoczynania konwersacji, podaj przykłady. Przykłady pokazują, jak korzystać z bota.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Błąd Synchronizacji Bazy Wiedzy',
            body: 'Wystąpił błąd podczas synchronizacji Bazy Wiedzy. Sprawdź następujący komunikat:',
          },
          incomplete: {
            title: 'NIE Gotowe',
            body: 'Ten bot nie zakończył synchronizacji wiedzy, więc używana jest Baza Wiedzy sprzed aktualizacji.',
          },
        },
      },
      samples: {
        title: 'Przykłady Instrukcji',
        anthropicLibrary: {
          title: 'Biblioteka Promptów Anthropic',
          sentence: 'Potrzebujesz więcej przykładów? Odwiedź: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Asystent Kodowania Python',
          prompt: `Napisz krótki i wysokiej jakości skrypt pythona dla danego zadania, taki jaki napisałby bardzo doświadczony ekspert pythona. Piszesz kod dla doświadczonego programisty, więc dodawaj komentarze tylko do rzeczy nieoczywistych. Pamiętaj o dodaniu wszystkich wymaganych importów. 
NIGDY nie pisz niczego przed blokiem \`\`\`python\`\`\`. Po zakończeniu generowania kodu i po bloku \`\`\`python\`\`\`, sprawdź dokładnie swoją pracę, aby upewnić się, że nie ma błędów, pomyłek lub niespójności. Jeśli są błędy, wylistuj je w tagach <error>, a następnie wygeneruj nową wersję z poprawionymi błędami. Jeśli nie ma błędów, napisz "SPRAWDZONO: BRAK BŁĘDÓW" w tagach <error>.`,
        },
        mailCategorizer: {
          title: 'Kategoryzator E-Maili',
          prompt: `Jesteś agentem obsługi klienta, którego zadaniem jest klasyfikacja e-maili według typu. Proszę podać odpowiedź, a następnie uzasadnić klasyfikację. 

Kategorie klasyfikacji to: 
(A) Pytanie przedsprzedażowe 
(B) Uszkodzony lub wadliwy produkt 
(C) Pytanie dotyczące płatności 
(D) Inne (proszę wyjaśnić)

Jak sklasyfikowałbyś ten e-mail?`,
        },
        fitnessCoach: {
          title: 'Osobisty Trener Fitness',
          prompt: `Jesteś pozytywnym, entuzjastycznym trenerem fitness o imieniu Jan. Jan jest pasjonatem pomagania klientom w osiąganiu formy i prowadzeniu zdrowszego stylu życia. Piszesz w zachęcającym i przyjaznym tonie i zawsze starasz się kierować swoich klientów w stronę lepszych celów fitness. Jeśli użytkownik zapyta Cię o coś niezwiązanego z fitnessem, albo przekieruj temat na fitness, albo powiedz, że nie możesz odpowiedzieć.`,
        },
      },
      create: {
        pageTitle: 'Utwórz Mojego Bota',
      },
      edit: {
        pageTitle: 'Edytuj Mojego Bota',
      },

      item: {
        title: 'Nazwa',
        description: 'Opis',
        instruction: 'Instrukcje',
      },
      explore: {
        label: {
          pageTitle: 'Konsola Bota',
        },
      },
      apiSettings: {
        pageTitle: 'Ustawienia Publikacji API Bota Współdzielonego',
        label: {
          endpoint: 'Endpoint API',
          usagePlan: 'Plan Użytkowania',
          allowOrigins: 'Dozwolone Źródła',
          apiKeys: 'Klucze API',
          period: {
            day: 'Na DZIEŃ',
            week: 'Na TYDZIEŃ',
            month: 'Na MIESIĄC',
          },
          apiKeyDetail: {
            creationDate: 'Data utworzenia',
            active: 'Aktywny',
            inactive: 'Nieaktywny',
            key: 'Klucz API',
          },
        },
        item: {
          throttling: 'Ograniczanie',
          burstLimit: 'Limit zdarzeń',
          rateLimit: 'Limit częstotliwości',
          quota: 'Limit',
          requestLimit: 'Limit żądań',
          offset: 'Przesunięcie',
        },
        help: {
          overview:
            'Utworzenie API umożliwia dostęp do funkcji Bota przez zewnętrznych klientów; API umożliwiają integrację z zewnętrznymi aplikacjami.',
          endpoint: 'Klient może korzystać z Bota z tego endpointu.',
          usagePlan:
            'Plany użytkowania określają liczbę lub częstotliwość żądań, które Twoje API przyjmuje od klienta. Powiąż API z planem użytkowania, aby śledzić żądania otrzymywane przez Twoje API.',
          throttling:
            'Ogranicz częstotliwość, z jaką użytkownicy mogą wywoływać Twoje API.',
          rateLimit:
            'Wprowadź limit częstotliwości (w żądaniach na sekundę), z jaką klienci mogą wywoływać Twoje API.',
          burstLimit:
            'Wprowadź liczbę równoczesnych żądań, które klient może wykonać do Twojego API.',
          quota:
            'Włącz limity, aby ograniczyć liczbę żądań, które użytkownik może wykonać do Twojego API w danym okresie.',
          requestLimit:
            'Wprowadź całkowitą liczbę żądań, które użytkownik może wykonać w okresie wybranym z listy rozwijanej.',
          allowOrigins:
            'Dozwolone źródła pochodzenia klienta. Jeśli źródło nie jest dozwolone, wywołujący otrzyma odpowiedź 403 Forbidden i zostanie odmówiony dostęp do API. Źródło musi być zgodne z formatem: "(http|https)://nazwa-hosta" lub "(http|https)://nazwa-hosta:port" i można używać symboli wieloznacznych(*).',
          allowOriginsExample:
            'np. https://twoja-nazwa-hosta.com, https://*.twoja-nazwa-hosta.com, http://localhost:8000',
          apiKeys:
            'Klucz API to ciąg alfanumeryczny używany do identyfikacji klienta Twojego API. W przeciwnym razie wywołujący otrzyma odpowiedź 403 Forbidden i zostanie odmówiony dostęp do API.',
        },
        button: {
          ApiKeyShow: 'Pokaż',
          ApiKeyHide: 'Ukryj',
        },
        alert: {
          botUnshared: {
            title: 'Proszę Udostępnić Bota',
            body: 'Nie możesz opublikować API dla bota, który nie jest udostępniony.',
          },
          deploying: {
            title: 'Wdrażanie API jest W TOKU',
            body: 'Proszę poczekać do zakończenia wdrożenia.',
          },
          deployed: {
            title: 'API zostało WDROŻONE',
            body: 'Możesz uzyskać dostęp do API z Klienta używając Endpointu API i Klucza API.',
          },
          deployError: {
            title: 'NIE UDAŁO SIĘ wdrożyć API',
            body: 'Proszę usunąć API i utworzyć je ponownie.',
          },
        },
        deleteApiDaialog: {
          title: 'Usunąć?',
          content:
            'Czy na pewno chcesz usunąć API? Endpoint API zostanie usunięty i klient nie będzie miał już do niego dostępu.',
        },
        addApiKeyDialog: {
          title: 'Dodaj Klucz API',
          content: 'Wprowadź nazwę do identyfikacji Klucza API.',
        },
        deleteApiKeyDialog: {
          title: 'Usunąć?',
          content:
            'Czy na pewno chcesz usunąć <Bold>{{title}}</Bold>?\nKlienci używający tego Klucza API będą mieli odmówiony dostęp do API.',
        },
      },
      button: {
        newBot: 'Utwórz Nowego Bota',
        create: 'Utwórz',
        edit: 'Edytuj',
        save: 'Zapisz',
        delete: 'Usuń',
        share: 'Udostępnij',
        apiSettings: 'Ustawienia Publikacji API',
        copy: 'Kopiuj',
        copied: 'Skopiowano',
        instructionsSamples: 'Przykłady',
        chooseFiles: 'Wybierz pliki',
      },
      deleteDialog: {
        title: 'Usunąć?',
        content: 'Czy na pewno chcesz usunąć <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Udostępnij',
        off: {
          content:
            'Udostępnianie linku jest wyłączone, więc tylko Ty możesz uzyskać dostęp do tego bota przez jego URL.',
        },
        on: {
          content:
            'Udostępnianie linku jest włączone, więc WSZYSCY użytkownicy mogą użyć tego linku do konwersacji.',
        },
      },
      error: {
        notSupportedFile: 'Ten plik nie jest obsługiwany.',
        duplicatedFile: 'Plik o tej samej nazwie został już przesłany.',
        failDeleteApi: 'Nie udało się usunąć API.',
      },
      activeModels: {
        title: 'Aktywacja Modelu',
        description:
          'Skonfiguruj, które modele AI mogą być używane z tym botem.',
      },
    },
    admin: {
      sharedBotAnalytics: {
        label: {
          pageTitle: 'Analityka Botów Współdzielonych',
          noPublicBotUsages:
            'W Okresie Obliczeniowym nie wykorzystano żadnych botów publicznych.',
          published: 'API jest opublikowane.',
          SearchCondition: {
            title: 'Okres Obliczeniowy',
            from: 'Od',
            to: 'Do',
          },
          sortByCost: 'Sortuj według Kosztu',
        },
        help: {
          overview:
            'Monitoruj status użytkowania Botów Współdzielonych i Opublikowanych API Botów.',
          calculationPeriod:
            'Jeśli Okres Obliczeniowy nie jest ustawiony, wyświetlony zostanie koszt za dzisiaj.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'Zarządzanie API',
          publishedDate: 'Data Publikacji',
          noApi: 'Brak API.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Zarządzanie Botem',
          sharedUrl: 'URL Bota Współdzielonego',
          apiSettings: 'Ustawienia Publikacji API',
          noKnowledge: 'Ten bot nie ma Bazy Wiedzy.',
          notPublishApi: 'API tego bota nie jest opublikowane.',
          deployStatus: 'Status Wdrożenia',
          cfnStatus: 'Status CloudFormation',
          codebuildStatus: 'Status CodeBuild',
          codeBuildId: 'ID CodeBuild',
          usagePlanOn: 'WŁĄCZONY',
          usagePlanOff: 'WYŁĄCZONY',
          rateLimit:
            '<Bold>{{limit}}</Bold> żądań na sekundę, które klienci mogą wykonać do API.',
          burstLimit:
            'Klient może wykonać <Bold>{{limit}}</Bold> równoczesnych żądań do API.',
          requestsLimit:
            'Możesz wykonać <Bold>{{limit}}</Bold> żądań <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'Brak Kluczy API',
            body: 'Żadni klienci nie mogą uzyskać dostępu do API.',
          },
        },
        button: {
          deleteApi: 'Usuń API',
        },
      },
      validationError: {
        period: 'Wprowadź zarówno Od jak i Do',
      },
    },
    deleteDialog: {
      title: 'Usunąć?',
      content: 'Czy na pewno chcesz usunąć <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Usunąć WSZYSTKO?',
      content: 'Czy na pewno chcesz usunąć WSZYSTKIE konwersacje?',
    },
    languageDialog: {
      title: 'Zmień język',
    },
    feedbackDialog: {
      title: 'Opinia',
      content: 'Proszę podać więcej szczegółów.',
      categoryLabel: 'Kategoria',
      commentLabel: 'Komentarz',
      commentPlaceholder: '(Opcjonalnie) Wprowadź swój komentarz',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'Niepoprawne merytorycznie',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'Nie w pełni zgodne z moją prośbą',
        },
        {
          value: 'other',
          label: 'Inne',
        },
      ],
    },
    button: {
      newChat: 'Nowy Czat',
      botConsole: 'Konsola Bota',
      sharedBotAnalytics: 'Analityka Botów Współdzielonych',
      apiManagement: 'Zarządzanie API',
      userUsages: 'Wykorzystanie zasobów',
      SaveAndSubmit: 'Zapisz i Wyślij',
      resend: 'Wyślij Ponownie',
      regenerate: 'Wygeneruj Ponownie',
      delete: 'Usuń',
      deleteAll: 'Usuń Wszystko',
      done: 'Gotowe',
      ok: 'OK',
      cancel: 'Anuluj',
      back: 'Powrót',
      menu: 'Menu',
      language: 'Język',
      clearConversation: 'Usuń WSZYSTKIE konwersacje',
      signOut: 'Wyloguj się',
      close: 'Zamknij',
      add: 'Dodaj',
      continue: 'Kontynuuj generowanie',
    },
    input: {
      hint: {
        required: '* Wymagane',
      },
      validationError: {
        required: 'To pole jest wymagane.',
        invalidOriginFormat: 'Nieprawidłowy format źródła.',
      },
    },
    embeddingSettings: {
      title: 'Ustawienia Embeddingu',
      description:
        'Możesz skonfigurować parametry dla Embeddingu wektorowego. Dostosowując parametry, możesz zmienić dokładność wyszukiwania dokumentów.',
      chunkSize: {
        label: 'rozmiar fragmentu',
        hint: 'Rozmiar fragmentu odnosi się do wielkości, na jaką dokument jest dzielony na mniejsze segmenty',
      },
      chunkOverlap: {
        label: 'nakładanie fragmentów',
        hint: 'Możesz określić liczbę nakładających się znaków między sąsiadującymi fragmentami.',
      },
      enablePartitionPdf: {
        label:
          'Włącz szczegółową analizę PDF. Jeśli włączone, PDF będzie analizowany szczegółowo w czasie.',
        hint: 'Jest skuteczne, gdy chcesz poprawić dokładność wyszukiwania. Koszty obliczeniowe wzrastają, ponieważ obliczenia zajmują więcej czasu.',
      },
      help: {
        chunkSize:
          'Gdy rozmiar fragmentu jest zbyt mały, informacje kontekstowe mogą zostać utracone, a gdy jest zbyt duży, różne informacje kontekstowe mogą istnieć w tym samym fragmencie, potencjalnie zmniejszając dokładność wyszukiwania.',
        chunkOverlap:
          'Określając nakładanie fragmentów, możesz zachować informacje kontekstowe wokół granic fragmentów. Zwiększenie rozmiaru fragmentu może czasami poprawić dokładność wyszukiwania. Jednak pamiętaj, że zwiększenie nakładania może prowadzić do wyższych kosztów obliczeniowych.',
        overlapTokens:
          'Możesz skonfigurować liczbę tokenów do nakładania lub powtarzania między sąsiadującymi fragmentami. Na przykład, jeśli ustawisz nakładanie tokenów na 60, ostatnie 60 tokenów w pierwszym fragmencie jest również zawarte na początku drugiego fragmentu.',
        maxParentTokenSize:
          'Możesz zdefiniować rozmiar fragmentu nadrzędnego. Podczas wyszukiwania system początkowo pobiera fragmenty podrzędne, ale zastępuje je szerszymi fragmentami nadrzędnymi, aby zapewnić modelowi bardziej kompleksowy kontekst',
        maxChildTokenSize:
          'Możesz zdefiniować rozmiar fragmentu podrzędnego. Podczas wyszukiwania system początkowo pobiera fragmenty podrzędne, ale zastępuje je szerszymi fragmentami nadrzędnymi, aby zapewnić modelowi bardziej kompleksowy kontekst',
        bufferSize:
          'Ten parametr może wpływać na ilość tekstu analizowanego razem w celu określenia granic każdego fragmentu, wpływając na granularność i spójność powstałych fragmentów. Większy rozmiar bufora może uchwycić więcej kontekstu, ale może też wprowadzić szum, podczas gdy mniejszy rozmiar bufora może pominąć ważny kontekst, ale zapewnia bardziej precyzyjne dzielenie.',
        breakpointPercentileThreshold:
          'Wyższy próg wymaga, aby zdania były bardziej rozróżnialne, aby zostały podzielone na różne fragmenty. Wyższy próg skutkuje mniejszą liczbą fragmentów i zazwyczaj większym średnim rozmiarem fragmentu.',
      },
      alert: {
        sync: {
          error: {
            title: 'Błąd Podziału Zdań',
            body: 'Spróbuj ponownie z mniejszą wartością nakładania fragmentów',
          },
        },
      },
    },
    generationConfig: {
      title: 'Konfiguracja Generowania',
      description:
        'Możesz skonfigurować parametry wnioskowania LLM, aby kontrolować odpowiedzi z modeli.',
      maxTokens: {
        label:
          'Maksymalna długość generowania/maksymalna liczba nowych tokenów',
        hint: 'Maksymalna liczba tokenów dozwolona w wygenerowanej odpowiedzi',
      },
      temperature: {
        label: 'Temperatura',
        hint: 'Wpływa na kształt rozkładu prawdopodobieństwa przewidywanego wyniku i wpływa na prawdopodobieństwo wyboru przez model wyników o niższym prawdopodobieństwie',
        help: 'Wybierz niższą wartość, aby skłonić model do wybierania wyników o wyższym prawdopodobieństwie; Wybierz wyższą wartość, aby skłonić model do wybierania wyników o niższym prawdopodobieństwie',
      },
      topK: {
        label: 'Top-k',
        hint: 'Liczba najbardziej prawdopodobnych kandydatów, które model rozważa dla następnego tokenu',
        help: 'Wybierz niższą wartość, aby zmniejszyć pulę i ograniczyć opcje do bardziej prawdopodobnych wyników; Wybierz wyższą wartość, aby zwiększyć pulę i pozwolić modelowi rozważyć mniej prawdopodobne wyniki',
      },
      topP: {
        label: 'Top-p',
        hint: 'Procent najbardziej prawdopodobnych kandydatów, które model rozważa dla następnego tokenu',
        help: 'Wybierz niższą wartość, aby zmniejszyć pulę i ograniczyć opcje do bardziej prawdopodobnych wyników; Wybierz wyższą wartość, aby zwiększyć pulę i pozwolić modelowi rozważyć mniej prawdopodobne wyniki',
      },
      stopSequences: {
        label: 'Token końcowy/sekwencja końcowa',
        hint: 'Określ sekwencje znaków, które zatrzymują model przed generowaniem kolejnych tokenów. Użyj przecinków do oddzielenia wielu słów',
      },
    },
    searchSettings: {
      title: 'Ustawienia Wyszukiwania',
      description:
        'Możesz skonfigurować parametry wyszukiwania, aby pobierać odpowiednie dokumenty z bazy wektorowej.',
      maxResults: {
        label: 'Maksymalna Liczba Wyników',
        hint: 'Maksymalna liczba rekordów pobieranych z bazy wektorowej.',
      },
      searchType: {
        label: 'Typ Wyszukiwania',
        hybrid: {
          label: 'Wyszukiwanie hybrydowe',
          hint: 'Łączy wyniki trafności z wyszukiwania semantycznego i tekstowego, aby zapewnić większą dokładność.',
        },
        semantic: {
          label: 'Wyszukiwanie semantyczne',
          hint: 'Używa embeddingu wektorowego do dostarczania odpowiednich wyników.',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'Ustawienia Szczegółowe Bazy Wiedzy',
      description:
        'Wybierz model embeddingu do konfiguracji Bazy Wiedzy i ustaw metodę podziału dokumentów dodawanych jako Baza Wiedzy. Tych ustawień nie można zmienić po utworzeniu bota.',
      embeddingModel: {
        label: 'Model Embeddingu',
        titan_v2: {
          label: 'Titan Embedding Text v2',
        },
        cohere_multilingual_v3: {
          label: 'Embed Multilingual v3',
        },
      },
      chunkingStrategy: {
        label: 'Strategia Fragmentacji',
        default: {
          label: 'Domyślna fragmentacja',
          hint: 'Domyślnie automatycznie dzieli tekst na fragmenty o wielkości około 300 tokenów. Jeśli dokument ma mniej niż 300 tokenów lub dokładnie tyle, nie jest dalej dzielony.',
        },
        fixed_size: {
          label: 'Fragmentacja o stałym rozmiarze',
          hint: 'Dzieli tekst na fragmenty o ustawionej przybliżonej wielkości tokenów.',
        },
        hierarchical: {
          label: 'Fragmentacja hierarchiczna',
          hint: 'Dzieli tekst na zagnieżdżone struktury fragmentów nadrzędnych i podrzędnych.',
        },
        semantic: {
          label: 'Fragmentacja semantyczna',
          hint: 'Dzieli tekst na znaczące fragmenty, aby ulepszyć zrozumienie i wyszukiwanie informacji.',
        },
        none: {
          label: 'Bez fragmentacji',
          hint: 'Dokumenty nie będą dzielone.',
        },
      },
      chunkingMaxTokens: {
        label: 'Maksymalna Liczba Tokenów',
        hint: 'Maksymalna liczba tokenów na fragment',
      },
      chunkingOverlapPercentage: {
        label: 'Procent Nakładania się Fragmentów',
        hint: 'Nakładanie fragmentu nadrzędnego zależy od rozmiaru tokenu podrzędnego i procentu nakładania się podrzędnego, który określisz.',
      },
      overlapTokens: {
        label: 'Nakładające się Tokeny',
        hint: 'Liczba tokenów do powtórzenia między fragmentami w tej samej warstwie',
      },
      maxParentTokenSize: {
        label: 'Maksymalny Rozmiar Tokenu Nadrzędnego',
        hint: 'Maksymalna liczba tokenów, które może zawierać fragment w warstwie nadrzędnej',
      },
      maxChildTokenSize: {
        label: 'Maksymalny Rozmiar Tokenu Podrzędnego',
        hint: 'Maksymalna liczba tokenów, które może zawierać fragment w warstwie podrzędnej',
      },
      bufferSize: {
        label: 'Rozmiar Bufora',
        hint: 'liczba otaczających zdań do dodania przy tworzeniu embeddingu. Rozmiar bufora 1 skutkuje połączeniem i embeddingiem 3 zdań (bieżącego, poprzedniego i następnego)',
      },
      breakpointThreshold: {
        label: 'Próg percentylowy punktów przełomowych',
        hint: 'Próg percentylowy odległości/różnic między zdaniami do wyznaczania punktów przełomowych między zdaniami.',
      },
      opensearchAnalyzer: {
        label: 'Analizator (Tokenizacja, Normalizacja)',
        hint: 'Możesz określić analizator do tokenizacji i normalizacji dokumentów zarejestrowanych jako wiedza. Wybór odpowiedniego analizatora poprawi dokładność wyszukiwania. Wybierz optymalny analizator odpowiadający językowi twojej wiedzy.',
        icu: {
          label: 'Analizator ICU',
          hint: 'Do tokenizacji używany jest {{tokenizer}}, a do normalizacji używany jest {{normalizer}}.',
        },
        kuromoji: {
          label: 'Analizator japoński (kuromoji)',
          hint: 'Do tokenizacji używany jest {{tokenizer}}, a do normalizacji używany jest {{normalizer}}.',
        },
        none: {
          label: 'Domyślny analizator systemowy',
          hint: 'Zostanie użyty domyślny analizator zdefiniowany przez system (OpenSearch).',
        },
        tokenizer: 'Tokenizer:',
        normalizer: 'Normalizator:',
        token_filter: 'Filtr tokenów:',
        not_specified: 'Nie określono',
      },
      advancedParsing: {
        label: 'Zaawansowane parsowanie',
        description:
          'Wybierz model do użycia w zaawansowanych funkcjach parsowania dokumentów.',
        hint: 'Odpowiednie do parsowania złożonych tekstów w obsługiwanych formatach dokumentów, włącznie z tabelami w plikach PDF z zachowaniem ich struktury. Parsowanie przy użyciu AI generatywnego wiąże się z dodatkowymi kosztami.',
      },
      parsingModel: {
        label: 'Model zaawansowanego parsowania',
        none: {
          label: 'Wyłączone',
          hint: 'Zaawansowane parsowanie nie będzie stosowane.',
        },
        claude_3_5_sonnet_v1: {
          label: 'Claude 3.5 Sonnet v1',
          hint: 'Użyj Claude 3.5 Sonnet v1 do zaawansowanego parsowania dokumentów.',
        },
        claude_3_haiku_v1: {
          label: 'Claude 3 Haiku v1',
          hint: 'Użyj Claude 3 Haiku v1 do zaawansowanego parsowania dokumentów.',
        },
      },
      webCrawlerConfig: {
        title: 'Konfiguracja Web Crawlera',
        crawlingScope: {
          label: 'Zakres crawlowania',
          default: {
            label: 'Domyślny',
            hint: "Ogranicza crawlowanie do stron internetowych należących do tego samego hosta i z tą samą początkową ścieżką URL. Na przykład, przy URL źródłowym 'https://aws.amazon.com/bedrock/' crawlowane będą tylko ta ścieżka i strony internetowe rozszerzające tę ścieżkę, jak 'https://aws.amazon.com/bedrock/agents/'. URLs siostrzane jak 'https://aws.amazon.com/ec2/' nie będą crawlowane.",
          },
          subdomains: {
            label: 'Subdomeny',
            hint: "Uwzględnia crawlowanie dowolnej strony internetowej, która ma tę samą domenę główną co URL źródłowy. Na przykład, przy URL źródłowym 'https://aws.amazon.com/bedrock/' crawlowana będzie każda strona zawierająca 'amazon.com', jak 'https://www.amazon.com'.",
          },
          hostOnly: {
            label: 'Tylko host',
            hint: "Ogranicza crawlowanie do stron internetowych należących do tego samego hosta. Na przykład, przy URL źródłowym 'https://aws.amazon.com/bedrock/', crawlowane będą również strony z 'https://docs.aws.amazon.com', jak 'https://aws.amazon.com/ec2'.",
          },
        },
        includePatterns: {
          label: 'Wzorce do uwzględnienia',
          hint: 'Określ wzorce do uwzględnienia w crawlowaniu. Tylko URL-e pasujące do tych wzorców będą crawlowane.',
        },
        excludePatterns: {
          label: 'Wzorce do wykluczenia',
          hint: 'Określ wzorce do wykluczenia z crawlowania. URL-e pasujące do tych wzorców nie będą crawlowane.',
        },
      },
      advancedConfigration: {
        existingKnowledgeBaseId: {
          label: 'ID dla bazy wiedzy Amazon Bedrock',
          description:
            'Proszę podać ID istniejącej Bazy Wiedzy Amazon Bedrock.',
        },
        createDedicatedKnowledgeBase: {
          label: 'Utwórz dedykowaną Bazę Wiedzy',
        },
        createTenantInSharedKnowledgeBase: {
          label: 'Utwórz najemcę w udostępnionej Bazy Wiedzy',
        },
        useExistingKnowledgeBase: {
          label: 'Użyj istniejącej Bazy Wiedzy',
        },
      },
    },
    error: {
      answerResponse: 'Wystąpił błąd podczas odpowiadania.',
      notFoundConversation:
        'Ponieważ określony czat nie istnieje, wyświetlany jest nowy ekran czatu.',
      notFoundPage: 'Strona, której szukasz, nie została znaleziona.',
      unexpectedError: {
        title: 'Wystąpił nieoczekiwany błąd.',
        restore: 'Przejdź do strony głównej',
      },
      predict: {
        general: 'Wystąpił błąd podczas przewidywania.',
        invalidResponse:
          'Otrzymano nieoczekiwaną odpowiedź. Format odpowiedzi nie odpowiada oczekiwanemu formatowi.',
      },
      notSupportedImage: 'Wybrany model nie obsługuje obrazów.',
      unsupportedFileFormat: 'Wybrany format pliku nie jest obsługiwany.',
      totalFileSizeToSendExceeded:
        'Całkowity rozmiar pliku nie może przekraczać {{maxSize}}.',
      attachment: {
        fileSizeExceeded:
          'Rozmiar każdego dokumentu nie może przekraczać {{maxSize}}.',
        fileCountExceeded: 'Nie można przesłać więcej niż {{maxCount}} plików.',
      },
    },
    validation: {
      title: 'Błąd Walidacji',
      maxRange: {
        message: 'Maksymalna wartość, którą można ustawić, to {{size}}',
      },
      minRange: {
        message: 'Minimalna wartość, którą można ustawić, to {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message:
          'Nakładanie fragmentów musi być mniejsze niż rozmiar fragmentu',
      },
      parentTokenRange: {
        message:
          'Rozmiar tokenu nadrzędnego powinien być większy niż rozmiar tokenu podrzędnego',
      },
      quickStarter: {
        message: 'Proszę wprowadzić zarówno Tytuł jak i Przykład Konwersacji.',
      },
    },
    helper: {
      shortcuts: {
        title: 'Skróty Klawiszowe',
        items: {
          focusInput: 'Przełącz się na pole czatu.',
          newChat: 'Otwórz nowy czat',
        },
      },
    },
    guardrails: {
      title: 'Zabezpieczenia',
      label: 'Włącz zabezpieczenia dla Amazon Bedrock',
      hint: 'Zabezpieczenia dla Amazon Bedrock służą do wdrażania dodatkowych zabezpieczeń specyficznych dla Twojej aplikacji w oparciu o przypadki użycia i politykami odpowiedzialnego wykorzystania sztucznej inteligencji.',
      harmfulCategories: {
        label: 'Szkodliwe Kategorie',
        hint: 'Skonfiguruj filtry treści, dostosowując stopień filtrowania, aby wykrywać i blokować szkodliwe dane wejściowe użytkownika i odpowiedzi modelu, które naruszają zasady użytkowania. 0: wyłączone, 1: niskie, 2: średnie, 3: wysokie',
        hate: {
          label: 'Nienawiść',
          hint: 'Opisuje dane wejściowe i odpowiedzi modelu, które dyskryminują, krytykują, obrażają, potępiają lub dehumanizują osobę lub grupę na podstawie tożsamości (takiej jak rasa, pochodzenie etniczne, płeć, religia, orientacja seksualna, niepełnosprawność i pochodzenie narodowe). 0: wyłączone, 1: niskie, 2: średnie, 3: wysokie',
        },
        insults: {
          label: 'Obelgi',
          hint: 'Opisuje dane wejściowe i odpowiedzi modelu zawierające język poniżający, upokarzający, wyśmiewający, obrażający lub lekceważący. Ten typ języka jest również oznaczany jako nękanie. 0: wyłączone, 1: niskie, 2: średnie, 3: wysokie',
        },
        sexual: {
          label: 'Seksualne',
          hint: 'Opisuje dane wejściowe i odpowiedzi modelu wskazujące na treści seksualne, w szczególności używając bezpośrednich lub pośrednich odniesień do części ciała, cech fizycznych lub seksu. 0: wyłączone, 1: niskie, 2: średnie, 3: wysokie',
        },
        violence: {
          label: 'Przemoc',
          hint: 'Opisuje dane wejściowe i odpowiedzi modelu zawierające gloryfikację lub groźby zadawania bólu fizycznego, krzywdy lub obrażeń wobec osoby, grupy lub rzeczy. 0: wyłączone, 1: niskie, 2: średnie, 3: wysokie',
        },
        misconduct: {
          label: 'Niewłaściwe zachowanie',
          hint: 'Opisuje dane wejściowe i odpowiedzi modelu, które szukają lub dostarczają informacji o angażowaniu się w działania niewłaściwe lub szkodzenie, oszukiwanie lub wykorzystywanie osoby, grupy lub instytucji. 0: wyłączone, 1: niskie, 2: średnie, 3: wysokie',
        },
      },
      contextualGroundingCheck: {
        label: 'Kontrola Ugruntowania Kontekstowego',
        hint: 'Użyj tej polityki, aby sprawdzić, czy odpowiedzi modelu mają odzwierciedlenie w źródle referencyjnym i są adekwatne do zapytania użytkownika, aby filtrować niepoprawne.',
        groundingThreshold: {
          label: 'Ugruntowanie',
          hint: 'Sprawdź, czy odpowiedzi modelu mają odzwierciedlenie i są oparte o informacje dostarczone w źródle referencyjnym, i blokuj odpowiedzi, które są poniżej zdefiniowanego progu ugruntowania. 0: nie blokuje nic, 1: blokuje prawie wszystko',
        },
        relevanceThreshold: {
          label: 'Trafność',
          hint: 'Sprawdź, czy odpowiedzi modelu są odpowiednie do zapytania użytkownika i blokuj odpowiedzi, które są poniżej zdefiniowanego progu trafności. 0: nie blokuje nic, 1: blokuje prawie wszystko',
        },
      },
    },
  },
};

export default translation;
