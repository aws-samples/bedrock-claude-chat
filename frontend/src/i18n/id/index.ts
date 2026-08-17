const translation = {
  translation: {
    signIn: {
      button: {
        login: 'Masuk',
      },
    },
    app: {
      name: 'Bedrock Chat',
      inputMessage: 'Bisakah Saya Membantu Anda?',
      pinnedBots: 'Bot yang Dipin',
      starredBots: 'Bot Favorit',
      recentlyUsedBots: 'Bot yang Baru Digunakan',
      conversationHistory: 'Riwayat',
      chatWaitingSymbol: '▍',
      adminConsoles: 'Hanya Admin',
    },
    model: {
      'claude-v3-haiku': {
        label: 'Claude 3 (Haiku)',
        description:
          'Versi sebelumnya yang dioptimalkan untuk kecepatan dan kekompakan, memberikan respons hampir instan.',
      },
      'claude-v3.5-sonnet': {
        label: 'Claude 3.5 (Sonnet) v1',
        description:
          'Versi awal dari Claude 3.5. Mendukung berbagai tugas, tetapi v2 menawarkan akurasi yang lebih baik.',
      },
      'claude-v3.5-sonnet-v2': {
        label: 'Claude 3.5 (Sonnet) v2',
        description:
          'Versi terbaru dari Claude 3.5. Model yang ditingkatkan yang membangun dari v1 dengan akurasi dan performa yang lebih tinggi.',
      },
      'claude-v3.5-haiku': {
        label: 'Claude 3.5 (Haiku)',
        description:
          'Versi terbaru, menawarkan respons yang lebih cepat dan kemampuan yang ditingkatkan dibandingkan Haiku 3.',
      },
      'claude-v4.1-opus': {
        label: 'Claude 4.1 (Opus)',
        description:
          'Model Opus dengan kemampuan penalaran yang ditingkatkan.',
      },
      'claude-v4.5-opus': {
        label: 'Claude 4.5 (Opus)',
        description:
          'Model Opus berkemampuan tinggi yang menggabungkan penalaran kuat dengan kinerja praktis.',
      },
      'claude-v4.6-opus': {
        label: 'Claude 4.6 (Opus)',
        description:
          'Model unggulan yang merencanakan lebih hati-hati, mempertahankan tugas agen lebih lama, dan beroperasi dengan andal di codebase besar dengan jendela konteks 1M token.',
      },
      'claude-v4.7-opus': {
        label: 'Claude 4.7 (Opus)',
        description:
          'Model Opus berkemampuan tinggi yang dibuat untuk coding, alur kerja perusahaan, dan tugas agen jangka panjang.',
      },
      'claude-v3-opus': {
        label: 'Claude 3 (Opus)',
        description: 'Model yang kuat untuk tugas-tugas yang sangat kompleks.',
      },
      'mistral-7b-instruct': {
        label: 'Mistral 7B',
        description:
          'Dapat menghasilkan teks bahasa Inggris dengan kemampuan coding alami',
      },
      'mixtral-8x7b-instruct': {
        label: 'Mixtral-8x7B',
        description:
          'Model Mixture-of-Experts (MoE) yang populer, berkualitas tinggi, dan ideal untuk merangkum teks, tanya jawab, klasifikasi teks, melengkapi teks, dan menghasilkan kode',
      },
      'mistral-large': {
        label: 'Mistral Large',
        description:
          'Ideal untuk tugas-tugas rumit yang memerlukan kemampuan penalaran substansial, atau tugas-tugas yang sangat terspesialisasi, seperti Pembuatan Teks Sintetis atau Pembuatan Kode',
      },
      'amazon-nova-pro': {
        label: 'Amazon Nova Pro',
        description:
          'Model multimodal berkemampuan tinggi dengan kombinasi terbaik antara akurasi, kecepatan, dan biaya untuk berbagai macam tugas.',
      },
      'amazon-nova-lite': {
        label: 'Amazon Nova Lite',
        description:
          'Model multimodal dengan biaya sangat rendah yang sangat cepat dalam memproses input gambar, video, dan teks.',
      },
      'amazon-nova-micro': {
        label: 'Amazon Nova Micro',
        description:
          'Model teks saja yang memberikan respons dengan latensi terendah dalam keluarga model Amazon Nova dengan biaya sangat rendah.',
      },
      'qwen3-235b-a22b-2507': {
        label: 'Qwen3 235B A22B',
        description:
          'Model Mixture-of-Experts 235B parameter dengan 22B parameter aktif, jendela konteks 256K, dan kemampuan penalaran untuk pembuatan teks dan kode.',
      },
      'qwen3-coder-30b-a3b': {
        label: 'Qwen3 Coder 30B A3B',
        description:
          'Model Mixture-of-Experts 30B parameter untuk koding dengan 3B parameter aktif, jendela konteks 256K, maksimal output 16K, dan penalaran untuk pembuatan kode.',
      },
      'qwen3-32b': {
        label: 'Qwen3 32B',
        description:
          'Model padat 32B parameter dengan jendela konteks 32K, maksimal output 8K, dan mode berpikir hybrid untuk respons cepat dan penalaran mendalam.',
      },
    },
    agent: {
      label: 'Agen',
      help: {
        overview:
          'Dengan menggunakan fungsionalitas Agen, chatbot Anda dapat secara otomatis menangani tugas-tugas yang lebih kompleks.',
      },
      hint: `Agen secara otomatis menentukan alat mana yang akan digunakan untuk menjawab pertanyaan pengguna. Karena waktu yang dibutuhkan untuk pengambilan keputusan, waktu respons cenderung lebih lama. Mengaktifkan satu atau lebih alat memungkinkan fungsionalitas agen. Sebaliknya, jika tidak ada alat yang dipilih, fungsionalitas agen tidak digunakan. Ketika fungsionalitas agen diaktifkan, penggunaan "Pengetahuan" juga diperlakukan sebagai salah satu alat. Ini berarti bahwa "Pengetahuan" mungkin tidak digunakan dalam respons.`,
      progress: {
        label: 'Berpikir...',
      },
      progressCard: {
        toolInput: 'Input: ',
        toolOutput: 'Output: ',
        status: {
          running: 'Sedang Berjalan...',
          success: 'Berhasil',
          error: 'Kesalahan',
        },
      },
      tools: {
        get_weather: {
          name: 'Cuaca Saat Ini',
          description: 'Mengambil prakiraan cuaca saat ini.',
        },
        sql_db_query: {
          name: 'Query Database',
          description:
            'Menjalankan query SQL yang detail dan benar untuk mengambil hasil dari database.',
        },
        sql_db_schema: {
          name: 'Skema Database',
          description:
            'Mengambil skema dan sampel baris data dari daftar tabel.',
        },
        sql_db_list_tables: {
          name: 'Daftar Tabel Database',
          description: 'Daftar semua tabel yang tersedia di database.',
        },
        sql_db_query_checker: {
          name: 'Pemeriksa Query',
          description:
            'Periksa apakah query SQL Anda sudah benar sebelum dieksekusi.',
        },
        internet_search: {
          name: 'Pencarian Internet',
          description: 'Mencari informasi di internet.',
        },
        knowledge_base_tool: {
          name: 'Ambil Pengetahuan',
          description: 'Mengambil informasi dari Pengetahuan.',
        },
      },
    },
    bot: {
      label: {
        myBots: 'Bot Saya',
        recentlyUsedBots: 'Bot Bersama yang Baru Digunakan',
        knowledge: 'Pengetahuan',
        url: 'URL',
        s3url: 'Sumber Data S3',
        sitemap: 'URL Sitemap',
        file: 'File',
        loadingBot: 'Memuat...',
        normalChat: 'Chat',
        notAvailableBot: '[TIDAK tersedia]',
        notAvailableBotInputMessage: 'Bot ini TIDAK tersedia.',
        noDescription: 'Tanpa Deskripsi',
        notAvailable: 'Bot ini TIDAK tersedia.',
        noBots: 'Tidak Ada Bot.',
        noBotsRecentlyUsed: 'Tidak Ada Bot Bersama yang Baru Digunakan.',
        retrievingKnowledge: '[Mengambil Pengetahuan...]',
        dndFileUpload:
          'Anda dapat mengunggah file dengan drag and drop.\nFile yang didukung: {{fileExtensions}}',
        uploadError: 'Pesan Kesalahan',
        referenceLink: 'Tautan Referensi',
        syncStatus: {
          queue: 'Menunggu Sinkronisasi',
          running: 'Sedang Sinkronisasi',
          success: 'Sinkronisasi Selesai',
          fail: 'Sinkronisasi Gagal',
        },
        fileUploadStatus: {
          uploading: 'Mengunggah...',
          uploaded: 'Diunggah',
          error: 'KESALAHAN',
        },
        quickStarter: {
          title: 'Panduan Percakapan Cepat',
          exampleTitle: 'Judul',
          example: 'Contoh Percakapan',
        },
        citeRetrievedContexts: 'Referensi Konteks yang Diambil',
        unsupported: 'Tidak Didukung, Hanya Bisa Dibaca',
      },
      titleSubmenu: {
        edit: 'Edit',
        copyLink: 'Salin Tautan',
        copiedLink: 'Disalin',
      },
      help: {
        overview:
          'Bot beroperasi sesuai dengan instruksi yang telah ditetapkan. Dalam percakapan biasa, kita perlu mendefinisikan konteks dalam pesan. Namun dengan bot, kita tidak perlu menjelaskan konteks pembicaraan di dalam setiap pesan.',
        instructions:
          'Tentukan bagaimana bot harus berperilaku. Memberikan instruksi yang ambigu dapat menyebabkan perilaku yang tidak dapat diprediksi, jadi berikan instruksi yang jelas dan spesifik.',
        knowledge: {
          overview:
            'Dengan menyediakan pengetahuan eksternal kepada bot, bot menjadi mampu mengolah informasi baru yang tidak dilatih sebelumnya.',
          url: 'Informasi dari URL yang ditentukan akan digunakan sebagai sumber Pengetahuan.',
          s3url:
            'Dengan memasukkan URI S3, Anda dapat menambahkan S3 sebagai sumber data. Anda dapat menambahkan hingga 4 sumber. Hanya mendukung bucket yang ada di akun dan region yang sama dengan region Bedrock.',
          sitemap:
            'Dengan memasukkan URL sitemap, informasi akan dikumpulkan secara otomatis dari website-website yang terdaftar dalam sitemap dan digunakan sebagai sumber Pengetahuan.',
          file: 'File yang diunggah akan digunakan sebagai sumber Pengetahuan.',
          citeRetrievedContexts:
            'Konfigurasikan apakah akan konteks yang diambil untuk menjawab pertanyaan penggunaakan ditampilkan sebagai informasi kutipan.\nJika diaktifkan, pengguna dapat mengakses URL atau file sumber aslinya.',
        },
        quickStarter: {
          overview:
            'Saat memulai percakapan, berikan contoh. Contoh tersebut menggambarkan cara menggunakan bot.',
        },
      },
      alert: {
        sync: {
          error: {
            title: 'Kesalahan Sinkronisasi Pengetahuan',
            body: 'Terjadi kesalahan saat menyinkronkan Pengetahuan. Silakan periksa pesan berikut:',
          },
          incomplete: {
            title: 'TIDAK Siap',
            body: 'Bot ini belum menyelesaikan sinkronisasi pengetahuan, sehingga masih menggunakan Pengetahuan sebelum pembaruan.',
          },
        },
      },
      samples: {
        title: 'Contoh Instruksi',
        anthropicLibrary: {
          title: 'Pustaka Prompt Anthropic',
          sentence: 'Apakah Anda memerlukan lebih banyak contoh? Kunjungi: ',
          url: 'https://docs.anthropic.com/claude/prompt-library',
        },
        pythonCodeAssistant: {
          title: 'Asisten Kode Python',
          prompt: `Tulis skrip python yang singkat dan berkualitas tinggi untuk tugas yang diberikan, seperti yang akan ditulis oleh ahli Python yang sangat terampil. Anda menulis kode untuk developer berpengalaman, jadi hanya tambahkan komentar untuk hal-hal yang tidak jelas. Pastikan untuk menyertakan perintah import yang diperlukan. 
    JANGAN PERNAH menulis apa pun sebelum blok \`\`\`python\`\`\`. Setelah Anda selesai menghasilkan kode dan setelah blok \`\`\`python\`\`\`, periksa pekerjaan Anda dengan cermat untuk memastikan tidak ada kesalahan, error, atau inkonsistensi. Jika ada kesalahan, cantukman kesalahan tersebut dalam tag <error>, lalu hasilkan versi baru dengan kesalahan yang sudah diperbaiki. Jika tidak ada kesalahan, tulis "DIPERIKSA: TIDAK ADA KESALAHAN" dalam tag <error>.`,
        },
        mailCategorizer: {
          title: 'Pengklasifikasi EMail',
          prompt: `Anda adalah agen layanan pelanggan yang ditugaskan untuk mengklasifikasikan email berdasarkan jenisnya. Harap berikan jawaban Anda dan kemudian jelaskan alasan klasifikasi Anda. 
    
    Kategori klasifikasi adalah: 
    (A) Pertanyaan pra-penjualan 
    (B) Barang rusak atau cacat 
    (C) Pertanyaan penagihan 
    (D) Lainnya (harap jelaskan)
    
    Bagaimana Anda akan mengkategorikan email ini?`,
        },
        fitnessCoach: {
          title: 'Pelatih Kebugaran Pribadi',
          prompt: `Anda adalah pelatih kebugaran pribadi yang ceria dan antusias bernama Sam. Sam bersemangat membantu klien menjadi bugar dan menjalani gaya hidup yang lebih sehat. Anda menulis dengan nada yang mendukung dan ramah serta selalu berusaha membimbing klien Anda menuju tujuan kebugaran yang lebih baik. Jika pengguna bertanya sesuatu yang tidak terkait dengan kebugaran, arahkan kembali ke topik kebugaran, atau katakan bahwa Anda tidak dapat menjawab.`,
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
        description: 'Deskripsi',
        instruction: 'Instruksi',
      },
      explore: {
        label: {
          pageTitle: 'Konsol Bot',
        },
      },
      apiSettings: {
        pageTitle: 'Pengaturan API Publikasi Bot Bersama',
        label: {
          endpoint: 'Endpoint API',
          usagePlan: 'Rencana Penggunaan',
          allowOrigins: 'Origin yang Diizinkan',
          apiKeys: 'Kunci API',
          period: {
            day: 'Per HARI',
            week: 'Per MINGGU',
            month: 'Per BULAN',
          },
          apiKeyDetail: {
            creationDate: 'Tanggal Pembuatan',
            active: 'Aktif',
            inactive: 'Tidak Aktif',
            key: 'Kunci API',
          },
        },
        item: {
          throttling: 'Pembatasan',
          burstLimit: 'Lonjakan',
          rateLimit: 'Batas Kecepatan',
          quota: 'Kuota',
          requestLimit: 'Permintaan',
          offset: 'Offset',
        },
        help: {
          overview:
            'Membuat API memungkinkan fungsi Bot diakses oleh klien eksternal; API memungkinkan integrasi dengan aplikasi eksternal.',
          endpoint: 'Klien dapat menggunakan Bot dari endpoint ini.',
          usagePlan:
            'Rencana penggunaan menentukan jumlah atau laju permintaan yang diterima API Anda dari klien. Kaitkan API dengan rencana penggunaan untuk melacak permintaan yang diterima API Anda.',
          throttling: 'Batasi laju pengguna dalam memanggil API Anda.',
          rateLimit:
            'Masukkan laju, dalam permintaan per detik, yang dapat dipanggil klien ke API Anda.',
          burstLimit:
            'Masukkan jumlah permintaan bersamaan yang dapat dibuat klien ke API Anda.',
          quota:
            'Aktifkan kuota untuk membatasi jumlah permintaan yang dapat dilakukan pengguna ke API Anda dalam periode waktu tertentu.',
          requestLimit:
            'Masukkan jumlah total permintaan yang dapat dilakukan pengguna sesuai periode waktu yang Anda pilih.',
          allowOrigins:
            'Origin klien yang diizinkan untuk akses. Jika origin tidak diizinkan, pemanggil menerima respons 403 Forbidden dan ditolak aksesnya ke API. Origin harus mengikuti format: "(http|https)://nama-host" atau "(http|https)://nama-host:port" dan wildcard (*) dapat digunakan.',
          allowOriginsExample:
            'mis. https://your-host-name.com, https://*.your-host-name.com, http://localhost:8000',
          apiKeys:
            'Kunci API adalah string alfanumerik yang digunakan untuk mengidentifikasi klien API Anda. Jika tidak tepat, pemanggil menerima respons 403 Forbidden dan ditolak aksesnya ke API.',
        },
        button: {
          ApiKeyShow: 'Tampilkan',
          ApiKeyHide: 'Sembunyikan',
        },
        alert: {
          botUnshared: {
            title: 'Bagikan Bot',
            body: 'Anda tidak dapat mempublikasikan API untuk bot yang tidak dibagikan.',
          },
          deploying: {
            title: 'Deployment API sedang BERLANGSUNG',
            body: 'Harap tunggu hingga deployment selesai.',
          },
          deployed: {
            title: 'API telah DIPUBLIKASIKAN',
            body: 'Anda dapat mengakses API dari Klien menggunakan Endpoint API dan Kunci API.',
          },
          deployError: {
            title: 'GAGAL mempublikasikan API',
            body: 'Silakan hapus dan buat ulang API.',
          },
        },
        deleteApiDaialog: {
          title: 'Hapus?',
          content:
            'Apakah Anda yakin ingin menghapus API? Endpoint API akan dihapus, dan klien tidak akan lagi memiliki akses.',
        },
        addApiKeyDialog: {
          title: 'Tambah Kunci API',
          content: 'Masukkan nama untuk mengidentifikasi Kunci API.',
        },
        deleteApiKeyDialog: {
          title: 'Hapus?',
          content:
            'Apakah Anda yakin ingin menghapus <Bold>{{title}}</Bold>?\nKlien yang menggunakan Kunci API ini akan ditolak aksesnya ke API.',
        },
      },
      button: {
        newBot: 'Buat Bot Baru',
        create: 'Buat',
        edit: 'Ubah',
        save: 'Simpan',
        delete: 'Hapus',
        share: 'Bagikan',
        apiSettings: 'Pengaturan Publikasi API',
        copy: 'Salin',
        copied: 'Disalin',
        instructionsSamples: 'Contoh',
        chooseFiles: 'Pilih file',
      },
      deleteDialog: {
        title: 'Hapus?',
        content: 'Apakah Anda yakin ingin menghapus <Bold>{{title}}</Bold>?',
      },
      shareDialog: {
        title: 'Bagikan',
        off: {
          content:
            'Pembagian tautan dimatikan, jadi hanya Anda yang dapat mengakses bot ini melalui URL-nya.',
        },
        on: {
          content:
            'Pembagian tautan diaktifkan, jadi SEMUA pengguna dapat menggunakan tautan ini untuk mengakses bot.',
        },
      },
      error: {
        notSupportedFile: 'File ini tidak didukung.',
        duplicatedFile: 'File dengan nama yang sama telah diunggah.',
        failDeleteApi: 'Gagal menghapus API.',
      },
      activeModels: {
        title: 'Aktivasi Model',
        description: 'Atur model AI mana yang dapat digunakan oleh bot ini.',
      },
    },
    admin: {
      botAnalytics: {
        label: {
          pageTitle: 'Analitik Bot',
          noBotUsages:
            'Selama Periode Perhitungan, tidak ada bot yang digunakan.',
          published: 'API telah dipublikasikan.',
          SearchCondition: {
            title: 'Periode Perhitungan',
            from: 'Dari',
            to: 'Ke',
          },
          sortByCost: 'Urutkan berdasarkan Biaya',
        },
        help: {
          overview:
            'Pantau status penggunaan Bot dan API Bot yang Dipublikasikan.',
          calculationPeriod:
            'Jika Periode Perhitungan tidak diatur, biaya untuk hari ini akan ditampilkan.',
        },
      },
      apiManagement: {
        label: {
          pageTitle: 'Manajemen API',
          publishedDate: 'Tanggal Diterbitkan',
          noApi: 'Tidak Ada API.',
        },
      },
      botManagement: {
        label: {
          pageTitle: 'Manajemen Bot',
          sharedUrl: 'URL Bot Bersama',
          apiSettings: 'Pengaturan Publikasi API',
          noKnowledge: 'Bot ini tidak memiliki Pengetahuan.',
          notPublishApi: 'API bot ini belum dipublikasikan.',
          deployStatus: 'Status Deployment',
          cfnStatus: 'Status CloudFormation',
          codebuildStatus: 'Status CodeBuild',
          codeBuildId: 'ID CodeBuild',
          usagePlanOn: 'NYALA',
          usagePlanOff: 'MATI',
          rateLimit:
            '<Bold>{{limit}}</Bold> permintaan per detik, yang dapat dipanggil klien ke API.',
          burstLimit:
            'Klien dapat melakukan <Bold>{{limit}}</Bold> permintaan bersamaan ke API.',
          requestsLimit:
            'Anda dapat melakukan <Bold>{{limit}}</Bold> permintaan <Bold>{{period}}</Bold>.',
        },
        alert: {
          noApiKeys: {
            title: 'Tidak Ada Kunci API',
            body: 'Semua klien tidak dapat mengakses API.',
          },
        },
        button: {
          deleteApi: 'Hapus API',
        },
      },
      validationError: {
        period: 'Masukkan Dari dan Ke',
      },
    },
    deleteDialog: {
      title: 'Hapus?',
      content: 'Apakah Anda yakin ingin menghapus <Bold>{{title}}</Bold>?',
    },
    clearDialog: {
      title: 'Hapus SEMUA?',
      content: 'Apakah Anda yakin ingin menghapus SEMUA percakapan?',
    },
    languageDialog: {
      title: 'Ganti Bahasa',
    },
    feedbackDialog: {
      title: 'Masukan',
      content: 'Silakan berikan detail lebih lanjut.',
      categoryLabel: 'Kategori',
      commentLabel: 'Komentar',
      commentPlaceholder: '(Opsional) Masukkan komentar Anda',
      categories: [
        {
          value: 'notFactuallyCorrect',
          label: 'Tidak faktual',
        },
        {
          value: 'notFullyFollowRequest',
          label: 'Tidak sepenuhnya mengikuti permintaan saya',
        },
        {
          value: 'other',
          label: 'Lainnya',
        },
      ],
    },
    button: {
      newChat: 'Chat Baru',
      botConsole: 'Konsol Bot',
      botAnalytics: 'Analitik Bot',
      apiManagement: 'Manajemen API',
      userUsages: 'Penggunaan Pengguna',
      SaveAndSubmit: 'Simpan & Kirim',
      resend: 'Kirim Ulang',
      regenerate: 'Hasilkan ulang',
      delete: 'Hapus',
      deleteAll: 'Hapus Semua',
      done: 'Selesai',
      ok: 'OK',
      cancel: 'Batal',
      back: 'Kembali',
      menu: 'Menu',
      language: 'Bahasa',
      clearConversation: 'Hapus SEMUA percakapan',
      signOut: 'Keluar',
      close: 'Tutup',
      add: 'Tambah',
      continue: 'Lanjutkan menghasilkan',
    },
    input: {
      hint: {
        required: '* Wajib diisi',
      },
      validationError: {
        required: 'Field ini wajib diisi.',
        invalidOriginFormat: 'Format Origin tidak valid.',
      },
    },
    embeddingSettings: {
      title: 'Pengaturan Embedding',
      description:
        'Anda dapat mengonfigurasi parameter untuk embeddings vektor. Dengan menyesuaikan parameter, Anda dapat mengubah akurasi pengambilan dokumen.',
      chunkSize: {
        label: 'ukuran potongan',
        hint: 'Ukuran potongan mengacu pada ukuran di mana sebuah dokumen dibagi menjadi potongan-potongan dokumen yang lebih kecil',
      },
      chunkOverlap: {
        label: 'irisan potongan',
        hint: 'Anda dapat menentukan jumlah karakter yang beririsan antara potongan-potongan yang bersebelahan.',
      },
      enablePartitionPdf: {
        label:
          'Aktifkan analisis PDF terperinci. Jika diaktifkan, PDF akan dianalisis secara mendetail seiring waktu.',
        hint: 'Efektif ketika Anda ingin meningkatkan akurasi pencarian. Biaya komputasi meningkat karena komputasi membutuhkan lebih banyak waktu.',
      },
      help: {
        chunkSize:
          'Ketika ukuran potongan dokumen terlalu kecil, informasi kontekstual bisa hilang. Namun ketika ukuran potongan dokumen terlalu besar, informasi kontekstual yang berbeda mungkin ada dalam potongan yang sama dan berpotensi mengurangi akurasi pencarian.',
        chunkOverlap:
          'Dengan menentukan irisan potongan dokumen, Anda dapat mempertahankan informasi kontekstual di sekitar batas-batas potongan. Meningkatkan ukuran potongan terkadang dapat meningkatkan akurasi pencarian. Namun, perlu diketahui bahwa meningkatkan irisan potongan dapat menyebabkan biaya komputasi yang lebih tinggi.',
        overlapTokens:
          'Anda mengonfigurasi jumlah token yang akan beririsan, atau berulang di antara potongan yang bersebelahan. Misalnya, jika Anda mengatur irisan token menjadi 60, maka 60 token terakhir di potongan pertama juga akan dimasukkan di awal potongan kedua.',
        maxParentTokenSize:
          'Anda dapat menentukan ukuran potongan induk. Dalam proses pengambilan data, sistem awalnya akan mengambil potongan anak, namun kemudian menggantinya dengan potongan induk yang lebih luas agar model memiliki konteks yang lebih komprehensif',
        maxChildTokenSize:
          'Anda dapat menentukan ukuran potongan anak. Dalam proses pengambilan data, sistem awalnya akan mengambil potongan anak, namun kemudian menggantinya dengan potongan induk yang lebih luas agar model memiliki konteks yang lebih komprehensif',
        bufferSize:
          'Parameter ini dapat mempengaruhi seberapa banyak teks yang diperiksa bersama untuk menentukan batas setiap potongan, yang berdampak pada tingkat detail dan keterkaitan potongan yang dihasilkan. Ukuran buffer yang lebih besar mungkin dapat menangkap lebih banyak konteks tetapi juga dapat menimbulkan noise, sementara ukuran buffer yang lebih kecil mungkin melewatkan konteks penting tetapi memastikan pemotongan yang lebih tepat.',
        breakpointPercentileThreshold:
          'Ambang batas yang lebih tinggi mengharuskan kalimat lebih mudah dibedakan agar dapat dipisahkan menjadi potongan yang berbeda. Ambang batas yang lebih tinggi menghasilkan lebih sedikit potongan dan biasanya ukuran potongan rata-rata yang lebih besar.',
      },
      alert: {
        sync: {
          error: {
            title: 'Kesalahan Pemisah Kalimat',
            body: 'Coba lagi dengan nilai irisan potongan yang lebih kecil',
          },
        },
      },
    },
    generationConfig: {
      title: 'Konfigurasi Respons',
      description:
        'Anda dapat mengatur parameter inferensi LLM untuk mengontrol respons dari model.',
      maxTokens: {
        label: 'Panjang respons/token baru maksimum',
        hint: 'Jumlah maksimum token yang diizinkan dalam respons yang dihasilkan',
      },
      temperature: {
        label: 'Temperatur',
        hint: 'Mempengaruhi bentuk distribusi probabilitas output dan mempengaruhi kemungkinan model memilih output dengan probabilitas lebih rendah',
        help: 'Pilih nilai yang lebih rendah untuk respons yang lebih terfokus dan dapat diprediksi; Pilih nilai yang lebih tinggi untuk respons yang lebih kreatif dan beragam',
      },
      topK: {
        label: 'Top-k',
        hint: 'Jumlah kandidat token yang dipertimbangkan model untuk token berikutnya',
        help: 'Pilih nilai yang lebih rendah untuk mengurangi jumlah kandidat dan membatasi opsi ke output yang lebih umum; Pilih nilai yang lebih tinggi untuk meningkatkan jumlah kandidat dan memungkinkan model mempertimbangkan output yang lebih beragam',
      },
      topP: {
        label: 'Top-p',
        hint: 'Batas persentase kandidat token yang dipertimbangkan model untuk token berikutnya',
        help: 'Pilih nilai yang lebih rendah untuk mengurangi jumlah kandidat dan membatasi opsi ke output yang lebih umum; Pilih nilai yang lebih tinggi untuk meningkatkan jumlah kandidat dan memungkinkan model mempertimbangkan output yang lebih beragam',
      },
      stopSequences: {
        label: 'Token akhir/urutan akhir',
        hint: 'Tentukan urutan karakter yang menghentikan respons model. Gunakan koma untuk memisahkan beberapa kata',
      },
    },
    searchSettings: {
      title: 'Pengaturan Pencarian',
      description:
        'Anda dapat mengonfigurasi parameter pencarian untuk mengambil dokumen yang relevan dari penyimpanan vektor.',
      maxResults: {
        label: 'Hasil Maksimum',
        hint: 'Jumlah maksimum entri yang diambil dari penyimpanan vektor',
      },
      searchType: {
        label: 'Jenis Pencarian',
        hybrid: {
          label: 'Pencarian hybrid',
          hint: 'Menggabungkan skor relevansi dari pencarian semantik dan pencarian teks untuk memberikan akurasi yang lebih besar.',
        },
        semantic: {
          label: 'Pencarian semantik',
          hint: 'Menggunakan embeddings vektor untuk memberikan hasil yang relevan.',
        },
      },
    },
    knowledgeBaseSettings: {
      title: 'Pengaturan Pengetahuan',
      description:
        'Pilih model embeddings untuk mengonfigurasi Pengetahuan, dan atur metode untuk memotong dokumen yang ditambahkan sebagai sumber Pengetahuan. Pengaturan ini tidak dapat diubah setelah membuat bot.',
      embeddingModel: {
        label: 'Model Embeddings',
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
          label: 'pemotongan default',
          hint: 'Secara otomatis membagi teks menjadi potongan sekitar 300 token secara default. Jika dokumen kurang dari atau sudah 300 token, tidak akan dipotong lagi.',
        },
        fixed_size: {
          label: 'pemotongan ukuran tetap',
          hint: 'Membagi teks menjadi potongan-potongan sesuai ukuran token yang ditetapkan.',
        },
        hierarchical: {
          label: 'pemotongan hierarkis',
          hint: 'Membagi teks menjadi struktur bertingkat berupa potongan induk dan potongan anak.',
        },
        semantic: {
          label: 'pemotongan semantik',
          hint: 'Membagi teks berdasarkan makna untuk meningkatkan pemahaman dan pengambilan informasi.',
        },
        none: {
          label: 'Tidak ada pemotongan',
          hint: 'Dokumen tidak akan dibagi.',
        },
      },
      chunkingMaxTokens: {
        label: 'Token Maksimum',
        hint: 'Jumlah maksimum token per potongan',
      },
      chunkingOverlapPercentage: {
        label: 'Persentase irisan antara Potongan',
        hint: 'Irisan token pada potongan induk tergantung pada ukuran token potongan anak dan persentase irisan potongan anak yang Anda tentukan.',
      },
      overlapTokens: {
        label: 'Irisan Token',
        hint: 'Jumlah token yang diulang di potongan-potongan yang bersebelahan',
      },
      maxParentTokenSize: {
        label: 'Ukuran Maksimum Potongan Induk',
        hint: 'Jumlah maksimum token yang dapat dimiliki potongan dalam lapisan Induk',
      },
      maxChildTokenSize: {
        label: 'Ukuran Maksimum Potongan Anak',
        hint: 'Jumlah maksimum token yang dapat dimiliki potongan dalam lapisan Anak',
      },
      bufferSize: {
        label: 'Ukuran Buffer',
        hint: 'jumlah kalimat sekitar yang akan ditambahkan untuk pembuatan embeddings. Ukuran buffer 1 menghasilkan 3 kalimat (kalimat saat ini, kalimat sebelumnya, dan kalimat berikutnya) yang digabungkan dan di-embed',
      },
      breakpointPercentileThreshold: {
        label: 'Ambang Batas Persentil Breakpoint',
        hint: 'Ambang batas persentil jarak/ketidakmiripan kalimat untuk menentukan pemisah antara kalimat.',
      },
      opensearchAnalyzer: {
        label: 'Analyzer (Tokenisasi, Normalisasi)',
        hint: 'Anda dapat menentukan analyzer untuk tokenisasi dan normalisasi dokumen yang terdaftar sebagai sumber Pengetahuan. Memilih analyzer yang sesuai akan meningkatkan akurasi pencarian. Silakan pilih analyzer optimal yang sesuai dengan bahasa yang digunakan dalam Pengetahuan Anda.',
        icu: {
          label: 'ICU analyzer',
          hint: 'Untuk tokenisasi, {{tokenizer}} digunakan, dan untuk normalisasi, {{normalizer}} digunakan.',
        },
        kuromoji: {
          label: 'Japanese (kuromoji) analyzer',
          hint: 'Untuk tokenisasi, {{tokenizer}} digunakan, dan untuk normalisasi, {{normalizer}} digunakan.',
        },
        none: {
          label: 'Analyzer default sistem',
          hint: 'Analyzer default yang ditentukan oleh sistem (OpenSearch) akan digunakan.',
        },
        tokenizer: 'Tokenizer:',
        normalizer: 'Normalizer:',
        token_filter: 'Token Filter:',
        not_specified: 'Tidak ditentukan',
      },
      advancedParsing: {
        label: 'Parsing Lanjutan',
        description: 'Pilih model untuk parsing dokumen tingkat lanjut.',
        hint: 'Cocok untuk memahami lebih dari sekadar teks standar dalam format dokumen yang didukung, misalnya termasuk tabel dalam PDF dengan struktur utuh. Biaya tambahan dikenakan untuk parsing menggunakan AI generatif.',
      },
      parsingModel: {
        label: 'Model Parsing Lanjutan',
        none: {
          label: 'Dinonaktifkan',
          hint: 'Tidak ada parsing lanjutan yang akan diterapkan.',
        },
        claude_3_5_sonnet_v1: {
          label: 'Claude 3.5 Sonnet v1',
          hint: 'Gunakan Claude 3.5 Sonnet v1 untuk parsing dokumen lanjutan.',
        },
        claude_3_haiku_v1: {
          label: 'Claude 3 Haiku v1',
          hint: 'Gunakan Claude 3 Haiku v1 untuk parsing dokumen lanjutan.',
        },
      },
      webCrawlerConfig: {
        title: 'Konfigurasi Web Crawler',
        crawlingScope: {
          label: 'Lingkup Crawling',
          default: {
            label: 'Default',
            hint: 'Batasi crawling ke halaman web yang berasal dari host yang sama dan dengan awalan URL yang sama. Misalnya, dengan URL "https://aws.amazon.com/bedrock/", maka hanya informasi dari path ini dan halaman web yang berasal dari path ini seperti "https://aws.amazon.com/bedrock/agents/" yang akan diambil. URL yang sejajar seperti "https://aws.amazon.com/ec2/" tidak akan diproses.',
          },
          subdomains: {
            label: 'Subdomain',
            hint: 'Sertakan crawling halaman web apa pun yang memiliki domain utama yang sama dengan URL awal. Misalnya, dengan URL awal "https://aws.amazon.com/bedrock/" maka halaman web apa pun yang mengandung "amazon.com" akan di-crawl, seperti "https://www.amazon.com".',
          },
          hostOnly: {
            label: 'Hanya Host',
            hint: 'Batasi crawling ke halaman web yang termasuk dalam host yang sama. Misalnya, dengan URL awal "https://aws.amazon.com/bedrock/", maka halaman web dengan "https://docs.aws.amazon.com" juga akan di-crawl, seperti "https://aws.amazon.com/ec2".',
          },
        },
        includePatterns: {
          label: 'Pola yang Disertakan',
          hint: 'Tentukan pola yang akan disertakan dalam web crawling. Hanya URL yang cocok dengan pola ini yang akan disertakan.',
        },
        excludePatterns: {
          label: 'Pola yang Dikecualikan',
          hint: 'Tentukan pola yang akan dikecualikan dari web crawling. URL yang cocok dengan pola ini tidak akan disertakan.',
        },
      },
      advancedConfigration: {
        existingKnowledgeBaseId: {
          label: 'ID Amazon Bedrock Knowledge Base',
          description:
            'Masukkan ID Amazon Bedrock Knowledge Base eksisting Anda.',
        },
        createDedicatedKnowledgeBase: {
          label: 'Buat Knowledge Base berdedikasi',
        },
        createTenantInSharedKnowledgeBase: {
          label: 'Buat penyewa di Knowledge Base bersama',
        },
        useExistingKnowledgeBase: {
          label: 'Gunakan Knowledge Base eksisting',
        },
      },
    },
    error: {
      answerResponse: 'Terjadi kesalahan saat merespons.',
      notFoundConversation:
        'Karena chat yang ditentukan tidak ada, layar chat baru ditampilkan.',
      notFoundPage: 'Halaman yang Anda cari tidak ditemukan.',
      unexpectedError: {
        title: 'Terjadi kesalahan yang tidak terduga.',
        restore: 'Kembali ke halaman UTAMA',
      },
      predict: {
        general: 'Terjadi kesalahan saat memprediksi.',
        invalidResponse:
          'Respons yang tidak terduga diterima. Format respons tidak sesuai dengan format yang diharapkan.',
      },
      notSupportedImage: 'Model yang dipilih tidak mendukung gambar.',
      unsupportedFileFormat: 'Format file yang dipilih tidak didukung.',
      totalFileSizeToSendExceeded:
        'Ukuran total file tidak boleh lebih dari {{maxSize}}.',
      attachment: {
        fileSizeExceeded:
          'Ukuran setiap dokumen tidak boleh lebih dari {{maxSize}}.',
        fileCountExceeded:
          'Tidak dapat mengunggah lebih dari {{maxCount}} file.',
      },
    },
    validation: {
      title: 'Kesalahan Validasi',
      maxRange: {
        message: 'Nilai maksimum yang dapat diatur adalah {{size}}',
      },
      minRange: {
        message: 'Nilai minimum yang dapat diatur adalah {{size}}',
      },
      chunkOverlapLessThanChunkSize: {
        message: 'Nilai irisan token harus kurang dari ukuran potongan dokumen',
      },
      parentTokenRange: {
        message:
          'Ukuran token potongan induk harus lebih besar dari ukuran token potongan anak',
      },
      quickStarter: {
        message: 'Silakan masukkan baik Judul maupun Contoh Percakapan.',
      },
    },
    helper: {
      shortcuts: {
        title: 'Tombol pintasan',
        items: {
          focusInput: 'Geser fokus ke input chat',
          newChat: 'Buka chat baru',
        },
      },
    },
    guardrails: {
      title: 'Guardrails',
      label: 'Aktifkan Guardrails untuk Amazon Bedrock',
      hint: 'Guardrails untuk Amazon Bedrock digunakan untuk menerapkan pengaman khusus aplikasi berdasarkan kasus penggunaan Anda dan kebijakan AI yang bertanggung jawab.',
      harmfulCategories: {
        label: 'Kategori Berbahaya',
        hint: 'Konfigurasikan filter konten dengan menyesuaikan tingkat penyaringan untuk mendeteksi dan memblokir input pengguna yang berbahaya dan respons model yang melanggar kebijakan penggunaan Anda. 0: nonaktifkan, 1: rendah, 2: sedang, 3: tinggi',
        hate: {
          label: 'Hate',
          hint: 'Menggambarkan prompt input dan respons model yang mendiskriminasi, mengkritik, menghina, mengecam, atau mendehumanisasi seseorang atau kelompok berdasarkan identitas (seperti ras, etnis, gender, agama, orientasi seksual, kemampuan, dan asal negara). 0: nonaktifkan, 1: rendah, 2: sedang, 3: tinggi',
        },
        insults: {
          label: 'Insult',
          hint: 'Menggambarkan prompt input dan respons model yang mencakup bahasa yang merendahkan, memalukan, mengejek, menghina, atau meremehkan. Jenis bahasa ini juga diberi label sebagai bullying. 0: nonaktifkan, 1: rendah, 2: sedang, 3: tinggi',
        },
        sexual: {
          label: 'Seksual',
          hint: 'Menggambarkan prompt input dan respons model yang menunjukkan minat, aktivitas, atau gairah seksual dengan menggunakan referensi langsung atau tidak langsung ke bagian tubuh, ciri fisik, atau kelamin. 0: nonaktifkan, 1: rendah, 2: sedang, 3: tinggi',
        },
        violence: {
          label: 'Kekerasan',
          hint: 'Menggambarkan prompt input dan respons model yang mencakup glorifikasi atau ancaman untuk menyebabkan rasa sakit fisik, luka, atau cedera terhadap seseorang, kelompok, atau sesuatu. 0: nonaktifkan, 1: rendah, 2: sedang, 3: tinggi',
        },
        misconduct: {
          label: 'Perilaku Buruk',
          hint: 'Menggambarkan prompt input dan respons model yang mencari atau memberikan informasi tentang keterlibatan dalam kegiatan pelanggaran etik, atau mencelakai, menipu, atau memanfaatkan seseorang, kelompok, atau institusi. 0: nonaktifkan, 1: rendah, 2: sedang, 3: tinggi',
        },
      },
      contextualGroundingCheck: {
        label: 'Pemeriksaan Kontekstual',
        hint: 'Gunakan kebijakan ini untuk memvalidasi apakah respons model didasarkan pada sumber referensi dan relevan dengan pertanyaan pengguna, sehingga dapat mengurangi kemungkinan halusinasi model.',
        groundingThreshold: {
          label: 'Grounding',
          hint: 'Validasi apakah respons model memilik dasar dan secara faktual benar berdasarkan informasi yang diberikan dalam sumber referensi, dan blok respons yang berada di bawah ambang batas grounding yang ditentukan. 0: tidak memblokir apa pun, 1: memblokir hampir semuanya',
        },
        relevanceThreshold: {
          label: 'Relevansi',
          hint: 'Validasi apakah respons model relevan dengan pertanyaan pengguna dan blok respons yang berada di bawah ambang batas relevansi yang ditentukan. 0: tidak memblokir apa pun, 1: memblokir hampir semuanya',
        },
      },
    },
  },
};

export default translation;
