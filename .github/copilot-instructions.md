# FinTrack Frontend — GitHub Copilot Proje Talimatı

Amaç: React tabanlı FinTrack web frontend'ini, Feature-Based (özellik tabanlı) mimari desende,
aşağıdaki backend API'ye uyumlu şekilde geliştirmek.

---

## [ROL]

Sen Kıdemli Frontend Mimarısın. React + TypeScript ile, **Feature-Based (özellik tabanlı)**
mimari deseninde, backend'i .NET 10 Web API olan bir "Hane Gelir-Gider Takip" uygulamasının
frontend'ini geliştiriyorsun.

## [PROJE BAĞLAMI]

FinTrack, birden fazla kullanıcının bir "Hane" (Household) altında ortak bütçe takibi yaptığı
bir uygulamadır. Backend zaten geliştirildi ve aşağıdaki modülleri destekliyor:

1. **Auth** — Register / Login / Refresh Token (JWT tabanlı)
2. **Household** — Hane oluşturma, üyelik, aktif hane seçimi
3. **FinancialAccount** — Kullanıcıya bağlı hesaplar (Kredi Kartı, Banka Hesabı, Yemek Kartı)
4. **Category** — Gelir/Gider kategorileri, alt kategori (parent/child) desteği
5. **LedgerTransaction** — Ana gelir/gider/transfer işlem kayıtları
6. **Installment (Taksit)** — Taksitli kredi kartı harcamaları + otomatik aylık taksit şeması
7. **ProxyTransaction (Emanet)** — Üçüncü şahıs adına yapılan harcamalar + alacak takibi

Tam API sözleşmesi (endpoint'ler, request/response DTO'ları, enum değerleri, iş kuralları)
`docs/FinTrack-API-Specification.md` dosyasında mevcuttur — **her endpoint entegrasyonundan
önce bu dosyayı referans al.**

## [MİMARİ GEREKSİNİMLERİ]

Feature-Based (özellik tabanlı) klasör yapısını kullan:

```
src/
  app/                      # App shell, routing, providers, layout
  shared/                   # Ortak UI bileşenleri, hooks, utils, tipler
    components/
    hooks/
    lib/
    types/
  features/
    auth/
      api/                  # API çağrıları (axios/fetch servisleri)
      components/           # Feature'a özel UI bileşenleri
      hooks/                # Feature'a özel custom hook'lar
      types/                # DTO tipleri (backend ile birebir uyumlu)
      pages/                # Route bileşenleri (LoginPage, RegisterPage vb.)
    household/
    financial-accounts/
    categories/
    ledger-transactions/
    installments/
    proxy-transactions/
  routes/                   # Route tanımları (react-router)
```

Kurallar:
- Her feature kendi API/state/UI katmanını içerir; feature'lar birbirinin `internal` dosyalarına
  değil sadece `shared/` veya feature'ın dışa açık (`index.ts`) barrel export'una bağımlı olmalı.
- Ortak bileşenler (buton, modal, form input, tablo) `shared/components` altında olmalı.
- API istemcisi (axios instance + interceptor'lar) `shared/lib/apiClient.ts` içinde tek yerden
  yönetilmeli.

## [TEKNOLOJİ TERCİHLERİ] (yoksa şu şekilde ilerle, varsa mevcut projeye uy)

- React 18+, TypeScript (strict mode)
- Routing: React Router v6+
- Server state: TanStack Query (React Query) — API çağrıları için
- Form yönetimi: React Hook Form + Zod (validasyon)
- HTTP client: axios (interceptor ile access token / refresh token yönetimi)
- Stil: Tailwind CSS veya mevcut projede kullanılan kütüphane

## [API ENTEGRASYON KURALLARI]

1. **Response zarfı**: Backend her yanıtı şu şekilde sarar:
   ```ts
   interface ServiceResponse<T> {
     data: T | null;
     isSuccess: boolean;
     message: string;
     errors: string[];
   }
   ```
   Tüm API servis fonksiyonları bu tipi dönmeli; `isSuccess === false` durumunda `errors[]`
   kullanıcıya toast/inline hata olarak gösterilmeli.

2. **Kimlik (ID) yönetimi**: Tüm entity ID'leri şifrelenmiş `string` ("Uid" son ekli alanlar)
   olarak taşınır (örn. `categoryUid`, `financialAccountUid`, `userUid`, `householdUid`).
   Frontend bu değerleri asla parse/decode etmeye çalışmamalı, opak string olarak saklayıp
   backend'e geri göndermelidir. Ham `int` ID hiçbir endpoint'te kullanılmaz.

3. **Auth akışı**:
   - Login sonrası `accessToken` + `refreshToken` + expiry bilgileri saklanmalı (örn. memory +
     httpOnly cookie tercih edilir; localStorage kullanılacaksa XSS riskini belgeye not düş).
   - axios response interceptor: 401 alındığında `refresh-token` endpoint'i çağrılıp orijinal
     istek otomatik tekrarlanmalı; refresh de başarısızsa kullanıcı login sayfasına yönlendirilmeli.

4. **Enum eşlemeleri**: Backend enum'ları sayısal (`number`) olarak gelir/gider. Bu değerleri
   `docs/FinTrack-API-Specification.md` bölüm 9'daki TypeScript enum tanımlarıyla birebir eşleştir
   (örn. `PaymentChannel.CreditCard = 3`). UI'da kullanıcıya gösterilecek Türkçe etiketler için
   ayrı bir `label map` oluştur (enum değeri → görünen metin).

## [ÖZEL İŞ KURALLARI — UI/UX YANSIMALARI]

1. **Actual / Draft ayrımı**: İşlem formunda tarih geçmişse `entryState` otomatik `Actual (1)`
   olarak ayarlanıp kilitlenmeli; gelecek tarih seçilirse kullanıcı `Actual` veya
   `DraftProjected (2)` arasında seçim yapabilmeli.

2. **Taksit planlama**: Taksitli harcama formunda `totalAmount` ve `installmentCount` girilince
   önizleme olarak aylık taksit tutarı ve vade tarihleri (frontend'de hesaplanarak) canlı
   gösterilmeli. Kayıt sonrası backend'den dönen `schedules[]` ile bu önizleme senkron olmalı.
   Taksit takvimi ekranında her ay için toplu görünüm (tüm planların o aya düşen taksitleri)
   sağlanmalı — bu, "önümüzdeki ay ne kadar kredi kartı borcu var" sorusuna cevap verir.

3. **Emanet / Proxy harcamalar**:
   - Bu harcamalar **hanenin net bütçe hesaplarına dahil edilmemeli** (dashboard/grafiklerde
     ayrı "Alacaklar" bölümünde gösterilmeli).
   - `ProxyCase.status` alanına göre renk kodlaması: Open=kırmızı, PartiallySettled=sarı,
     Settled=yeşil, WrittenOff=gri.
   - Kısmi tahsilatlarda kalan tutar = `totalAdvancedAmount - Σ(settlements.amount)` frontend'de
     hesaplanıp gösterilmeli.

4. **Kategori ağacı**: Kategoriler `parentCategoryUid` ile self-referencing hiyerarşi kurar.
   UI'da kategori seçici (dropdown/tree-select) ana kategori altında alt kategorileri
   girintili/gruplu göstermeli.

## [GÖREV SIRASI ÖNERİSİ]

1. Proje iskeleti + routing + auth (login/register/refresh) akışı
2. Household seçimi / aktif hane context'i (global state — tüm sonraki istekler bu haneye bağlı)
3. FinancialAccount CRUD ekranları
4. Category CRUD (ağaç yapılı seçici dahil)
5. LedgerTransaction (gelir/gider) CRUD + liste/filtreleme
6. Installment (taksit) planlama ekranı + takvim görünümü
7. ProxyTransaction (emanet) başlatma/kapatma akışı + alacak takip paneli
8. Dashboard: aylık gelir-gider özeti (proxy harcamalar hariç), yaklaşan taksitler, açık emanetler

## [BAŞLARKEN COPILOT'A SÖYLE]

> "docs/FinTrack-API-Specification.md dosyasını oku ve bu talimatlara göre [X modülü] için
> feature klasörünü oluştur: api servis fonksiyonları, TypeScript tipleri, React Query hook'ları
> ve temel CRUD sayfa bileşenleri dahil."

Her yeni feature için bu şablonu kullanarak ilerle.
