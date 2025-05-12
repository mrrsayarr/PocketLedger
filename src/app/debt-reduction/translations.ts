
// src/app/debt-reduction/translations.ts
import type { Debt } from "./page"; // Assuming Debt type is exported from page.tsx

export const debtTranslations = {
  en: {
    pageTitle: "Debt Management",
    backToDashboard: "Back to Dashboard",
    addNewDebt: "Add New Debt",
    addNewDebtDescription: "Create a new debt record.",
    debtNameLabel: "Debt Name/Description",
    debtNamePlaceholder: "e.g., Credit Card Debt (Bank X)",
    lenderLabel: "Lender/Creditor",
    lenderPlaceholder: "e.g., Bank X",
    initialAmountLabel: "Initial Debt Amount",
    currentBalanceLabel: "Current Remaining Balance",
    currentBalancePlaceholder: "Can be same as initial amount",
    interestRateLabel: "Interest Rate (Annual %)",
    interestRatePlaceholder: "e.g., 18.5 (Leave blank if interest-free)",
    minimumPaymentLabel: "Min. Regular Payment",
    minimumPaymentPlaceholder: "e.g., 250",
    paymentFrequencyLabel: "Payment Frequency",
    paymentFrequencyPlaceholder: "Select payment frequency",
    nextDueDateLabel: "Next Due Date",
    pickDate: "Pick a date",
    debtTypeLabel: "Debt Type",
    debtTypePlaceholder: "Select debt type",
    startDateLabel: "Debt Start Date (Optional)",
    notesLabel: "Notes (Optional)",
    debtNotesPlaceholder: "Additional details about the debt...",
    addDebtButton: "Add Debt",
    debtOverview: "Debt Overview",
    totalRemainingDebt: "Total Remaining Debt",
    totalMinPaymentByType: (freq: string) => `Total Min. ${freq} Payment`,
    noActiveDebts: "You have no active debts.",
    remainingBalance: "Remaining Balance",
    minPayment: "Min. Payment",
    interestRate: "Interest Rate",
    addedOn: "Added",
    makeViewPaymentButton: "Manage Payments", // Updated
    deleteDebtTitle: "Delete Debt?",
    deleteDebtDescription: (debtName: string) => `Are you sure you want to delete the debt titled "${debtName}"? This action cannot be undone.`,
    cancel: "Cancel",
    delete: "Delete",
    paidOffDebts: "Paid Off Debts",
    fullyPaid: "Fully Paid",
    initialAmount: "Initial Amount",
    lastPayment: "Last Payment", // Kept as is, you might want "Last Payment Date" for clarity
    lastPaymentOn: "Last Payment", // New specific key for display
    debtReductionStrategies: "Debt Reduction Strategies",
    debtReductionStrategiesDescription: "Explore effective methods to accelerate your debt payoff journey.",
    debtSnowballTitle: "1. Debt Snowball Method",
    debtSnowballDescription: "This method focuses on psychological wins. You'll pay off debts starting with the smallest balance first, regardless of interest rate, while making minimum payments on others. Each paid-off debt builds momentum and motivation. Ideal if you need quick wins to stay motivated.",
    debtAvalancheTitle: "2. Debt Avalanche Method",
    debtAvalancheDescription: "This method is mathematically optimal for saving money on interest. You'll prioritize paying off debts with the highest interest rates first, while making minimum payments on others. This approach typically saves you the most money in the long run, though it might take longer to feel progress on smaller debts.",
    
    aiStrategyTitle: "AI-Powered Strategy Recommendation",
    aiStrategyDescription: "Let our AI analyze your debts and financial situation to suggest the most optimal and personalized payoff plan for you. Get insights beyond generic strategies.",
    aiStrategyButton: "Get My AI Strategy",
    aiStrategyComingSoon: "(Coming Soon - AI features under development)",

    strategyHowItWorks: "How it works:",
    strategyPros: "Pros:",
    strategyCons: "Cons:",
    snowballHowItWorks: "List all debts from smallest to largest balance. Make minimum payments on all debts except the smallest. Attack the smallest debt with any extra funds. Once paid off, roll that payment amount into the next smallest debt.",
    snowballPros: "Quick wins provide strong motivation. Simpler to implement and track.",
    snowballCons: "May result in paying more interest over time compared to other methods.",
    avalancheHowItWorks: "List all debts from highest to lowest interest rate. Make minimum payments on all debts except the one with the highest interest rate. Attack the highest-interest debt with any extra funds. Once paid off, roll that payment amount into the debt with the next highest interest rate.",
    avalanchePros: "Saves the most money on interest in the long run. Mathematically the most efficient method.",
    avalancheCons: "May take longer to see the first debt paid off, potentially impacting motivation.",
    considerations: "Important Considerations:",
    considerationsText: "The best strategy depends on your personal financial situation and psychological preferences. Consider factors like your income stability, risk tolerance, and what motivates you. For complex situations, consulting a financial advisor is recommended. PocketLedger Pro provides information for educational purposes only and does not offer financial advice.",

    paymentModalTitle: (debtName: string) => `Manage Payments: ${debtName}`, // Updated
    addPaymentCardTitle: "Add New Payment",
    editPaymentTitle: "Edit Payment", // New
    paymentAmountLabel: "Payment Amount",
    paymentDateLabel: "Payment Date",
    paymentNotesLabel: "Payment Notes (Optional)",
    paymentNotesPlaceholder: "Notes about the payment...",
    savePaymentButton: "Save Payment",
    updatePaymentButton: "Update Payment", // New
    cancelEditButton: "Cancel Edit", // New
    paymentHistoryCardTitle: "Payment History",
    noPaymentsYet: "No payments made for this debt yet.",
    markAsFullyPaidButton: "Mark as Fully Paid",
    closeButton: "Close",
    deletePaymentTitle: "Delete Payment?", // New
    deletePaymentDesc: "Are you sure you want to delete this payment? This action cannot be undone.", // New
    footerText: (year: number) => `© ${year} PocketLedger Pro. All rights reserved.`,
    
    toastErrorTitle: "Error",
    toastFillRequiredFields: "Please fill all required fields.",
    toastValidNumbers: "Please enter valid numbers for amounts and rate.",
    toastDebtAddedTitle: "Debt Added",
    toastDebtAddedDescription: (debtName: string) => `${debtName} has been added to your list.`,
    toastDebtDeletedTitle: "Debt Deleted",
    toastPaymentAmountDateRequired: "Payment amount and date are required.",
    toastValidPositivePayment: "Please enter a valid positive payment amount.",
    toastPaymentAddedTitle: "Payment Added",
    toastPaymentAddedDescription: (symbol: string, amount: number, debtName: string) => `Payment of ${symbol}${amount.toFixed(2)} for ${debtName} recorded.`,
    toastDebtStatusUpdatedTitle: "Debt Status Updated",
    toastDebtMarkedAsPaid: "Debt marked as fully paid.",
    toastLoadingError: "Failed to parse debts from localStorage:",
    paymentUpdatedTitle: "Payment Updated", // New
    paymentUpdatedDesc: (debtName: string) => `Payment for ${debtName} has been updated.`, // New
    paymentDeletedTitle: "Payment Deleted", // New
    paymentDeletedDesc: "The payment has been removed from history.", // New
    loadingDebts: "Loading debt information...", // New
    selectAnOption: "Select an option",

    paymentFrequencies: {
      "Monthly": "Monthly",
      "Weekly": "Weekly",
      "Bi-Weekly": "Bi-Weekly",
      "Annually": "Annually",
      "One-time": "One-time",
    },
    debtTypes: {
      "Credit Card": "Credit Card",
      "Consumer Loan": "Consumer Loan",
      "Mortgage": "Mortgage",
      "Student Loan": "Student Loan",
      "Auto Loan": "Auto Loan",
      "Personal Debt": "Personal Debt",
      "Other": "Other",
    },
    language: "Language",
    english: "English",
    turkish: "Türkçe",
  },
  tr: {
    pageTitle: "Borç Yönetimi",
    backToDashboard: "Gösterge Paneline Geri Dön",
    addNewDebt: "Yeni Borç Ekle",
    addNewDebtDescription: "Yeni bir borç kaydı oluşturun.",
    debtNameLabel: "Borç Adı/Açıklaması",
    debtNamePlaceholder: "Örn: Kredi Kartı Borcu (Akbank)",
    lenderLabel: "Alacaklı/Borç Veren",
    lenderPlaceholder: "Örn: Akbank",
    initialAmountLabel: "Borcun Başlangıç Tutarı",
    currentBalanceLabel: "Mevcut Kalan Bakiye",
    currentBalancePlaceholder: "Başlangıç tutarı ile aynı olabilir",
    interestRateLabel: "Faiz Oranı (Yıllık %)",
    interestRatePlaceholder: "Örn: 18.5 (Faizsiz ise boş bırakın)",
    minimumPaymentLabel: "Min. Düzenli Ödeme",
    minimumPaymentPlaceholder: "Örn: 250",
    paymentFrequencyLabel: "Ödeme Sıklığı",
    paymentFrequencyPlaceholder: "Ödeme sıklığı seçin",
    nextDueDateLabel: "Son Ödeme Tarihi",
    pickDate: "Tarih seçin",
    debtTypeLabel: "Borç Türü",
    debtTypePlaceholder: "Borç türü seçin",
    startDateLabel: "Borç Başlangıç Tarihi (Opsiyonel)",
    notesLabel: "Notlar (Opsiyonel)",
    debtNotesPlaceholder: "Borçla ilgili ek detaylar...",
    addDebtButton: "Borcu Ekle",
    debtOverview: "Borç Genel Bakışı",
    totalRemainingDebt: "Toplam Kalan Borç",
    totalMinPaymentByType: (freq: string) => `Toplam Min. ${freq} Ödeme`,
    noActiveDebts: "Aktif borcunuz bulunmamaktadır.",
    remainingBalance: "Kalan Bakiye",
    minPayment: "Min. Ödeme",
    interestRate: "Faiz Oranı",
    addedOn: "Eklenme",
    makeViewPaymentButton: "Ödemeleri Yönet", // Updated
    deleteDebtTitle: "Borcu Sil?",
    deleteDebtDescription: (debtName: string) => `"${debtName}" adlı borcu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
    cancel: "İptal",
    delete: "Sil",
    paidOffDebts: "Ödenmiş Borçlar",
    fullyPaid: "Tamamen Ödendi",
    initialAmount: "Başlangıç Tutarı",
    lastPayment: "Son Ödeme",
    lastPaymentOn: "Son Ödeme", // New specific key for display
    debtReductionStrategies: "Borç Azaltma Stratejileri",
    debtReductionStrategiesDescription: "Borçlarınızı daha hızlı ve etkili bir şekilde ödeme yolculuğunuzu hızlandıracak yöntemleri keşfedin.",
    debtSnowballTitle: "1. Borç Kartopu Yöntemi (Debt Snowball)",
    debtSnowballDescription: "Bu yöntem psikolojik kazanımlara odaklanır. Diğer borçlara minimum ödeme yaparken, faiz oranına bakılmaksızın en küçük bakiyeli borçtan başlayarak ödeme yaparsınız. Ödenen her borç, momentum ve motivasyon oluşturur. Motive kalmak için hızlı kazanımlara ihtiyacınız varsa idealdir.",
    debtAvalancheTitle: "2. Borç Çığ Yöntemi (Debt Avalanche)",
    debtAvalancheDescription: "Bu yöntem, faizden tasarruf etmek için matematiksel olarak en uygun olanıdır. Diğer borçlara minimum ödeme yaparken, en yüksek faiz oranına sahip borçları önceliklendirerek ödeme yaparsınız. Bu yaklaşım genellikle uzun vadede size en fazla parayı tasarruf ettirir, ancak küçük borçlarda ilerlemeyi hissetmek daha uzun sürebilir.",
    
    aiStrategyTitle: "Yapay Zeka Destekli Strateji Önerisi",
    aiStrategyDescription: "Yapay zekamızın borçlarınızı ve mali durumunuzu analiz ederek size en uygun ve kişiselleştirilmiş ödeme planını önermesine izin verin. Genel stratejilerin ötesinde bilgiler edinin.",
    aiStrategyButton: "Yapay Zeka Stratejimi Al",
    aiStrategyComingSoon: "(Yakında - Yapay zeka özellikleri geliştirme aşamasındadır)",

    strategyHowItWorks: "Nasıl Çalışır:",
    strategyPros: "Artıları:",
    strategyCons: "Eksileri:",
    snowballHowItWorks: "Tüm borçları en küçükten en büyüğe doğru sıralayın. En küçüğü hariç tüm borçlara minimum ödeme yapın. Ekstra fonlarla en küçük borca yüklenin. Bu borç ödendikten sonra, o ödeme miktarını bir sonraki en küçük borca aktarın.",
    snowballPros: "Hızlı kazanımlar güçlü motivasyon sağlar. Uygulaması ve takibi daha basittir.",
    snowballCons: "Diğer yöntemlere göre zamanla daha fazla faiz ödemenize neden olabilir.",
    avalancheHowItWorks: "Tüm borçları en yüksek faiz oranından en düşüğe doğru sıralayın. En yüksek faizli olan hariç tüm borçlara minimum ödeme yapın. Ekstra fonlarla en yüksek faizli borca yüklenin. Bu borç ödendikten sonra, o ödeme miktarını bir sonraki en yüksek faizli borca aktarın.",
    avalanchePros: "Uzun vadede en fazla faiz tasarrufu sağlar. Matematiksel olarak en verimli yöntemdir.",
    avalancheCons: "İlk borcun ödenmesini görmek daha uzun sürebilir, bu da motivasyonu etkileyebilir.",
    considerations: "Önemli Hususlar:",
    considerationsText: "En iyi strateji, kişisel mali durumunuza ve psikolojik tercihlerinize bağlıdır. Gelir istikrarınız, risk toleransınız ve sizi neyin motive ettiği gibi faktörleri göz önünde bulundurun. Karmaşık durumlar için bir mali danışmana başvurmanız önerilir. PocketLedger Pro yalnızca eğitim amaçlı bilgi sağlar ve mali tavsiye vermez.",
    
    paymentModalTitle: (debtName: string) => `Ödemeleri Yönet: ${debtName}`, // Updated
    addPaymentCardTitle: "Yeni Ödeme Ekle",
    editPaymentTitle: "Ödemeyi Düzenle", // New
    paymentAmountLabel: "Ödeme Tutarı",
    paymentDateLabel: "Ödeme Tarihi",
    paymentNotesLabel: "Ödeme Notları (Opsiyonel)",
    paymentNotesPlaceholder: "Ödeme ile ilgili notlar...",
    savePaymentButton: "Ödemeyi Kaydet",
    updatePaymentButton: "Ödemeyi Güncelle", // New
    cancelEditButton: "Düzenlemeyi İptal Et", // New
    paymentHistoryCardTitle: "Ödeme Geçmişi",
    noPaymentsYet: "Bu borç için henüz ödeme yapılmamış.",
    markAsFullyPaidButton: "Tamamen Ödendi Olarak İşaretle",
    closeButton: "Kapat",
    deletePaymentTitle: "Ödemeyi Sil?", // New
    deletePaymentDesc: "Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.", // New
    footerText: (year: number) => `© ${year} PocketLedger Pro. Tüm hakları saklıdır.`,

    toastErrorTitle: "Hata",
    toastFillRequiredFields: "Lütfen tüm zorunlu alanları doldurun.",
    toastValidNumbers: "Lütfen tutarlar ve oran için geçerli sayılar girin.",
    toastDebtAddedTitle: "Borç Eklendi",
    toastDebtAddedDescription: (debtName: string) => `${debtName} listenize eklendi.`,
    toastDebtDeletedTitle: "Borç Silindi",
    toastPaymentAmountDateRequired: "Ödeme tutarı ve tarihi zorunludur.",
    toastValidPositivePayment: "Lütfen geçerli pozitif bir ödeme tutarı girin.",
    toastPaymentAddedTitle: "Ödeme Eklendi",
    toastPaymentAddedDescription: (symbol: string, amount: number, debtName: string) => `${debtName} için ${symbol}${amount.toFixed(2)} tutarında ödeme kaydedildi.`,
    toastDebtStatusUpdatedTitle: "Borç Durumu Güncellendi",
    toastDebtMarkedAsPaid: "Borç tamamen ödendi olarak işaretlendi.",
    toastLoadingError: "localStorage'dan borçlar ayrıştırılamadı:",
    paymentUpdatedTitle: "Ödeme Güncellendi", // New
    paymentUpdatedDesc: (debtName: string) => `${debtName} için ödeme güncellendi.`, // New
    paymentDeletedTitle: "Ödeme Silindi", // New
    paymentDeletedDesc: "Ödeme geçmişten kaldırıldı.", // New
    loadingDebts: "Borç bilgileri yükleniyor...", // New
    selectAnOption: "Bir seçenek seçin",
    paymentFrequencies: {
      "Monthly": "Aylık",
      "Weekly": "Haftalık",
      "Bi-Weekly": "İki Haftada Bir",
      "Annually": "Yıllık",
      "One-time": "Tek Seferlik",
    },
    debtTypes: {
      "Credit Card": "Kredi Kartı",
      "Consumer Loan": "Tüketici Kredisi",
      "Mortgage": "Konut Kredisi",
      "Student Loan": "Öğrenim Kredisi",
      "Auto Loan": "Taşıt Kredisi",
      "Personal Debt": "Bireysel Borç",
      "Other": "Diğer",
    },
    language: "Dil",
    english: "İngilizce",
    turkish: "Türkçe",
  },
};

export type Language = keyof typeof debtTranslations;
export type TranslationKey = keyof (typeof debtTranslations.en);

const getKeyFromTranslatedValue = (
  value: string,
  lang: Language,
  category: 'debtTypes' | 'paymentFrequencies'
): string  => {
    const currentLangSet = debtTranslations[lang]?.[category] || debtTranslations.en[category];
    const englishSet = debtTranslations.en[category];
    
    for (const key in currentLangSet) {
        if (currentLangSet[key as keyof typeof currentLangSet] === value) {
            return key; 
        }
    }
    if (lang !== 'en') {
        for (const keyInEnglish in englishSet) {
            if (englishSet[keyInEnglish as keyof typeof englishSet] === value) {
                return keyInEnglish;
            }
        }
    }
    return Object.keys(englishSet)[0]; 
};


export const getDebtTypeKeyFromValue = (value: string, lang: Language): Debt["debtType"] => {
    return getKeyFromTranslatedValue(value, lang, 'debtTypes') as Debt["debtType"];
};

export const getPaymentFrequencyKeyFromValue = (value: string, lang: Language): Debt["paymentFrequency"] => {
    return getKeyFromTranslatedValue(value, lang, 'paymentFrequencies') as Debt["paymentFrequency"];
};


export const getDebtTranslation = (lang: Language, key: TranslationKey, ...args: any[]): string => {
  const primaryLangSet = debtTranslations[lang];
  const fallbackLangSet = debtTranslations.en; 

  let translationFunctionOrString;

  if (primaryLangSet && key in primaryLangSet) {
    translationFunctionOrString = primaryLangSet[key as keyof typeof primaryLangSet];
  } else if (fallbackLangSet && key in fallbackLangSet) {
    translationFunctionOrString = fallbackLangSet[key as keyof typeof fallbackLangSet];
  } else {
    console.warn(`Translation key "${String(key)}" not found for language "${lang}".`);
    return String(key);
  }

  if (typeof translationFunctionOrString === 'function') {
    return translationFunctionOrString(...args);
  }
  return String(translationFunctionOrString);
};


export const getTranslatedOptions = (lang: Language, category: 'debtTypes' | 'paymentFrequencies'): string[] => {
    const primaryLangSet = debtTranslations[lang]?.[category];
    const fallbackLangSet = debtTranslations.en[category];
    const optionsSet = primaryLangSet || fallbackLangSet;
    if (!optionsSet) {
        console.warn(`Options category "${category}" not found for language "${lang}" or fallback "en".`);
        return [];
    }
    return Object.values(optionsSet);
};

