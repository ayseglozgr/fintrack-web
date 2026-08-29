export interface RegisterRequestDto {
  accountName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  accountNameOrEmail: string;
  password: string;
}

export interface LoginResponseDto {
  userId: number;
  accountName: string;
  email: string;
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface AuthUser {
  userId: number;
  accountName: string;
  email: string;
}
