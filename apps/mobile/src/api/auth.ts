import apiClient from "./client";
import type { ApiResult, UserResponse } from "./types";

type LoginErrorCode = "USER_NOT_REGISTERED";

export type LoginResult = ApiResult<UserResponse, LoginErrorCode>;

export const authApi = {
  login: (params: { fcmToken: string | null }) =>
    apiClient.post<LoginResult>("/api/v1/auth/login", params),
};
