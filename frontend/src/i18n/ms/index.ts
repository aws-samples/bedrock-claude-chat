const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Log Masuk',
      },
    },
    app: {
      name: 'Bedrock Chat',
      inputMessage: 'Bolehkah Saya Membantu Anda?',
      pinnedBots: 'Bot yang Disemat',
      starredBots: 'Bot Berbintang',
      recentlyUsedBots: 'Bot Yang Baru Digunakan',
      conversationHistory: 'Sejarah',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Hanya Admin',
    },
    model: {
      haiku3: {
        label: 'Claude 3 (Haiku)',
        description:
          'Versi sebelumnya dioptimumkan untuk kelajuan dan kepadatan, memberikan respons hampir serta-merta.',
      },
      sonnet3: {
        label: 'Claude 3 (Sonnet)',
        description: 'Keseimbangan antara kecerdasan dan kelajuan.',
      },
      'sonnet3-5': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Versi awal Claude 3.5. Menyokong pelbagai tugasan, tetapi v2 menawarkan ketepatan yang lebih baik.',
      },
      'sonnet3-5-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'Versi terbaru Claude 3.5. Model yang dipertingkatkan yang membina ke atas v1 dengan ketepatan dan prestasi yang lebih tinggi.',
      },
      'haiku3-5': {
        label: 'Claude 3.5 (Haiku)',
        description:
          'Versi terbaru, menawarkan respons yang lebih pantas dan keupayaan yang diperbaiki berbanding Haiku 3.',
      },
      opus3: {
        label: 'Claude 3 (Opus)',
        description: 'Model yang kuat untuk tugasan yang sangat kompleks.',
      },
      mistral7b: {
        label: 'Mistral 7B',
      },
      mistral8x7b: {
        label: 'Mixtral-8x7B',
      },
      mistralLarge: {
        label: 'Mistral Large',
      },
      novaPro: {
        label: 'Amazon Nova Pro',
        description:
          'Model multimodal yang sangat mampu dengan kombinasi terbaik ketepatan, kelajuan, dan kos untuk pelbagai tugasan.',
      },
      novaLite: {
        label: 'Amazon Nova Lite',
        description:
          'Model multimodal yang sangat murah yang sangat pantas untuk memproses input imej, video, dan teks.',
      },
      novaMicro: {
        label: 'Amazon Nova Micro',
        description:
          'Model teks sahaja yang memberikan respons dengan latensi terendah dalam keluarga model Amazon Nova dengan kos yang sangat rendah.',
      },
      'qwen3-235b-a22b-2507': {
        label: 'Qwen3 235B A22B',
        description:
          'Model Mixture-of-Experts 235B parameter dengan 22B parameter aktif, tetingkap konteks 256K, dan keupayaan penaakulan untuk penjanaan teks dan kod.',
      },
      'qwen3-coder-30b-a3b': {
        label: 'Qwen3 Coder 30B A3B',
        description:
          'Model Mixture-of-Experts 30B parameter untuk pengekodan dengan 3B parameter aktif, tetingkap konteks 256K, output maksimum 16K, dan penaakulan untuk penjanaan kod.',
      },
      'qwen3-32b': {
        label: 'Qwen3 32B',
        description:
          'Model padat 32B parameter dengan tetingkap konteks 32K, output maksimum 8K, dan mod pemikiran hibrid untuk respons pantas dan penaakulan mendalam.',
      },
    },
    agent: {
      label: 'Ejen',
      help: {
        overview:
          'Dengan menggunakan fungsi Ejen, chatbot anda dapat secara automatik mengendalikan tugas-tugas yang lebih kompleks.',
      },
      hint: `Ejen secara automatik menentukan alat mana yang digunakan untuk menjawab soalan pengguna. Disebabkan oleh masa yang diperlukan untuk membuat keputusan, masa respons cenderung lebih lama. Mengaktifkan satu atau lebih alat membolehkan fungsi ejen digunakan. Sebaliknya, jika tiada alat yang dipilih, fungsi ejen tidak digunakan. Apabila fungsi ejen diaktifkan, penggunaan "Pengetahuan" juga dianggap sebagai salah satu alat. Ini bermakna "Pengetahuan" mungkin tidak digunakan dalam respons.`,
      progress: {
        label: 'Berfikir...',
      },
      progressCard: {
        toolInput: 'Input: ',
        toolOutput: 'Output: ',
        status: {
          running: 'Sedang Berjalan...',
          success: 'Berjaya',
          error: 'Ralat',
        },
      },
      tools: {
        get_weather: {
          name: 'Cuaca Semasa',
          description: 'Dapatkan ramalan cuaca semasa.',
        },
        sql_db_query: {
          name: 'Pertanyaan Pangkalan Data',
          description:
            'Laksanakan pertanyaan SQL yang terperinci dan betul untuk mendapatkan hasil dari pangkalan data.',
        },
        sql_db_schema: {
          name: 'Skema Pangkalan Data',
          description: 'Dapatkan skema dan baris sampel untuk senarai jadual.',
        },
        sql_db_list_tables: {
          name: 'Senaraikan Jadual Pangkalan Data',
          description:
            'Senaraikan semua jadual yang tersedia dalam pangkalan data.',
        },
        sql_db_query_checker: {
          name: 'Pemeriksa Pertanyaan',
          description:
            'Semak jika pertanyaan SQL anda betul sebelum pelaksanaan.',
        },
        internet_search: {
          name: 'Carian Internet',
          description: 'Cari maklumat di internet.',
        },
        knowledge_base_tool: {
          name: 'Dapatkan Pengetahuan',
          description: 'Dapatkan maklumat dari pengetahuan.',
        },
      },
    },
    bot: {
      label: {
        myBots: 'Bot Saya',
        recentlyUsedBots: 'Bot Berkongsi Yang Baru Digunakan',
        knowledge: 'Pengetahuan',
        url: 'URL',
        s3url: 'Sumber Data S3',
        sitemap: 'URL Peta Tapak',
        file: 'Fail',
        loadingBot: 'Memuatkan...',
        normalChat: 'Chat',
        notAvailableBot: '[TIDAK Tersedia]',
        notAvailableBotInputMessage: 'Bot ini TIDAK tersedia.',
        noDescription: 'Tiada Penerangan',
        notAvailable: 'Bot ini TIDAK tersedia.',
        noBots: 'Tiada Bot.',
        noBotsRecentlyUsed: 'Tiada Bot Berkongsi Yang Baru Digunakan.',
        retrievingKnowledge: '[Sedang Mendapatkan Pengetahuan...]',
        dndFileUpload:
          'Anda boleh memuat naik fail dengan seret dan lepas.\nFail yang disokong: {{fileExtensions}}',
        uploadError: 'Mesej Ralat',
        referenceLink: 'Pautan Rujukan',
        syncStatus: {
          queue: 'Menunggu Penyegerakan',
          running: 'Sedang Menyegerakkan',
          success: 'Penyegerakan Selesai',
          fail: 'Penyegerakan Gagal',
        },
        fileUploadStatus: {
          uploading: 'Sedang Memuat Naik...',
          uploaded: 'Dimuat Naik',
          error: 'RALAT',
        },
        quickStarter: {
          title: 'Permulaan Pantas Perbualan',
          exampleTitle: 'Tajuk',
          example: 'Contoh Perbualan',
        },
        citeRetrievedContexts: 'Penyebutan Konteks Yang Didapatkan',
        unsupported: 'Tidak Disokong, Baca-Saja',
      },
      titleSubmenu: {
        edit: 'Edit',
        copyLink: 'Salin Pautan',
        copiedLink: 'Disalin',
      },
      help: {
        overview:
          'Bot beroperasi mengikut arahan yang telah ditetapkan. Chat tidak berfungsi seperti yang dimaksudkan kecuali konteks ditakrifkan dalam mesej, tetapi dengan bot, tidak perlu mendefinisikan konteks.',
        instructions:
          'Tentukan bagaimana bot harus berkelakuan. Memberi arahan yang samar mungkin menyebabkan pergerakan yang tidak dijangka, jadi berikan arahan yang jelas dan spesifik.',
        knowledge: {
          overview:
            'Dengan memberikan pengetahuan luaran kepada bot, ia menjadi mampu mengendalikan data yang tidak dilatih terlebih dahulu.',
          url: 'Maklumat dari URL yang ditetapkan akan digunakan sebagai Pengetahuan.',
          s3url:
            'Dengan memasukkan URI S3, anda boleh menambah S3 sebagai sumber data. Anda boleh menambah sehingga 4 sumber. Ia hanya menyokong baldi yang wujud dalam akaun yang sama dan kawasan bedrock yang sama.',
          sitemap:
            'Dengan menentukan URL peta tapak, maklumat yang diperoleh melalui pengikisan automatik laman web dalamnya akan digunakan sebagai Pengetahuan.',
          file: 'Fail yang dimuat naik akan digunakan sebagai Pengetahuan.',
          citeRetrievedContexts:
            'Konfigurasikan sama ada untuk memaparkan konteks yang diambil untuk menjawab pertanyaan pengguna sebagai maklumat penyebutan.\nJika diaktifkan, pengguna boleh mengakses URL atau fail sumber asal.',
        },
        quickStarter: {
          overview:
            'Apabila memulakan perbualan, berikan contoh. Contoh menggambarkan cara menggunakan bot.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Ralat Penyegerakan Pengetahuan',
            body: 'Ralat berlaku semasa menyegerakkan Pengetahuan. Sila periksa mesej berikut:',
          },
          incomplete: {
            title: 'TIDAK Sedia',
            body: 'Bot ini belum selesai penyegerakan pengetahuan, jadi pengetahuan sebelum kemas kini digunakan.',
          },
        },
      },
      samples: {
        title: 'Sampel Arahan',
        anthropicLibrary: {
          title: 'Perpustakaan Arahan Antropik',
          sentence: 'Perlu lebih banyak contoh? Layari: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Pembantu Kod Python',
          prompt: `Tulis skrip python yang pendek dan berkualiti tinggi untuk tugasan yang diberikan, sesuatu yang akan ditulis oleh pakar python yang sangat mahir. Anda menulis kod untuk pemaju yang berpengalaman jadi hanya tambahkan komen untuk perkara yang tidak jelas. Pastikan untuk memasukkan sebarang import yang diperlukan.
    JANGAN PERNAH menulis apa-apa sebelum blok \`\`\`python\`\`\`. Setelah anda selesai menjana kod dan selepas blok \`\`\`python\`\`\`, semak kerja anda dengan teliti untuk memastikan tiada kesilapan, ralat, atau ketidakkonsistenan. Jika ada ralat, senaraikan ralat tersebut dalam tag <error>, kemudian jana versi baru dengan ralat tersebut diperbetulkan. Jika tiada ralat, tulis "DISEMAK: TIADA RALAT" dalam tag <error>.`,
        },
        mailCategorizer: {
          title: 'Pengkategorian E-mel',
          prompt: `Anda adalah ejen perkhidmatan pelanggan yang ditugaskan untuk mengklasifikasikan e-mel mengikut jenis. Sila keluarkan jawapan anda dan kemudian sahkan klasifikasi anda.

    Kategori klasifikasi adalah:
    (A) Soalan pra-jualan
    (B) Item rosak atau cacat
    (C) Soalan pengebilan
    (D) Lain-lain (sila jelaskan)

    Bagaimana anda akan mengkategorikan e-mel ini?`,
        },
        fitnessCoach: {
          title: 'Jurulatih Kecergasan Peribadi',
          prompt: `Anda adalah jurulatih kecergasan peribadi yang ceria dan bersemangat bernama Sam. Sam bersemangat untuk membantu klien menjadi cergas dan menjalani gaya hidup yang lebih sihat. Anda menulis dengan nada yang menggalakkan dan mesra dan sentiasa cuba membimbing klien anda ke arah matlamat kecergasan yang lebih baik. Jika pengguna bertanya sesuatu yang tidak berkaitan dengan kecergasan, sama ada bawa topik kembali ke kecergasan, atau katakan bahawa anda tidak dapat menjawab.`,
        },
      },
      create: {
        pageTitle: 'Buat Bot Saya',
      },
      edit: {
        pageTitle: 'Edit Bot Saya',
      },

      item: {
        title: 'Nama',
        description: 'Penerangan',
        instruction: 'Arahan',
      },
      explore: {
        label: {
          pageTitle: 'Konsol Bot',
        },
      },
      apiSettings: {
        pageTitle: 'Tetapan API Terbitan Bot Berkongsi',
        label: {
          endpoint: 'Titik Akhir API',
          usagePlan: 'Pelan Penggunaan',
          allowOrigins: 'Asal Dibenarkan',
          apiKeys: 'Kunci API',
          period: {
            day: 'Setiap HARI',
            week: 'Setiap MINGGU',
            month: 'Setiap BULAN',
          },
          apiKeyDetail: {
            creationDate: 'Tarikh Penciptaan',
            active: 'Aktif',
            inactive: 'Tidak Aktif',
            key: 'Kunci API',
          },
        },
        item: {
          throttling: 'Pengurangan Kelajuan',
          burstLimit: 'Had Burst',
          rateLimit: 'Had Kadar',
          quota: 'Kuota',
          requestLimit: 'Permintaan',
          offset: 'Offset',
        },
        help: {
          overview:
            'Mewujudkan API membolehkan fungsi Bot diakses oleh klien luaran; API membolehkan integrasi dengan aplikasi luaran.',
          endpoint: 'Klien boleh menggunakan Bot dari titik akhir ini.',
          usagePlan:
            'Pelan penggunaan menentukan bilangan atau kadar permintaan yang diterima API anda dari klien. Kaitkan API dengan pelan penggunaan untuk menjejak permintaan yang diterima API anda.',
          throttling: 'Hadkan kadar yang boleh dipanggil pengguna ke API anda.',
          rateLimit:
            'Masukkan kadar, dalam permintaan per saat, yang boleh dipanggil klien ke API anda.',
          burstLimit:
            'Masukkan bilangan permintaan serentak yang boleh dibuat klien ke API anda.',
          quota:
            'Hidupkan kuota untuk menghadkan bilangan permintaan yang boleh dibuat pengguna ke API anda dalam tempoh masa yang ditetapkan.',
          requestLimit:
            'Masukkan jumlah permintaan yang boleh dibuat pengguna dalam tempoh masa yang anda pilih dalam senarai drop-down.',
          allowOrigins:
            'Asal klien yang dibenarkan untuk akses. Jika asal tidak dibenarkan, pemanggil menerima respons 403 Forbidden dan ditolak akses ke API. Asal mesti mengikuti format: "(http|https)://nama-host" atau "(http|https)://nama-host:port" dan wildcard (*) boleh digunakan.',
          allowOriginsExample:
            'contoh: https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
          apiKeys:
            'Kunci API adalah rentetan alfanumerik yang digunakan untuk mengenal pasti klien API anda. Jika tidak, pemanggil menerima respons 403 Forbidden dan ditolak akses ke API.',
        },
        button: {
          ApiKeyShow: 'Tunjukkan',
          ApiKeyHide: 'Sembunyikan',
        },
        alert: {
          botUnshared: {
            title: 'Sila Kongsi Bot',
            body: 'Anda tidak boleh menerbitkan API untuk bot yang tidak dikongsi.',
          },
          deploying: {
            title: 'Penerapan API dalam PROSES',
            body: 'Sila tunggu sehingga penerapan selesai.',
          },
          deployed: {
            title: 'API Telah DIPENERBITKAN',
            body: 'Anda boleh mengakses API dari Klien menggunakan Titik Akhir API dan Kunci API.',
          },
          deployError: {
            title: 'GAGAL untuk menerbitkan API',
            body: 'Sila padamkan API dan cipta semula API.',
          },
        },
        deleteApiDaialog: {
          title: 'Padam?',
          content:
            'Adakah anda pasti untuk memadam API? Titik akhir API akan dipadamkan, dan klien tidak lagi boleh mengaksesnya.',
        },
        addApiKeyDialog: {
          title: 'Tambah Kunci API',
          content: 'Masukkan nama untuk mengenal pasti Kunci API.',
        },
        deleteApiKeyDialog: {
          title: 'Padam?',
          content:
            'Adakah anda pasti untuk memadam <Bold>{{title}}</Bold>?\nKlien yang menggunakan Kunci API ini akan ditolak akses ke API.',
        },
      },
      button: {
        newBot: 'Buat Bot Baru',
        create: 'Buat',
        edit: 'Edit',
        save: 'Simpan',
        delete: 'Padam',
        share: 'Kongsi',
        apiSettings: 'Tetapan Terbit API',
        copy: 'Salin',
        copied: 'Disalin',
        instructionsSamples: 'Sampel',
        chooseFiles: 'Pilih fail',
      },
      deleteDialog: {
        title: 'Padam?',
        content: 'Adakah anda pasti untuk memadam <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Kongsi',
        off: {
          content:
            'Perkongsian pautan dimatikan, jadi hanya anda yang boleh mengakses bot ini melalui URLnya.',
        },
        on: {
          content:
            'Perkongsian pautan dihidupkan, jadi SEMUA pengguna boleh menggunakan pautan ini untuk perbualan.',
        },
      },
      error: {
        notSupportedFile: 'Fail ini tidak disokong.',
        duplicatedFile: 'Fail dengan nama yang sama telah dimuat naik.',
        failDeleteApi: 'Gagal memadam API.',
      },
    },
    admin: {
      botAnalytics: {
        label: {
          pageTitle: 'Analitik Bot',
          noBotUsages: 'Dalam Tempoh Pengiraan, tiada bot yang digunakan.',
          published: 'API telah diterbitkan.',
          SearchCondition: {
            title: 'Tempoh Pengiraan',
            from: 'Dari',
            to: 'Ke',
          },
          sortByCost: 'Susun mengikut Kos',
        },
        help: {
          overview: 'Pantau status penggunaan Bot dan API Bot Terbitan.',
          calculationPeriod:
            'Jika Tempoh Pengiraan tidak ditetapkan, kos untuk hari ini akan dipaparkan.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'Pengurusan API',
          publishedDate: 'Tarikh Penerbitan',
          noApi: 'Tiada API.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Pengurusan Bot',
          sharedUrl: 'URL Bot Berkongsi',
          apiSettings: 'Tetapan Terbit API',
          noKnowledge: 'Bot ini tiada Pengetahuan.',
          notPublishApi: 'API bot ini tidak diterbitkan.',
          deployStatus: 'Status Penerapan',
          cfnStatus: 'Status CloudFormation',
          codebuildStatus: 'Status CodeBuild',
          codeBuildId: 'ID CodeBuild',
          usagePlanOn: 'HIDUP',
          usagePlanOff: 'MATI',
          rateLimit:
            '<Bold>{{limit}}</Bold> permintaan per saat, yang boleh dipanggil klien ke API.',
          burstLimit:
            'Klien boleh membuat <Bold>{{limit}}</Bold> permintaan serentak ke API.',
          requestsLimit:
            'Anda boleh membuat <Bold>{{limit}}</Bold> permintaan <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'Tiada Kunci API',
            body: 'Semua klien tidak boleh mengakses API.',
          },
        },
        button: {
          deleteApi: 'Padam API',
        },
      },
      validationError: {
        period: 'Masukkan kedua-dua Dari dan Ke',
      },
    },
    deleteDialog: {
      title: 'Padam?',
      content: 'Adakah anda pasti untuk memadam <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Padam SEMUA?',
      content: 'Adakah anda pasti untuk memadam SEMUA perbualan?',
    },
    languageDialog: {
      title: 'Tukar Bahasa',
    },
    feedbackDialog: {
      title: 'Maklum Balas',
      content: 'Sila berikan butiran lebih lanjut.',
      categoryLabel: 'Kategori',
      commentLabel: 'Komen',
      commentPlaceholder: '(Pilihan) Masukkan komen anda',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'Tidak Betul Secara Fakta',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'Tidak Sepenuhnya Mengikuti Permintaan Saya',
        },
        {
          value: 'other',
          label: 'Lain-lain',
        },
      ],
    },
    button: {
      newChat: 'Chat Baru',
      botConsole: 'Konsol Bot',
      botAnalytics: 'Analitik Bot Berkongsi',
      apiManagement: 'Pengurusan API',
      userUsages: 'Penggunaan Pengguna',
      SaveAndSubmit: 'Simpan & Hantar',
      resend: 'Hantar Semula',
      regenerate: 'Jana Semula',
      delete: 'Padam',
      deleteAll: 'Padam Semua',
      done: 'Selesai',
      ok: 'OK',
      cancel: 'Batal',
      back: 'Kembali',
      menu: 'Menu',
      language: 'Bahasa',
      clearConversation: 'Padam SEMUA perbualan',
      signOut: 'Log Keluar',
      close: 'Tutup',
      add: 'Tambah',
      continue: 'Teruskan untuk menjana',
    },
    input: {
      hint: {
        required: '* Diperlukan',
      },
      validationError: {
        required: 'Medan ini diperlukan.',
        invalidOriginFormat: 'Format Asal tidak sah.',
      },
    },
    embeddingSettings: {
      title: 'Tetapan Penyisipan',
      description:
        'Anda boleh mengkonfigurasi parameter untuk penyisipan vektor. Dengan menyesuaikan parameter, anda boleh mengubah ketepatan pengambilan dokumen.',
      chunkSize: {
        label: 'saiz potongan',
        hint: 'Saiz potongan merujuk kepada saiz di mana dokumen dibahagikan kepada segmen yang lebih kecil',
      },
      chunkOverlap: {
        label: 'tindih potongan',
        hint: 'Anda boleh menentukan bilangan aksara yang tindih antara potongan bersebelahan.',
      },
      enablePartitionPdf: {
        label:
          'Aktifkan analisis PDF terperinci. Jika diaktifkan, PDF akan dianalisis secara terperinci dari masa ke masa.',
        hint: 'Ia berkesan apabila anda ingin meningkatkan ketepatan carian. Kos pengiraan meningkat kerana pengiraan mengambil masa lebih lama.',
      },
      help: {
        chunkSize:
          'Apabila saiz potongan terlalu kecil, maklumat konteks boleh hilang, dan apabila terlalu besar, maklumat konteks yang berbeza mungkin wujud dalam potongan yang sama, yang berpotensi mengurangkan ketepatan carian.',
        chunkOverlap:
          'Dengan menentukan tindih potongan, anda boleh mengekalkan maklumat konteks di sekitar sempadan potongan. Meningkatkan saiz potongan kadang-kadang boleh meningkatkan ketepatan carian. Walau bagaimanapun, perlu diingat bahawa meningkatkan tindih potongan boleh menyebabkan kos pengiraan yang lebih tinggi.',
        overlapTokens:
          'Anda mengkonfigurasi bilangan token untuk tumpang tindih, atau diulang di atas potongan bersebelahan dalam lapisan yang sama. Sebagai contoh, jika anda menetapkan token tumpang tindih kepada 60, 60 token terakhir dalam potongan pertama juga akan dimasukkan di awal potongan kedua.',
        maxParentTokenSize:
          'Anda boleh menentukan saiz token ibu. Semasa pengambilan, sistem mula-mula mengambil potongan anak, tetapi menggantikannya dengan potongan ibu yang lebih luas untuk memberikan model konteks yang lebih menyeluruh',
        maxChildTokenSize:
          'Anda boleh menentukan saiz token anak. Semasa pengambilan, sistem mula-mula mengambil potongan anak, tetapi menggantikannya dengan potongan ibu yang lebih luas untuk memberikan model konteks yang lebih menyeluruh',
        bufferSize:
          'Parameter ini boleh mempengaruhi berapa banyak teks yang diperiksa bersama-sama untuk menentukan sempadan setiap potongan, mempengaruhi kehalusan dan koherensi potongan yang dihasilkan. Saiz penimbal yang lebih besar mungkin menangkap lebih banyak konteks tetapi juga boleh memperkenalkan bunyi, manakala saiz penimbal yang lebih kecil mungkin terlepas konteks penting tetapi memastikan pemotongan yang lebih tepat.',
        breakpointPercentileThreshold:
          'Ambang peratusan titik putus yang lebih tinggi memerlukan ayat untuk lebih dapat dibezakan untuk dipecahkan ke dalam potongan yang berbeza. Ambang yang lebih tinggi menghasilkan lebih sedikit potongan dan biasanya saiz potongan purata yang lebih besar.',
      },
      alert: {
        sync: {
          error: {
            title: 'Ralat Pemecahan Ayat',
            body: 'Cuba lagi dengan nilai tindih potongan yang lebih kecil',
          },
        },
      },
    },
    generationConfig: {
      title: 'Konfigurasi Penjanaan',
      description:
        'Anda boleh mengkonfigurasi parameter inferens LLM untuk mengawal respons dari model.',
      maxTokens: {
        label: 'Panjang penjanaan maksimum/token baru maksimum',
        hint: 'Bilangan maksimum token yang dibenarkan dalam respons yang dijana',
      },
      temperature: {
        label: 'Suhu',
        hint: 'Mempengaruhi bentuk taburan kebarangkalian untuk output yang diramalkan dan mempengaruhi kemungkinan model memilih output dengan kebarangkalian lebih rendah',
        help: 'Pilih nilai yang lebih rendah untuk mempengaruhi model memilih output dengan kebarangkalian lebih tinggi; Pilih nilai yang lebih tinggi untuk mempengaruhi model memilih output dengan kebarangkalian lebih rendah',
      },
      topK: {
        label: 'Top-k',
        hint: 'Bilangan calon yang paling mungkin yang dipertimbangkan model untuk token seterusnya',
        help: 'Pilih nilai yang lebih rendah untuk mengurangkan saiz kumpulan dan menghadkan pilihan kepada output yang lebih mungkin; Pilih nilai yang lebih tinggi untuk meningkatkan saiz kumpulan dan membenarkan model mempertimbangkan output yang kurang mungkin',
      },
      topP: {
        label: 'Top-p',
        hint: 'Peratusan calon yang paling mungkin yang dipertimbangkan model untuk token seterusnya',
        help: 'Pilih nilai yang lebih rendah untuk mengurangkan saiz kumpulan dan menghadkan pilihan kepada output yang lebih mungkin; Pilih nilai yang lebih tinggi untuk meningkatkan saiz kumpulan dan membenarkan model mempertimbangkan output yang kurang mungkin',
      },
      stopSequences: {
        label: 'Token akhir/sekuen akhir',
        hint: 'Nyatakan urutan aksara yang menghentikan model daripada menjana token lebih lanjut. Gunakan koma untuk memisahkan beberapa perkataan',
      },
    },
    searchSettings: {
      title: 'Tetapan Carian',
      description:
        'Anda boleh mengkonfigurasi parameter carian untuk mendapatkan dokumen yang relevan dari stor vektor.',
      maxResults: {
        label: 'Hasil Maksimum',
        hint: 'Bilangan maksimum rekod yang diambil dari stor vektor',
      },
      searchType: {
        label: 'Jenis Carian',
        hybrid: {
          label: 'Carian Hibrid',
          hint: 'Menggabungkan skor keterkaitan dari carian semantik dan teks untuk memberikan ketepatan yang lebih tinggi.',
        },
        semantic: {
          label: 'Carian Semantik',
          hint: 'Menggunakan penyisipan vektor untuk menyampaikan hasil yang relevan.',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'Tetapan Butiran Pengetahuan',
      description:
        'Pilih model penyisipan untuk mengkonfigurasi pengetahuan, dan tetapkan kaedah untuk memecahkan dokumen yang ditambahkan sebagai pengetahuan. Tetapan ini tidak boleh diubah selepas membuat bot.',
      embeddingModel: {
        label: 'Model Penyisipan',
        titan_v2: {
          label: 'Titan Embedding Text v2',
        },
        cohere_multilingual_v3: {
          label: 'Embed Multilingual v3',
        },
      },
      chunkingStrategy: {
        label: 'Strategi Pemotongan',
        default: {
          label: 'Pemotongan lalai',
          hint: 'Secara automatik membahagikan teks menjadi potongan kira-kira 300 token saiznya, secara lalai. Jika dokumen kurang daripada atau sudah 300 token, ia tidak dipotong lagi.',
        },
        fixed_size: {
          label: 'Pemotongan saiz tetap',
          hint: 'Membahagikan teks kepada saiz token tetap yang anda tetapkan.',
        },
        hierarchical: {
          label: 'Pemotongan hierarki',
          hint: 'Membahagikan teks kepada struktur bersarang potongan anak dan ibu.',
        },
        semantic: {
          label: 'Pemotongan semantik',
          hint: 'Membahagikan teks kepada potongan yang bermakna untuk meningkatkan pemahaman dan pengambilan maklumat.',
        },
        none: {
          label: 'Tiada pemotongan',
          hint: 'Dokumen tidak akan dipotong.',
        },
      },
      chunkingMaxTokens: {
        label: 'Token Maksimum',
        hint: 'Bilangan maksimum token per potongan',
      },
      chunkingOverlapPercentage: {
        label: 'Peratusan Tindih antara Potongan',
        hint: 'Tindih potongan ibu bergantung pada saiz token anak dan peratusan tindih anak yang anda tetapkan.',
      },
      overlapTokens: {
        label: 'Token Tindih',
        hint: 'Bilangan token yang diulang di atas potongan dalam lapisan yang sama',
      },
      maxParentTokenSize: {
        label: 'Saiz Token Ibu Maksimum',
        hint: 'Bilangan maksimum token yang boleh dimiliki oleh potongan dalam lapisan Ibu',
      },
      maxChildTokenSize: {
        label: 'Saiz Token Anak Maksimum',
        hint: 'Bilangan maksimum token yang boleh dimiliki oleh potongan dalam lapisan Anak',
      },
      bufferSize: {
        label: 'Saiz Penimbal',
        hint: 'bilangan ayat sekitar yang ditambah untuk penciptaan penyisipan. Saiz penimbal 1 menghasilkan 3 ayat (ayat semasa, ayat sebelumnya dan ayat seterusnya) untuk digabungkan dan disisipkan',
      },
      breakpointPercentileThreshold: {
        label: 'Ambang peratusan titik putus',
        hint: 'Ambang peratusan jarak/ketidakserupaan ayat untuk menarik titik putus antara ayat.',
      },
      opensearchAnalyzer: {
        label: 'Penganalisis (Tokenisasi, Normalisasi)',
        hint: 'Anda boleh menentukan penganalisis untuk men-tokenize dan menormalkan dokumen yang didaftarkan sebagai pengetahuan. Memilih penganalisis yang sesuai akan meningkatkan ketepatan carian. Sila pilih penganalisis yang optimum yang sesuai dengan bahasa pengetahuan anda.',
        icu: {
          label: 'penganalisis ICU',
          hint: 'Untuk tokenisasi, {{tokenizer}} digunakan, dan untuk normalisasi, {{normalizer}} digunakan.',
        },
        kuromoji: {
          label: 'penganalisis Jepun (kuromoji)',
          hint: 'Untuk tokenisasi, {{tokenizer}} digunakan, dan untuk normalisasi, {{normalizer}} digunakan.',
        },
        none: {
          label: 'penganalisis lalai sistem',
          hint: 'Penganalisis lalai yang ditakrifkan oleh sistem (OpenSearch) akan digunakan.',
        },
        tokenizer: 'Tokenizer:',
        normalizer: 'Normalizer:',
        token_filter: 'Penapis Token:',
        not_specified: 'Tidak ditetapkan',
      },
      advancedParsing: {
        label: 'Penguraian Lanjutan',
        description:
          'Pilih model untuk digunakan bagi keupayaan penguraian dokumen lanjutan.',
        hint: 'Sesuai untuk menguraikan lebih daripada teks standard dalam format dokumen yang disokong, termasuk jadual dalam PDF dengan struktur mereka yang terjaga. Kos tambahan dikenakan untuk penguraian menggunakan AI generatif.',
      },
      parsingModel: {
        label: 'Model Penguraian Lanjutan',
        none: {
          label: 'Dinonaktifkan',
          hint: 'Tiada penguraian lanjutan akan diterapkan.',
        },
        claude_3_5_sonnet_v1: {
          label: 'Claude 3.5 Sonnet v1',
          hint: 'Gunakan Claude 3.5 Sonnet v1 untuk penguraian dokumen lanjutan.',
        },
        claude_3_haiku_v1: {
          label: 'Claude 3 Haiku v1',
          hint: 'Gunakan Claude 3 Haiku v1 untuk penguraian dokumen lanjutan.',
        },
      },
      webCrawlerConfig: {
        title: 'Konfigurasi Perayap Web',
        crawlingScope: {
          label: 'Skop Perayapan',
          default: {
            label: 'Lalai',
            hint: 'Hadkan perayapan kepada halaman web yang tergolong dalam host yang sama dan dengan laluan URL awal yang sama. Sebagai contoh, dengan URL biji "https://aws.amazon.com/bedrock/" maka hanya laluan ini dan halaman web yang memperluaskan dari laluan ini akan diperayapi, seperti "https://aws.amazon.com/bedrock/agents/". URL saudara seperti "https://aws.amazon.com/ec2/" tidak diperayapi, sebagai contoh.',
          },
          subdomains: {
            label: 'Subdomain',
            hint: 'Termasuk perayapan mana-mana halaman web yang mempunyai domain utama yang sama dengan URL biji. Sebagai contoh, dengan URL biji "https://aws.amazon.com/bedrock/" maka mana-mana halaman web yang mengandungi "amazon.com" akan diperayapi, seperti "https://www.amazon.com".',
          },
          hostOnly: {
            label: 'Hanya Host',
            hint: 'Hadkan perayapan kepada halaman web yang tergolong dalam host yang sama. Sebagai contoh, dengan URL biji "https://aws.amazon.com/bedrock/", maka halaman web dengan "https://docs.aws.amazon.com" juga akan diperayapi, seperti "https://aws.amazon.com/ec2".',
          },
        },
        includePatterns: {
          label: 'Corak Sertakan',
          hint: 'Nyatakan corak untuk disertakan dalam perayapan web. Hanya URL yang sepadan dengan corak ini akan diperayapi.',
        },
        excludePatterns: {
          label: 'Corak Kecualikan',
          hint: 'Nyatakan corak untuk dikecualikan daripada perayapan web. URL yang sepadan dengan corak ini tidak akan diperayapi.',
        },
      },
    },
    error: {
      answerResponse: 'Ralat berlaku semasa memberikan respons.',
      notFoundConversation:
        'Memandangkan chat yang ditetapkan tidak wujud, skrin chat baru dipaparkan.',
      notFoundPage: 'Halaman yang anda cari tidak dijumpai.',
      unexpectedError: {
        title: 'Ralat yang tidak dijangka telah berlaku.',
        restore: 'Pergi ke halaman UTAMA',
      },
      predict: {
        general: 'Ralat berlaku semasa meramalkan.',
        invalidResponse:
          'Respons yang tidak dijangka diterima. Format respons tidak sesuai dengan format yang dijangka.',
      },
      notSupportedImage: 'Model yang dipilih tidak menyokong imej.',
      unsupportedFileFormat: 'Format fail yang dipilih tidak disokong.',
      totalFileSizeToSendExceeded:
        'Jumlah saiz fail mesti tidak melebihi {{maxSize}}.',
      attachment: {
        fileSizeExceeded:
          'Saiz setiap dokumen mesti tidak melebihi {{maxSize}}.',
        fileCountExceeded:
          'Tidak boleh memuat naik lebih daripada {{maxCount}} fail.',
      },
    },
    validation: {
      title: 'Ralat Pengesahan',
      maxRange: {
        message: 'Nilai maksimum yang boleh ditetapkan adalah {{size}}',
      },
      minRange: {
        message: 'Nilai minimum yang boleh ditetapkan adalah {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message:
          'Tindih potongan mesti ditetapkan kurang daripada saiz potongan',
      },
      parentTokenRange: {
        message: 'Saiz token ibu harus lebih besar daripada saiz token anak',
      },
      quickStarter: {
        message: 'Sila masukkan kedua-dua Tajuk dan Contoh Perbualan.',
      },
    },
    helper: {
      shortcuts: {
        title: 'Kunci Pintas',
        items: {
          focusInput: 'Alih fokus ke input chat',
          newChat: 'Buka chat baru',
        },
      },
    },
    guardrails: {
      title: 'Tali Panduan',
      label: 'Aktifkan Tali Panduan untuk Amazon Bedrock',
      hint: 'Tali panduan untuk Amazon Bedrock digunakan untuk melaksanakan langkah berjaga-jaga khusus aplikasi berdasarkan kes penggunaan anda dan polisi AI bertanggungjawab.',
      harmfulCategories: {
        label: 'Kategori Berbahaya',
        hint: 'Konfigurasikan penapis kandungan dengan menyesuaikan tahap penapisan untuk mengesan dan menyekat input pengguna yang berbahaya dan respons model yang melanggar polisi penggunaan anda. 0: matikan, 1: rendah, 2: sederhana, 3: Tinggi',
        hate: {
          label: 'Benci',
          hint: 'Menggambarkan prompt input dan respons model yang mendiskriminasi, mengkritik, menghina, mengecam, atau menghumanisasikan seseorang atau kumpulan berdasarkan identiti (seperti bangsa, etnik, jantina, agama, orientasi seksual, kebolehan, dan asal negara). 0: matikan, 1: rendah, 2: sederhana, 3: Tinggi',
        },
        insults: {
          label: 'Hinaan',
          hint: 'Menggambarkan prompt input dan respons model yang termasuk bahasa yang merendahkan, menghina, mengolok-olok, menghina, atau mengecilkan. Jenis bahasa ini juga dilabel sebagai buli. 0: matikan, 1: rendah, 2: sederhana, 3: Tinggi',
        },
        sexual: {
          label: 'Seksual',
          hint: 'Menggambarkan prompt input dan respons model yang menunjukkan minat, aktiviti, atau rangsangan seksual menggunakan rujukan langsung atau tidak langsung kepada bahagian badan, ciri fizikal, atau seks. 0: matikan, 1: rendah, 2: sederhana, 3: Tinggi',
        },
        violence: {
          label: 'Kekerasan',
          hint: 'Menggambarkan prompt input dan respons model yang termasuk pemuliaan atau ancaman untuk menyebabkan kesakitan fizikal, melukai, atau mencederakan seseorang, kumpulan atau benda. 0: matikan, 1: rendah, 2: sederhana, 3: Tinggi ',
        },
        misconduct: {
          label: 'Penyalahgunaan',
          hint: 'Menggambarkan prompt input dan respons model yang mencari atau menyediakan maklumat tentang terlibat dalam aktiviti penyalahgunaan, atau mencederakan, menipu, atau mengambil kesempatan daripada seseorang, kumpulan atau institusi. 0: matikan, 1: rendah, 2: sederhana, 3: Tinggi',
        },
      },
      contextualGroundingCheck: {
        label: 'Semakan Pengikatan Konteks',
        hint: 'Gunakan polisi ini untuk mengesahkan jika respons model berteraskan sumber rujukan dan relevan dengan pertanyaan pengguna untuk menapis halusinasi model.',
        groundingThreshold: {
          label: 'Pengikatan',
          hint: 'Sahkan jika respons model berteraskan dan betul secara fakta berdasarkan maklumat yang diberikan dalam sumber rujukan, dan sekat respons yang berada di bawah ambang pengikatan yang ditetapkan. 0: tidak menyekat apa-apa, 0.99: menyekat hampir semua',
        },
        relevanceThreshold: {
          label: 'Relevansi',
          hint: 'Sahkan jika respons model relevan dengan pertanyaan pengguna dan sekat respons yang berada di bawah ambang relevansi yang ditetapkan. 0: tidak menyekat apa-apa, 0.99: menyekat hampir semua',
        },
      },
    },
  },
};

export default translation;
