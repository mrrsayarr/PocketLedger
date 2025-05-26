# PocketLedger Proje Analiz ve Yeniden Üretim Promptu


---

## 1. Proje Klasör ve Dosya Yapısı

```
src/
├── ai/                  # AI entegrasyonları ve yardımcıları
│   ├── ai-instance.ts
│   └── dev.ts
├── app/                 # Tüm sayfalar ve global stiller
│   ├── about/           # Hakkında (EN)
│   │   └── page.tsx
│   ├── about-es/        # Hakkında (ES)
│   │   └── page.tsx
│   ├── about-tr/        # Hakkında (TR)
│   │   └── page.tsx
│   ├── debt-reduction/  # Borç azaltma sayfası ve çeviriler
│   │   ├── page.tsx
│   │   └── translations.ts
│   ├── notes/           # Notlar sayfası
│   │   └── page.tsx
│   ├── settings/        # Ayarlar sayfası
│   │   └── page.tsx
│   ├── todo/            # Yapılacaklar sayfası
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css      # Global Tailwind ve tema stilleri
│   ├── layout.tsx       # Uygulama genel layout ve tema scripti
│   └── page.tsx         # Ana sayfa (dashboard)
├── components/          # Ortak ve UI bileşenleri
│   ├── icons.ts         # Lucide-react ikonları
│   └── ui/              # Shadcn UI tabanlı özelleştirilmiş bileşenler
│       └── ...          # (button, card, table, sidebar, vs.)
├── hooks/               # Özel React hook'ları
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                 # Yardımcı fonksiyonlar ve veri tabanı
│   ├── database.ts
│   └── utils.ts
```

---

## 2. Tasarım, Tema ve UI/UX Prensipleri

- **Tasarım Dili:** Modern, minimal, soft renkler, yüksek kontrast, bol boşluk, kart tabanlı layout.
- **Tema:** Light/Dark mode desteği. Tema renkleri ve radius'lar CSS değişkenleriyle (`globals.css` ve `tailwind.config.ts`) yönetilir. Kullanıcı tercihi localStorage'da saklanır.
- **Fontlar:** Google Fonts (Inter ve Roboto Mono), layout.tsx ile global olarak uygulanır.
- **Responsive:** Tüm sayfalar ve sidebar mobil uyumlu, breakpoint'ler ve conditional rendering ile yönetilir.
- **UI Bileşenleri:** Shadcn UI (Radix UI tabanlı), src/components/ui altında özelleştirilmiş. Tüm formlar, butonlar, kartlar, tablolar, dialoglar, menüler, progress bar, vs. burada.
- **İkonlar:** Lucide-react ikonları, components/icons.ts ile merkezi yönetim.
- **Animasyon:** tailwindcss-animate ile geçişler ve açılır/kapanır efektler.
- **Kullanıcı Deneyimi:** Hızlı geri bildirim (toast, modal, loading spinner), erişilebilirlik (a11y), klavye kısayolları (ör. sidebar için ctrl+b).

---

## 3. Tema ve Global Stil Yönetimi

- **globals.css:** Tüm renkler, radius, sidebar, kart, grafik, gelir/gider renkleri CSS değişkenleriyle tanımlı. Light ve dark mode için ayrı root tanımları var.
- **tailwind.config.ts:** Renkler, border-radius, animasyonlar ve pluginler burada yönetilir. `darkMode: ["class"]` ile dark mode class tabanlı.
- **layout.tsx:** Fontlar, meta, viewport, tema scripti ve children renderı burada. İlk yüklemede localStorage'dan tema okunur ve body'ye class eklenir.

---

## 4. Sidebar ve Navigasyon

- **Sidebar:** src/components/ui/sidebar.tsx içinde, tamamen özelleştirilmiş, responsive, collapsible (ikon-only, offcanvas), mobilde Sheet ile açılır. Menü, grup, badge, tooltip, action, separator, header/footer gibi alt bileşenler içerir.
- **Navigasyon:** Sidebar menüleri, ana sayfa, notlar, borç, yapılacaklar, ayarlar ve hakkında sayfalarına yönlendirir. Aktif sayfa vurgusu, badge ve tooltip desteği var.
- **Klavye Kısayolu:** Ctrl+B ile sidebar aç/kapat.

---

## 5. UI Bileşenleri ve Özelleştirmeler

- **Button, Card, Input, Table, Dialog, Alert, Dropdown, Tabs, Calendar, Progress, Checkbox, Popover, Tooltip, Accordion, Badge, Avatar, Menubar, Select, Sheet, Skeleton, Slide-to-confirm, vs.**
- Tüm bileşenler Shadcn UI tabanlı, class-variance-authority ile varyant ve boyut desteği, Tailwind ile stillenmiş.
- Her bileşen erişilebilirlik (a11y) ve klavye desteğiyle yazılmış.
- **Özel chart.tsx:** Grafikler için özel wrapper ve stiller.

---

## 6. Sayfa ve Fonksiyon Analizi (Her Sayfa İçin Ayrıntılı Format)

Aşağıdaki formatı her sayfa için uygula:

---
### [Sayfa Adı] (`src/app/[klasör]/page.tsx`)
- **Kullanılan Bileşenler:** (örn. Card, Table, Button, Dialog, PieChart, vs.)
- **Veri Yönetimi:** (örn. useState, localStorage, IndexedDB, context, vs.)
- **Tema ve Dil:** (örn. Dark mode, çoklu dil, para birimi, vs.)
- **Sayfa Fonksiyonu:** (sayfanın temel amacı ve işlevi)
- **Özel Mantık:** (sayfaya özgü algoritma, hesaplama, iş akışı)
- **Kullanıcı Etkileşimi:** (formlar, tablo, grafik, modal, toast, vs.)
- **Responsive Davranış:** (mobilde nasıl davranıyor, hangi bileşenler gizleniyor/değişiyor)
- **Tasarım Notları:** (renk, spacing, ikon, animasyon, erişilebilirlik, vs.)

---

## 7. Örnek Ayrıntılı Analizler

### Ana Sayfa (`src/app/page.tsx`)
- **Kullanılan Bileşenler:** Card, Input, Button, Table, Calendar, PieChart (recharts), AlertDialog, Dialog, DropdownMenu, Popover, Tooltip, Toaster, Icons
- **Veri Yönetimi:** useState ile state, localStorage ile kalıcı veri, kategori ve para birimi yönetimi
- **Tema ve Dil:** Dark mode, çoklu para birimi (TRY, USD, EUR, GBP, JPY)
- **Sayfa Fonksiyonu:** Gelir/gider takibi, kategoriye göre harcama analizi, PieChart ile görselleştirme, işlem ekleme/düzenleme/silme
- **Özel Mantık:** Kategorilere göre harcama yüzdesi, sayfalama, işlem düzenleme modalı, localStorage ile veri kalıcılığı
- **Kullanıcı Etkileşimi:** Form ile işlem ekleme, tablo ile listeleme, PieChart ile görselleştirme, modal ve dialog ile düzenleme/silme, toast ile bildirim
- **Responsive Davranış:** Mobilde kartlar ve tablo stack, PieChart responsive, sidebar Sheet olarak açılır
- **Tasarım Notları:** Soft arka plan, kart gölgeleri, renkli kategori ikonları, animasyonlu geçişler, erişilebilirlik için aria-label ve klavye desteği

---

### Hakkında Sayfası (`src/app/about/page.tsx`)
- **Kullanılan Bileşenler:** Card, Button, Icons
- **Veri Yönetimi:** Sadece tema tercihi için localStorage
- **Tema ve Dil:** Dark mode, İngilizce
- **Sayfa Fonksiyonu:** Uygulama amacı, veri güvenliği ve çalışma prensibi hakkında bilgilendirme
- **Özel Mantık:** Yok
- **Kullanıcı Etkileşimi:** Navigasyon butonları, responsive başlık
- **Responsive Davranış:** Mobilde başlık ve butonlar stack, kartlar tam genişlik
- **Tasarım Notları:** Bilgilendirici ikonlar, kart gölgeleri, soft arka plan, erişilebilirlik için kontrast

---

### Borç Azaltma Sayfası (`src/app/debt-reduction/page.tsx`)
- **Kullanılan Bileşenler:** Card, Input, Button, Select, Calendar, Popover, Dialog, AlertDialog, DropdownMenu, Progress, Accordion, Icons, Toaster
- **Veri Yönetimi:** useState, localStorage ile borç ve ödeme yönetimi, çoklu dil desteği (translations.ts)
- **Tema ve Dil:** Dark mode, çoklu dil (en, tr, es), para birimi seçimi
- **Sayfa Fonksiyonu:** Borç ekleme, ödeme planı oluşturma, ödeme takibi, borç kapama
- **Özel Mantık:** Borç bakiyesi otomatik güncelleme, ödeme geçmişi, dil bazlı çeviri, progress bar ile ödeme ilerlemesi
- **Kullanıcı Etkileşimi:** Formlar, ödeme modalı, ödeme düzenleme, silme, progress bar, toast ile bildirim
- **Responsive Davranış:** Mobilde formlar ve kartlar stack, progress bar yatay kaydırılabilir
- **Tasarım Notları:** Renkli progress bar, kategori ikonları, animasyonlu geçişler, erişilebilirlik için açıklama metinleri

---

### Notlar Sayfası (`src/app/notes/page.tsx`)
- **Kullanılan Bileşenler:** Card, Input, Button, Textarea, Table, Tabs, Popover, Calendar, Tooltip, Toaster, Icons
- **Veri Yönetimi:** useState, localStorage ile not saklama, varlık türü ve miktar yönetimi
- **Tema ve Dil:** Dark mode, para birimi seçimi
- **Sayfa Fonksiyonu:** Finansal not ekleme, varlık takibi, tablo ve kart görünümü
- **Özel Mantık:** Not sıralama, varlık türüne göre filtreleme, tablo/kart görünümü arasında geçiş
- **Kullanıcı Etkileşimi:** Not ekleme formu, tablo/kart görünümü, silme, toast ile bildirim
- **Responsive Davranış:** Mobilde kart görünümü öncelikli, tablo yatay kaydırılabilir
- **Tasarım Notları:** Renkli kategori etiketleri, kart gölgeleri, animasyonlu geçişler

---

### Ayarlar Sayfası (`src/app/settings/page.tsx`)
- **Kullanılan Bileşenler:** Card, Button, Switch, DropdownMenu, AlertDialog, Toaster, Icons
- **Veri Yönetimi:** useState, localStorage ile tema, para birimi ve yedekleme yönetimi
- **Tema ve Dil:** Dark mode, para birimi seçimi
- **Sayfa Fonksiyonu:** Tema ve para birimi ayarı, veri yedekleme/geri yükleme
- **Özel Mantık:** Yedekleme ID'lerinden tarih çıkarımı, toplu yedek yönetimi, slide-to-confirm ile veri silme
- **Kullanıcı Etkileşimi:** Switch ile tema, dropdown ile para birimi, yedekleme/geri yükleme butonları, toast ile bildirim
- **Responsive Davranış:** Mobilde kartlar stack, butonlar tam genişlik
- **Tasarım Notları:** Onay dialogları, renkli switch, animasyonlu geçişler

---

### Yapılacaklar Sayfası (`src/app/todo/page.tsx`)
- **Kullanılan Bileşenler:** Card, Input, Button, Checkbox, AlertDialog, Tabs, ScrollArea, Toaster, Icons
- **Veri Yönetimi:** useState, localStorage ile yapılacaklar listesi
- **Tema ve Dil:** Dark mode
- **Sayfa Fonksiyonu:** Görev ekleme, tamamlama, silme, ongoing/completed ayrımı
- **Özel Mantık:** Tamamlanma tarihi yönetimi, ongoing/completed filtreleme
- **Kullanıcı Etkileşimi:** Görev ekleme formu, checkbox ile tamamlama, silme dialogu, toast ile bildirim
- **Responsive Davranış:** Mobilde kartlar stack, scroll area ile uzun liste yönetimi
- **Tasarım Notları:** Tamamlanan görevler için opaklık, ikonlu butonlar, animasyonlu geçişler

---

## 8. Komponent ve Hook Analizi

- **components/ui/**: Tüm UI bileşenleri burada, her biri Shadcn UI tabanlı ve özelleştirilmiş. Her bileşenin varyant, boyut ve tema desteği var.
- **components/icons.ts:** Tüm ikonlar merkezi olarak burada yönetilir, Lucide-react tabanlı.
- **hooks/**: use-toast (bildirim), use-mobile (responsive kontrol) gibi özel hook'lar.
- **lib/**: database.ts (IndexedDB/localStorage işlemleri), utils.ts (yardımcı fonksiyonlar).

---

## 9. Analiz Sonucu Sunumu ve Genişletme

- Her yeni sayfa veya bileşen için yukarıdaki formatı kullanarak analiz ekle.
- UI/UX, tema, responsive ve erişilebilirlik detaylarını atlama.
- Projede yeni bir sayfa veya bileşen eklendiğinde aynı adımları uygula.
- UI bileşenleri özelleştirilmişse, src/components/ui altındaki dosyaları da incele.
- Tasarım ve kullanıcı deneyimiyle ilgili gözlemleri de ekle.

---

Yukarıdaki promptu başka bir yapay zekaya verdiğinizde, projeyi en ayrıntılı ve profesyonel şekilde analiz edebilir ve yeniden üretebilir.
