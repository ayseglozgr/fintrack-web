import { useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { clearTokens, getRefreshToken, setTokens } from "../../../shared/lib/tokenStorage";
import type { AuthUser, LoginRequestDto, RegisterRequestDto } from "../types";
import { AuthContext, type AuthContextValue } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // accessToken sayfa yenilemede kaybolduğundan, kalıcı refreshToken ile sessiz oturum açılır.
    const refreshToken = getRefreshToken();
    const finishInitializing = () => setIsInitializing(false);

    if (!refreshToken) {
      Promise.resolve().then(finishInitializing);
      return;
    }

    authApi
      .refreshToken({ refreshToken })
      .then((response) => {
        if (response.isSuccess && response.data) {
          setTokens(response.data.accessToken, response.data.refreshToken);
          setUser({
            userId: response.data.userId,
            accountName: response.data.accountName,
            email: response.data.email,
          });
        } else {
          clearTokens();
        }
      })
      .catch(() => clearTokens())
      .finally(finishInitializing);
  }, []);

  const login = async (payload: LoginRequestDto) => {
    const response = await authApi.login(payload);
    if (!response.isSuccess || !response.data) {
      throw new Error(response.errors[0] ?? response.message ?? "Giriş başarısız");
    }
    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser({
      userId: response.data.userId,
      accountName: response.data.accountName,
      email: response.data.email,
    });
  };

  const register = async (payload: RegisterRequestDto) => {
    const response = await authApi.register(payload);
    if (!response.isSuccess) {
      throw new Error(response.errors[0] ?? response.message ?? "Kayıt başarısız");
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isInitializing, login, register, logout }),
    [user, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
