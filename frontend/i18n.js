// Interface copy only. User input and real API results are never translated.
export const messages = {
  en: {
    title: 'prism-review · Make sense of contributions.', workspace: 'WORKSPACE', overview: 'Overview', pullRequests: 'Pull requests', analytics: 'Analytics',
    localTitle: 'Local intelligence. Your control.', localBody: 'Designed for Gemma.\nThe final decision is always yours.', theme: 'Change theme', team: 'Team Localhost',
    settings: 'API settings', language: 'Interface language', demoMode: 'Demo mode', apiMode: 'API mode', footer: 'Built by Localhost, for open source.',
    close: 'Close', newReview: 'NEW REVIEW', addTitle: 'Make sense of a contribution.', addHelp: 'Add the PR details. Demo mode creates a sample assessment.',
    prTitle: 'PR title', titlePlaceholder: 'fix: handle expired sessions', description: 'Description (optional)', descriptionPlaceholder: 'What problem does this PR solve?',
    diff: 'Code changes (diff)', diffPlaceholder: '- old line\n+ new line', analyze: '✧ Analyze', analyzing: 'Analyzing…',
    connection: 'Connection settings', connectionHelp: 'API mode sends new PRs to your FastAPI server. The active model is reported by /health. Existing samples remain demo data.', mode: 'Mode',
    demoOption: 'Demo — sample assessment', apiOption: 'API — backend assessment', backendUrl: 'Backend URL', apiHelp: 'POST /analyze · Use the page’s address when FastAPI serves the frontend.', save: 'Save settings',
    eyebrow: 'LESS NOISE FOR OPEN SOURCE', dashboardTitle: 'Make sense of contributions.', analyticsTitle: 'The bigger picture.',
    dashboardSubtitle: 'Less manual review. More meaningful contributions.', prsSubtitle: 'Look closer at every contribution. Set your review priorities.', analyticsSubtitle: 'Quality, category and risk across your review queue.',
    export: '↓ Export CSV', add: '＋ Analyze PR', openSource: 'Open source', sampleRepo: 'Sample repository · GitHub is not connected yet',
    total: 'Total pull requests', totalNote: 'All contributions in one place', highRisk: 'High risk', highNote: 'Priority human review', spam: 'Flagged as spam', spamNote: 'Contribution quality assessment', ready: 'Ready for review', readyNote: 'Quality ≥ 4 · low risk',
    activity: 'Contribution activity', sevenDays: '7 days ending at the latest PR', incoming: 'Incoming pull requests', sampleActivity: 'Samples + additions this session', activityLabel: 'Pull requests over the last seven days',
    riskDistribution: 'Risk distribution', allPRs: 'All PRs', low: 'Low', medium: 'Medium', high: 'High', riskLabel: '{risk} risk',
    recent: 'Recent pull requests', queue: 'Review queue', viewAll: 'View all ↗', queueNote: 'Discover and prioritize contributions.', search: 'Search PRs', searchPlaceholder: 'Search PR title, author or number…',
    categoryFilter: 'Category filter', allCategories: 'All categories', riskFilter: 'Risk filter', allRisks: 'All risks', sort: 'Sort PRs', newest: 'Newest first', oldest: 'Oldest first', qualityDesc: 'Quality: high to low', qualityAsc: 'Quality: low to high', riskDesc: 'Risk: high to low',
    category: 'CATEGORY', quality: 'QUALITY', risk: 'RISK', contributor: 'CONTRIBUTOR', date: 'DATE', detail: 'DETAIL', clear: 'Clear filters ↺', suspicious: 'Suspicious content', demo: 'Demo', api: 'API', openDetail: 'Open details: {title}',
    empty: 'No PRs match these filters.', emptyHelp: 'Try another search or clear the filters.', results: 'Showing {visible} of {total} matching PRs',
    humanTitle: 'Nothing is sent or merged automatically. You decide.', humanBody: 'No PR is automatically merged, closed or answered. Sample assessments are for demonstration only.',
    categoriesTitle: 'Contributions by category', average: 'Average quality', humanCount: 'Human review required', analyticsHelp: 'These charts show sample PRs and additions this session. Model accuracy and performance have not been measured.',
    demoAssessment: 'DEMO ASSESSMENT', apiAssessment: 'API ASSESSMENT', humanRequired: 'Human review required', injectionTitle: '⚠ Suspected prompt injection', injectionBody: 'This PR contains text that attempts to influence the reviewer. Treat it as untrusted content; human review is required.',
    summary: '✧ Review summary', reasons: 'Assessment reasons', missing: 'Things to check', reply: 'Reply draft', replyHelp: 'Edit, review and copy if you wish.', replyLabel: 'Editable reply draft', copy: '▢ Copy draft', copied: 'Reply draft copied.', copyFallback: 'Automatic copy is unavailable. Press Ctrl+C to copy the selected text.',
    exported: 'Exported {count} PRs.', storageError: 'Browser storage is unavailable; settings apply to this session only.', settingsSaved: 'Connection settings saved.', required: 'Please enter a PR title and code changes.',
    modelUnavailable: 'The model is not ready. Start the model service and try again shortly. Your input has been kept.', timeout: 'The model took too long to respond. Check the backend and try again.', network: 'Could not connect to the backend. Check the address and that the server is running.',
    invalidResponse: 'The backend returned an unexpected assessment format. Check the API contract.', requestError: 'The analysis request failed (HTTP {status}). Check the backend and try again.', invalidUrl: 'Enter an HTTP or HTTPS backend address.',
    demoAdded: 'Demo assessment added.', apiAdded: 'API assessment completed.', demoSummary: 'Demo assessment: no real model review was performed.', suspiciousSummary: 'Demo assessment: suspicious instructions or a risky code pattern were flagged.', received: 'PR title, description and diff received.', useAPI: 'Switch to API mode for a backend assessment.', reviewNeeded: 'Human review and real model analysis are required.',
    modelFake: 'Fake model', modelUnknown: 'Model not reported', modelOffline: 'Model info unavailable', modelName: 'Model: {model}', loadingModel: '{model} is analyzing. The first request may take around 30 seconds.', loadingAPI: 'The backend is analyzing. The first request may take around 30 seconds.', loadingDemo: 'Preparing a demo assessment.', elapsed: 'Elapsed: {seconds} s', duration: 'Analysis: {seconds} s', durationNote: 'Client-observed request and response time, including network and server work.',
    csvPR: 'PR', csvTitle: 'Title', csvCategory: 'Category', csvQuality: 'Quality', csvRisk: 'Risk', csvAuthor: 'Author', csvDate: 'Date', csvSource: 'Source'
  },
  tr: {
    title: 'prism-review · Katkıları anlamlandır.', workspace: 'ÇALIŞMA ALANI', overview: 'Genel bakış', pullRequests: 'Pull request’ler', analytics: 'Analitik',
    localTitle: 'Yerel zekâ. Tam kontrol.', localBody: 'Gemma için tasarlandı.\nSon karar her zaman sende.', theme: 'Temayı değiştir', team: 'Localhost takımı',
    settings: 'API ayarları', language: 'Arayüz dili', demoMode: 'Demo modu', apiMode: 'API modu', footer: 'Localhost tarafından, açık kaynak için.',
    close: 'Kapat', newReview: 'YENİ İNCELEME', addTitle: 'Bir katkıyı anlamlandır.', addHelp: 'PR bilgilerini ekle. Demo modunda örnek bir değerlendirme oluşturulur.',
    prTitle: 'PR başlığı', titlePlaceholder: 'fix: oturum kontrolünü düzelt', description: 'Açıklama (isteğe bağlı)', descriptionPlaceholder: 'Bu PR hangi sorunu çözüyor?',
    diff: 'Kod değişiklikleri (diff)', diffPlaceholder: '- eski satır\n+ yeni satır', analyze: '✧ Analiz et', analyzing: 'Analiz ediliyor…',
    connection: 'Bağlantı ayarları', connectionHelp: 'API modu, yeni PR’ları FastAPI sunucusuna gönderir. Etkin model /health yanıtından öğrenilir. Mevcut örnekler demo verisi olarak kalır.', mode: 'Çalışma modu',
    demoOption: 'Demo — örnek değerlendirme', apiOption: 'API — backend değerlendirmesi', backendUrl: 'Backend adresi', apiHelp: 'POST /analyze · Frontend FastAPI’den açılıyorsa sayfanın adresini kullan.', save: 'Ayarları kaydet',
    eyebrow: 'AÇIK KAYNAK İÇİN DAHA AZ GÜRÜLTÜ', dashboardTitle: 'Katkıları anlamlandır.', analyticsTitle: 'Katkıların büyük resmi.',
    dashboardSubtitle: 'Daha az manuel inceleme. Daha anlamlı katkılar.', prsSubtitle: 'Her katkıya yakından bak. İnceleme sıranı sen belirle.', analyticsSubtitle: 'İnceleme kuyruğunun kalite, kategori ve risk dağılımı.',
    export: '↓ CSV indir', add: '＋ PR analiz et', openSource: 'Açık kaynak', sampleRepo: 'Örnek depo · GitHub bağlantısı henüz kurulmadı',
    total: 'Toplam pull request', totalNote: 'Tüm katkılar tek bir yerde', highRisk: 'Yüksek riskli', highNote: 'Öncelikli insan incelemesi', spam: 'Spam olarak işaretli', spamNote: 'Katkı kalitesi değerlendirmesi', ready: 'İncelemeye hazır', readyNote: 'Kalite ≥ 4 · düşük risk',
    activity: 'Katkı aktivitesi', sevenDays: 'En son PR’a göre 7 gün', incoming: 'Gelen pull request', sampleActivity: 'Örnek veri + bu oturumdaki eklemeler', activityLabel: 'Son yedi gündeki PR sayıları',
    riskDistribution: 'Risk dağılımı', allPRs: 'Tüm PR’lar', low: 'Düşük', medium: 'Orta', high: 'Yüksek', riskLabel: '{risk} risk',
    recent: 'Son pull request’ler', queue: 'İnceleme kuyruğu', viewAll: 'Tümünü görüntüle ↗', queueNote: 'Katkıları keşfet, önceliklendir.', search: 'PR ara', searchPlaceholder: 'PR başlığı, yazar veya numara ara…',
    categoryFilter: 'Kategori filtresi', allCategories: 'Tüm kategoriler', riskFilter: 'Risk filtresi', allRisks: 'Tüm riskler', sort: 'PR sıralaması', newest: 'En yeniden eskiye', oldest: 'En eskiden yeniye', qualityDesc: 'Puan: yüksekten düşüğe', qualityAsc: 'Puan: düşükten yükseğe', riskDesc: 'Risk: yüksekten düşüğe',
    category: 'KATEGORİ', quality: 'KALİTE', risk: 'RİSK', contributor: 'KATKICI', date: 'TARİH', detail: 'DETAY', clear: 'Filtreleri temizle ↺', suspicious: 'Şüpheli içerik', demo: 'Demo', api: 'API', openDetail: 'PR detayını aç: {title}',
    empty: 'Bu filtrelere uygun PR bulunamadı.', emptyHelp: 'Aramayı değiştirebilir veya filtreleri temizleyebilirsin.', results: '{total} sonuçtan {visible} PR gösteriliyor',
    humanTitle: 'Hiçbir şey otomatik gönderilmez veya birleştirilmez, karar sende.', humanBody: 'Hiçbir PR otomatik olarak birleştirilmez, kapatılmaz veya yanıtlanmaz. Örnek analizler demo amaçlıdır.',
    categoriesTitle: 'Kategorilere göre katkılar', average: 'Ortalama kalite', humanCount: 'İnsan incelemesi gerekli', analyticsHelp: 'Bu grafikler örnek PR’ları ve bu oturumda eklediklerini gösterir. Model doğruluğu veya performans ölçümü yapılmamıştır.',
    demoAssessment: 'DEMO DEĞERLENDİRMESİ', apiAssessment: 'API DEĞERLENDİRMESİ', humanRequired: 'İnsan incelemesi gerekli', injectionTitle: '⚠ Prompt injection şüphesi', injectionBody: 'PR içeriğinde modeli yönlendirmeyi amaçlayan ifadeler var. İçerik güvenilir bir talimat olarak değerlendirilmemeli; bakımcı incelemesi gerekli.',
    summary: '✧ Analiz özeti', reasons: 'Değerlendirme gerekçeleri', missing: 'Kontrol edilmesi gerekenler', reply: 'Cevap taslağı', replyHelp: 'Düzenle, kontrol et ve istersen kopyala.', replyLabel: 'Düzenlenebilir cevap taslağı', copy: '▢ Taslağı kopyala', copied: 'Cevap taslağı kopyalandı.', copyFallback: 'Otomatik kopyalama kullanılamıyor. Seçili metni Ctrl+C ile kopyala.',
    exported: '{count} PR dışa aktarıldı.', storageError: 'Tarayıcı depolaması kullanılamıyor; ayarlar bu oturumda geçerli.', settingsSaved: 'Bağlantı ayarları kaydedildi.', required: 'Lütfen PR başlığını ve kod değişikliklerini doldur.',
    modelUnavailable: 'Model henüz hazır değil. Model servisini başlatıp biraz sonra tekrar dene. Girdiğin bilgiler korundu.', timeout: 'Model yanıtı zaman aşımına uğradı. Backend’i kontrol edip tekrar dene.', network: 'Backend’e bağlanılamadı. Adresi ve sunucunun çalıştığını kontrol et.',
    invalidResponse: 'Backend yanıtı beklenen analiz biçimine uymuyor. API sözleşmesini kontrol et.', requestError: 'Analiz isteği başarısız oldu (HTTP {status}). Backend’i kontrol edip tekrar dene.', invalidUrl: 'HTTP veya HTTPS ile başlayan bir backend adresi gir.',
    demoAdded: 'Demo değerlendirmesi eklendi.', apiAdded: 'API değerlendirmesi tamamlandı.', demoSummary: 'Demo değerlendirmesi: gerçek bir model analizi yapılmadı.', suspiciousSummary: 'Demo değerlendirmesi: şüpheli talimat veya riskli kod örüntüsü işaretlendi.', received: 'PR başlığı, açıklaması ve diff alındı.', useAPI: 'Backend değerlendirmesi için API moduna geçin.', reviewNeeded: 'Bakımcı incelemesi ve gerçek model analizi gerekli.',
    modelFake: 'Sahte model', modelUnknown: 'Model bilgisi bildirilmedi', modelOffline: 'Model bilgisi alınamadı', modelName: 'Model: {model}', loadingModel: '{model} analiz ediyor. İlk istek yaklaşık 30 sn sürebilir.', loadingAPI: 'Backend analiz ediyor. İlk istek yaklaşık 30 sn sürebilir.', loadingDemo: 'Demo değerlendirmesi hazırlanıyor.', elapsed: 'Geçen süre: {seconds} sn', duration: 'Analiz: {seconds} sn', durationNote: 'Ağ ve sunucu işlemleri dahil, istemcinin ölçtüğü istek ve yanıt süresi.',
    csvPR: 'PR', csvTitle: 'Başlık', csvCategory: 'Kategori', csvQuality: 'Kalite', csvRisk: 'Risk', csvAuthor: 'Yazar', csvDate: 'Tarih', csvSource: 'Kaynak'
  }
};

export function translate(language, key, values = {}) {
  const text = messages[language]?.[key] ?? messages.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
}

export const localeFor = language => language === 'en' ? 'en-GB' : 'tr-TR';
