// accessToken sadece bellekte tutulur (sayfa yenilenince kaybolur, XSS ile çalınamaz).
let accessToken: string | null = null;

// refreshToken localStorage'da saklanır: bu, sayfa yenilendiğinde oturumu ayakta tutar
// ama localStorage bir XSS açığına karşı korumasızdır. Backend httpOnly cookie desteklediğinde
// bu saklama stratejisi cookie tabanlısına taşınmalıdır.
const REFRESH_TOKEN_STORAGE_KEY = "fintrack.refreshToken";

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setTokens(newAccessToken: string, newRefreshToken: string): void {
  accessToken = newAccessToken;
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
}

export function clearTokens(): void {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
