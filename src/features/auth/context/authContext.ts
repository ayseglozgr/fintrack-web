import { createContext } from "react";
import type { AuthUser, LoginRequestDto, RegisterRequestDto } from "../types";

export interface AuthContextValue {
  user: AuthUser | null;
  isInitializing: boolean;
  login: (payload: LoginRequestDto) => Promise<void>;
  register: (payload: RegisterRequestDto) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
