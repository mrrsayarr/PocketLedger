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
    minimumPaymentLabel: "Min. Regular Payment", // Changed "Monthly" to "Regular"
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
    totalMinPaymentByType: (freq: string) => `Total Min. ${freq} Payment`, // Dynamic based on frequency
    noActiveDebts: "You have no active debts.",
    remainingBalance: "Remaining Balance",
    minPayment: "Min. Payment",
    interestRate: "Interest Rate",
    addedOn: "Added",
    makeViewPaymentButton: "Make/View Payment",
    deleteDebtTitle: "Delete Debt?",
    deleteDebtDescription: (debtName: string) => `Are you sure you want to delete the debt titled "${debtName}"? This action cannot be undone.`,
    cancel: "Cancel",
    delete: "Delete",
    paidOffDebts: "Paid Off Debts",
    fullyPaid: "Fully Paid",
    initialAmount: "Initial Amount",
    lastPayment: "Last Payment",
    debtReductionStrategies: "Debt Reduction Strategies",
    debtReductionStrategiesDescription: "Methods to pay off your debts faster and more effectively.",
    debtSnowballTitle: "1. Debt Snowball Method",
    debtSnowballDescription: "Pay off debts starting with the smallest balance, while making minimum payments on others. This method provides motivation. (Detailed analysis will be added soon.)",
    debtAvalancheTitle: "2. Debt Avalanche Method",
    debtAvalancheDescription: "Pay off debts starting with the highest interest rate. This method usually saves more on interest in the long run. (Detailed analysis will be added soon.)",
    personalizedStrategiesPlaceholder: "[Personalized strategy recommendations and analysis tools will be available here.]",
    paymentModalTitle: (debtName: string) => `Make Payment / View History: ${debtName}`,
    addPaymentCardTitle: "Add New Payment",
    paymentAmountLabel: "Payment Amount",
    paymentDateLabel: "Payment Date",
    paymentNotesLabel: "Payment Notes (Optional)",
    paymentNotesPlaceholder: "Notes about the payment...",
    savePaymentButton: "Save Payment",
    paymentHistoryCardTitle: "Payment History",
    noPaymentsYet: "No payments made for this debt yet.",
    markAsFullyPaidButton: "Mark as Fully Paid",
    closeButton: "Close",
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
    minimumPaymentLabel: "Min. Düzenli Ödeme", // Changed "Aylık" to "Düzenli"
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
    totalMinPaymentByType: (freq: string) => `Toplam Min. ${freq} Ödeme`, // Dynamic based on frequency
    noActiveDebts: "Aktif borcunuz bulunmamaktadır.",
    remainingBalance: "Kalan Bakiye",
    minPayment: "Min. Ödeme",
    interestRate: "Faiz Oranı",
    addedOn: "Eklenme",
    makeViewPaymentButton: "Ödeme Yap/Görüntüle",
    deleteDebtTitle: "Borcu Sil?",
    deleteDebtDescription: (debtName: string) => `"${debtName}" adlı borcu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
    cancel: "İptal",
    delete: "Sil",
    paidOffDebts: "Ödenmiş Borçlar",
    fullyPaid: "Tamamen Ödendi",
    initialAmount: "Başlangıç Tutarı",
    lastPayment: "Son Ödeme",
    debtReductionStrategies: "Borç Azaltma Stratejileri",
    debtReductionStrategiesDescription: "Borçlarınızı daha hızlı ve etkili bir şekilde ödemek için yöntemler.",
    debtSnowballTitle: "1. Borç Kartopu Yöntemi (Debt Snowball)",
    debtSnowballDescription: "En küçük borçtan başlayarak ödeme yapın, diğerlerine minimum ödeme yapmaya devam edin. Bu yöntem motivasyon sağlar. (Detaylı analiz yakında eklenecektir.)",
    debtAvalancheTitle: "2. Borç Çığ Yöntemi (Debt Avalanche)",
    debtAvalancheDescription: "En yüksek faizli borçtan başlayarak ödeme yapın. Bu yöntem genellikle uzun vadede daha fazla faiz tasarrufu sağlar. (Detaylı analiz yakında eklenecektir.)",
    personalizedStrategiesPlaceholder: "[Kişiselleştirilmiş strateji önerileri ve analiz araçları bu bölümde yer alacaktır.]",
    paymentModalTitle: (debtName: string) => `Ödeme Yap / Geçmişi Görüntüle: ${debtName}`,
    addPaymentCardTitle: "Yeni Ödeme Ekle",
    paymentAmountLabel: "Ödeme Tutarı",
    paymentDateLabel: "Ödeme Tarihi",
    paymentNotesLabel: "Ödeme Notları (Opsiyonel)",
    paymentNotesPlaceholder: "Ödeme ile ilgili notlar...",
    savePaymentButton: "Ödemeyi Kaydet",
    paymentHistoryCardTitle: "Ödeme Geçmişi",
    noPaymentsYet: "Bu borç için henüz ödeme yapılmamış.",
    markAsFullyPaidButton: "Tamamen Ödendi Olarak İşaretle",
    closeButton: "Kapat",
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
export type TranslationKey = keyof (typeof debtTranslations.en); // Ensure all keys are present in 'en'

// Helper to get the English key from a translated value for a specific category (debt type or payment frequency)
const getKeyFromTranslatedValue = (
  value: string,
  lang: Language,
  category: 'debtTypes' | 'paymentFrequencies'
): string  => {
    const currentLangSet = debtTranslations[lang]?.[category] || debtTranslations.en[category];
    const englishSet = debtTranslations.en[category];
    
    for (const key in currentLangSet) {
        if (currentLangSet[key as keyof typeof currentLangSet] === value) {
            // Return the English key corresponding to this translated value
            return key; 
        }
    }
    // Fallback if no match is found (should ideally not happen if value is from translated options)
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
  const fallbackLangSet = debtTranslations.en; // Always fallback to English

  let translationFunctionOrString;

  if (primaryLangSet && key in primaryLangSet) {
    translationFunctionOrString = primaryLangSet[key as keyof typeof primaryLangSet];
  } else if (fallbackLangSet && key in fallbackLangSet) {
    translationFunctionOrString = fallbackLangSet[key as keyof typeof fallbackLangSet];
  } else {
    // If key is not found in either, return the key itself as a fallback
    return String(key);
  }

  if (typeof translationFunctionOrString === 'function') {
    return translationFunctionOrString(...args);
  }
  return String(translationFunctionOrString);
};


// For populating SelectItem options
export const getTranslatedOptions = (lang: Language, category: 'debtTypes' | 'paymentFrequencies'): string[] => {
    const primaryLangSet = debtTranslations[lang]?.[category];
    const fallbackLangSet = debtTranslations.en[category];
    const optionsSet = primaryLangSet || fallbackLangSet;
    return Object.values(optionsSet);
};
