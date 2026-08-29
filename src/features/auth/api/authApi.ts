import { apiClient } from "../../../shared/lib/apiClient";
import type { ServiceResponse } from "../../../shared/types/api";
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from "../types";

export const authApi = {
  login: (payload: LoginRequestDto) =>
    apiClient
      .post<ServiceResponse<LoginResponseDto>>("/auth/login", payload)
      .then((res) => res.data),

  register: (payload: RegisterRequestDto) =>
    apiClient
      .post<ServiceResponse<LoginResponseDto>>("/auth/register", payload)
      .then((res) => res.data),

  refreshToken: (payload: RefreshTokenRequestDto) =>
    apiClient
      .post<ServiceResponse<LoginResponseDto>>("/auth/refresh-token", payload)
      .then((res) => res.data),
};
