# FinTrack.Web — Proje Durumu ve Yol Haritası

> Bu dosya, projenin o anki geliştirme durumunu takip etmek için tutulur. Yeni bir feature
> tamamlandığında veya bir teknoloji kararı değiştiğinde bu dosya güncellenmelidir.
> Referans: `.github/copilot-instructions.md` (mimari/iş kuralları) ve
> `docs/FinTrack-API-Specification.md` (API sözleşmesi).

_Son güncelleme: 2026-08-29_

## Durum Tablosu

`.github/copilot-instructions.md` → **[GÖREV SIRASI ÖNERİSİ]** sırasına göre:

| # | Adım | Durum | Not |
|---|---|---|---|
| 1 | Proje iskeleti + routing + auth (login/register/refresh) | 🟡 Kısmen tamam | `app/`, `routes/`, `features/auth/` kuruldu (context, apiClient, login/register sayfaları). Gerçek API'ye karşı uçtan uca login doğrulaması sürüyor |
| 2 | Household seçimi / aktif hane context'i | ⬜ Başlanmadı | |
| 3 | FinancialAccount CRUD | ⬜ Başlanmadı | |
| 4 | Category CRUD (ağaç yapılı seçici) | ⬜ Başlanmadı | |
| 5 | LedgerTransaction CRUD + filtreleme | ⬜ Başlanmadı | |
| 6 | Installment planlama + takvim görünümü | ⬜ Başlanmadı | |
| 7 | ProxyTransaction (emanet) akışı | ⬜ Başlanmadı | |
| 8 | Dashboard | ⬜ Başlanmadı | |

## Teknoloji Kararları

Kurulu / kullanılan:
- React 19 + TypeScript (strict), Vite
- React Router v7 (`src/routes/`)
- axios (`src/shared/lib/apiClient.ts` — request/response interceptor, 401 → refresh-token akışı)

Henüz kurulmadı (`copilot-instructions.md` önerisi, opsiyonel):
- ❌ TanStack Query (React Query) — şu an server state için `async/await` + `useState`
- ❌ React Hook Form + Zod — login/register formları düz `useState` ile
- ❌ Tailwind CSS — düz CSS (`src/app/App.css`)

> Öneri: Category ağacı, Installment takvimi gibi karmaşıklaşacak ekranlardan önce
> TanStack Query + React Hook Form + Zod kurulumu yapılmalı.

## Mimari Notlar

- Klasör yapısı: `src/app` (shell/routing/layout), `src/shared` (ortak lib/types/components),
  `src/features/<feature>` (api/components/context/pages/types).
- Auth token stratejisi: `accessToken` sadece bellekte (`shared/lib/tokenStorage.ts`), `refreshToken`
  `localStorage`'da (XSS riski `tokenStorage.ts` içinde not düşülmüştür; backend httpOnly cookie
  desteklerse taşınmalı).
- `ServiceResponse<T>` zarfı: `src/shared/types/api.ts`.
- Git branch stratejisi: `master` (korumalı, PR zorunlu, canlı) / `test` (aktif geliştirme).
  `.env` gerçek API adresini içerir, git'e gitmez (`.gitignore`); `.env.example` şablon olarak takip edilir.

## Sıradaki Adım

1. Login/register/refresh akışını gerçek API'ye karşı uçtan uca doğrula.
2. TanStack Query + React Hook Form + Zod kurulumu.
3. Household feature'ı (aktif hane context'i, sonraki tüm modüller buna bağlı).
