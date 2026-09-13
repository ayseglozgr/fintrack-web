# FinTrack API — Backend Özet Dokümanı (Frontend Entegrasyonu İçin)

> Bu doküman, FinTrack.Mid (.NET 10 Web API) backend projesinin frontend (React) tarafından
> tüketilmesi için hazırlanmış referans bir özet niteliğindedir. Aşağıdaki bilgiler doğrudan
> backend kaynak kodundan çıkarılmıştır.

## 1. Genel Mimari

- **Backend**: ASP.NET Core (.NET 10) Web API, Clean Architecture (Domain / Application / Infrastructure / Presentation katmanları)
- **Auth**: JWT Bearer (Access Token + Refresh Token)
- **Kimlik gizleme**: Tüm entity ID'leri dışa **şifrelenmiş string ("Uid")** olarak açılır (`CipherHelper.EncryptId` / `DecryptId`). Frontend, ID'leri asla ham int olarak göndermez/almaz — her zaman `Uid` (string) kullanılır. Household ve FinancialAccount modülleri de dahil, tüm endpoint'ler artık tutarlı şekilde Uid tabanlıdır.
- **Standart response zarfı**: Çoğu endpoint `ServiceResponse<T>` içinde döner:
```json
{
  "data": { },
  "isSuccess": true,
  "message": "",
  "errors": []
}
```
- **Base URL**: `Program.cs` / `launchSettings.json` içinden alınmalı (örn. `https://localhost:xxxx/api`)

## 2. Kimlik Doğrulama (`/api/auth`)

| Method | Endpoint | Body | Yanıt |
|---|---|---|---|
| POST | `/api/auth/register` | `RegisterRequestDto` | `ServiceResponse<...>` |
| POST | `/api/auth/login` | `LoginRequestDto` | `ServiceResponse<LoginResponseDto>` |
| POST | `/api/auth/refresh-token` | `RefreshTokenRequestDto` | `ServiceResponse<LoginResponseDto>` |

**RegisterRequestDto**
```ts
{
  accountName: string;   // 3-50 karakter, zorunlu
  firstName: string;     // 2-100 karakter, zorunlu
  lastName: string;      // 2-100 karakter, zorunlu
  email: string;         // geçerli e-posta, zorunlu
  password: string;      // 8-128 karakter, zorunlu
}
```

**LoginRequestDto**
```ts
{
  accountNameOrEmail: string; // zorunlu
  password: string;           // 8-128 karakter
}
```

**LoginResponseDto**
```ts
{
  userId: number;
  accountName: string;
  email: string;
  accessToken: string;
  accessTokenExpiresAtUtc: string; // ISO date
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}
```

> Frontend: `accessToken`'ı `Authorization: Bearer <token>` header'ında gönder. Süresi dolunca
> `refresh-token` endpoint'i ile yenile.

## 3. Hane (Household) — `/api/household`

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/create` | Yeni hane oluşturur (aynı anda kullanıcıyı üye yapar) |
| PUT | `/update` | Hane bilgisini günceller |
| GET | `/user/{userUid}` | Kullanıcının üyesi olduğu haneleri listeler |
| PUT | `/select-active` | Kullanıcının aktif hanesini değiştirir |

**CreateHouseholdDto**: `{ name: string; userUid: string; }`
**UpdateHouseholdDto**: `{ uid: string; name: string; }`
**HouseholdDto (response)**: `{ uid: string; name: string; createDate: string; }`
**SelectActiveHouseholdRequestDto**: `{ userUid: string; householdUid: string; }`
**UserHouseholdMembershipDto (response, `/user/{userUid}`)**
```ts
{
  userUid: string;
  householdUid: string;
  householdName: string;
  isActive: boolean;
  joinedAt: string;
  membershipStatus: string;
  memberRole: string;
}
```

## 4. Finansal Hesaplar — `/api/financialAccount`

Kullanıcıya bağlıdır (Household'a değil).

| Method | Endpoint | Query/Body |
|---|---|---|
| GET | `/get-all?type={FinancialAccountType}` | opsiyonel filtre |
| GET | `/get-by-id/{uid}` | |
| POST | `/create` | `CreateFinancialAccountRequestDto` |
| PUT | `/update` | `UpdateFinancialAccountRequestDto` |
| DELETE | `/delete/{uid}` | |

**CreateFinancialAccountRequestDto**
```ts
{
  userUid: string;              // zorunlu
  type: FinancialAccountType;   // 1=CreditCard, 2=BankAccount, 3=MealOrTicketCard
  providerName: string;         // zorunlu
  alias: string;                 // zorunlu (kullanıcı dostu isim)
  last4?: string;                // kart son 4 hane
  isActive: boolean;             // default true
}
```

**UpdateFinancialAccountRequestDto**: `{ uid: string; type: number; providerName: string; alias: string; last4?: string; isActive: boolean; }`
(Not: hesap sahipliği güncelleme sırasında değiştirilemez — `userUid` update isteğinde yer almaz.)

**FinancialAccountGetDto (response)**: `{ uid: string; userUid: string; type: number; typeDescriptionTr: string; providerName: string; alias: string; last4?: string; isActive: boolean; }`

## 5. Kategori — `/api/category`

Alt kategori destekli, hane bazlı veya sistem geneli (HouseholdId null) olabilir.

| Method | Endpoint |
|---|---|
| GET | `/get-all` |
| GET | `/get-by-id/{uid}` |
| POST | `/create` |
| PUT | `/update` |
| DELETE | `/delete/{uid}` |

**CategoryGetDto**
```ts
{
  uid: string;
  householdUid?: string | null;
  name: string;
  parentCategoryUid?: string | null;
  direction: number; // 1=Inflow(Gelir), 2=Outflow(Gider)
  isActive: boolean;
}
```

**CreateCategoryRequestDto**: `{ householdUid?: string; name: string; parentCategoryUid?: string; direction: number; isActive: boolean; }`

## 6. İşlemler (Gelir/Gider) — `/api/ledgertransaction`

| Method | Endpoint |
|---|---|
| GET | `/get-all` |
| GET | `/get-by-id/{uid}` |
| POST | `/create` |
| PUT | `/update` |
| DELETE | `/delete/{uid}` |

**CreateLedgerTransactionRequestDto**
```ts
{
  userHouseholdUid: string;       // zorunlu
  financialAccountUid?: string;   // opsiyonel (nakit işlemlerde boş olabilir)
  categoryUid: string;            // zorunlu
  transactionDate: string;        // ISO date
  amount: number;                 // > 0
  transactionType: number;        // 1=Income, 2=Expense, 3=Transfer
  paymentChannel: number;         // 1=Cash, 2=BankTransfer, 3=CreditCard, 4=MealCard
  entryState: number;             // 1=Actual, 2=DraftProjected
  expenseKind?: number;           // 1=Normal(default), 2=ProxyAdvance
  isBudgetNeutral?: boolean;      // default false — proxy harcamalarda true olmalı
  description?: string;
}
```

> **İş kuralı (frontend validasyonu için önemli)**: `transactionDate` geçmişte ise `entryState`
> **Actual (1)** olmalı; gelecekte ise `DraftProjected (2)` seçilebilir. Backend bu kuralı
> uygulasa da, UX için formda anlık uyarı gösterilmesi önerilir.

**LedgerTransactionGetDto**: yukarıdaki alanların hepsi + `uid` (response'da enum'lar `number` olarak gelir).

## 7. Taksitli Harcamalar — `/api/installment`

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/get-all` | Tüm planlar + şemaları (nested) |
| GET | `/get-by-id/{uid}` | Tek plan + şemaları |
| GET | `/get-schedules/{installmentPlanUid}` | Sadece bir plana ait taksit satırları |
| POST | `/create` | Yeni taksitli harcama planı oluşturur (otomatik şema üretir) |
| PUT | `/update` | Planı günceller |
| DELETE | `/delete/{uid}` | |

**CreateInstallmentTransactionRequestDto**
```ts
{
  userHouseholdUid: string;
  financialAccountUid: string;   // zorunlu (genelde kredi kartı hesabı)
  categoryUid: string;
  purchaseDate: string;          // ISO date
  totalAmount: number;           // > 0, toplam tutar
  installmentCount: number;      // 1..N (taksit adedi)
  firstDueDate: string;          // ilk taksit vadesi
  merchantName?: string;
  description?: string;
  paymentChannel?: number;       // default 3 = CreditCard
  entryState?: number;           // default 2 = DraftProjected
}
```

**InstallmentPlanGetDto** (nested response)
```ts
{
  uid: string;
  userHouseholdUid: string;
  financialAccountUid: string;
  categoryUid: string;
  purchaseDate: string;
  totalAmount: number;
  installmentCount: number;
  firstDueDate: string;
  merchantName?: string;
  description?: string;
  schedules: InstallmentScheduleGetDto[];
}
```

**InstallmentScheduleGetDto**
```ts
{
  uid: string;
  installmentPlanUid: string;
  installmentNo: number;         // 1..N sıra
  dueDate: string;
  amount: number;                // totalAmount / installmentCount (yaklaşık)
  entryState: number;            // 1=Actual, 2=DraftProjected
  statusType: number;            // 1=DraftProjected, 2=Actual, 3=Cancelled
  actualTransactionUid?: string; // fiili işleme bağlandıysa dolu
}
```

> **UI önerisi**: Taksit takvimi/tablo görünümünde her satır `dueDate` bazında gruplanabilir
> (aylık nakit akışı planlaması için). `statusType = Cancelled` olan satırlar UI'da
> soluk/gri gösterilmeli.

## 8. Emanet / Üçüncü Şahıs Harcamaları (Proxy) — `/api/proxytransactions`

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/get-all` | Tüm proxy dosyaları |
| GET | `/get-by-id/{uid}` | |
| GET | `/get-settlements/{proxyCaseUid}` | Bir dosyaya ait tahsilat hareketleri |
| POST | `/start` | Yeni emanet harcaması başlatır |
| POST | `/close` | Kısmi/tam tahsilat kaydeder |
| DELETE | `/delete/{uid}` | |

**StartProxyTransactionRequestDto**
```ts
{
  userHouseholdUid: string;
  financialAccountUid: string;   // harcamanın yapıldığı kart/hesap
  externalPartyName: string;     // örn. "Zeynep"
  spentDate: string;
  totalAdvancedAmount: number;   // avans tutarı
  description?: string;
}
```

**CloseProxyTransactionRequestDto** (kısmi veya tam tahsilat)
```ts
{
  proxyCaseUid: string;
  settlementDate: string;
  amount: number;                          // bu tahsilatın tutarı (kısmi olabilir)
  paymentChannel: number;                  // 1=Cash, 2=BankTransfer, 3=CreditCard, 4=MealCard
  entryState?: number;                     // default 1 = Actual
  receivedFinancialAccountUid?: string;    // tahsilatın yattığı hesap
  note?: string;
}
```

**ProxyCaseGetDto**
```ts
{
  uid: string;
  userHouseholdUid: string;
  financialAccountUid: string;
  externalPartyName: string;
  spentDate: string;
  totalAdvancedAmount: number;
  status: number;         // 1=Open, 2=PartiallySettled, 3=Settled, 4=WrittenOff
  closedDate?: string;
  description?: string;
}
```

**ProxySettlementGetDto**
```ts
{
  uid: string;
  proxyCaseUid: string;
  settlementDate: string;
  amount: number;
  paymentChannel: number;
  entryState: number;
  receivedFinancialAccountUid?: string;
  settlementTransactionUid?: string;
  note?: string;
}
```

> **İş kuralı (UI'da vurgulanmalı)**: Proxy harcamaları hanenin net bütçesini etkilemez
> (`isBudgetNeutral = true` ile ilişkili `LedgerTransaction` kaydı otomatik oluşur). Frontend'de
> "Bütçe Özeti" / dashboard ekranlarında bu tür harcamalar **ayrı bir "Alacaklar" bölümünde**
> gösterilmeli, gelir-gider grafiklerine dahil edilmemelidir. `status` alanına göre:
> - `Open` → tamamen açık, kırmızı/uyarı rengi
> - `PartiallySettled` → sarı, kalan tutar gösterilmeli (`totalAdvancedAmount - Σsettlements.amount`)
> - `Settled` → yeşil, kapalı
> - `WrittenOff` → gri, terkin edilmiş

## 9. Enum Referans Tablosu (Frontend sabitleri için)

```ts
export enum EntryState { Actual = 1, DraftProjected = 2 }
export enum LedgerDirection { Inflow = 1, Outflow = 2 }
export enum PaymentChannel { Cash = 1, BankTransfer = 2, CreditCard = 3, MealCard = 4 }
export enum FinancialAccountType { CreditCard = 1, BankAccount = 2, MealOrTicketCard = 3 }
export enum TransactionType { Income = 1, Expense = 2, Transfer = 3 }
export enum StatusType { DraftProjected = 1, Actual = 2, Cancelled = 3 }
export enum SettlementStatus { Open = 1, PartiallySettled = 2, Settled = 3, WrittenOff = 4 }
export enum ExpenseKind { Normal = 1, ProxyAdvance = 2 }
```

## 10. Genel Kurallar / Frontend'in Bilmesi Gerekenler

1. **Uid tabanlı kimlik**: Kategori, İşlem, Taksit, Proxy, Household ve FinancialAccount
   modüllerinin tamamında ID referansları şifrelenmiş `string` (`Uid` son eki ile) taşınır.
   Ham `int` ID hiçbir endpoint'te frontend'e açılmaz.
2. **Actual vs Draft/Projected**: Geçmiş tarihli kayıtlar her zaman `Actual`, gelecek tarihli
   kayıtlar `DraftProjected` olabilir. Formlarda tarih seçimine göre bu alanın otomatik
   önerilmesi (readonly/disabled yapılması) kullanıcı hatasını azaltır.
3. **Bütçe nötr harcamalar**: `isBudgetNeutral: true` olan `LedgerTransaction` kayıtları (proxy
   harcamalar) toplam gelir-gider hesaplarına dahil edilmemelidir.
4. **Response zarfı**: Her API çağrısı `ServiceResponse` şablonunu kullanır; frontend'de ortak
   bir `ApiResponse<T>` tipi ve axios/fetch interceptor'ı ile `isSuccess === false` durumunda
   hata mesajlarının (`errors[]`) tek noktadan gösterilmesi önerilir.
5. **Auth header**: Access token süresi dolduğunda 401 alındığında otomatik `refresh-token`
   çağrısı yapıp orijinal isteği tekrarlayan bir axios interceptor kurulmalı.
