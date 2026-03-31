import apiClient from "./client";
import type { ApiResult, UserResponse, CheckTagResponse } from "./types";

type RegisterErrorCode =
  | "USER_ALREADY_EXISTS"
  | "NAME_REQUIRED"
  | "NAME_TOO_LONG"
  | "USER_TAG_REQUIRED"
  | "USER_TAG_TOO_SHORT"
  | "USER_TAG_TOO_LONG"
  | "USER_TAG_INVALID_FORMAT"
  | "USER_TAG_ALREADY_EXISTS";

export type RegisterResult = ApiResult<UserResponse, RegisterErrorCode>;

export const usersApi = {
  register: (params: { name: string; userTag: string; profileImage?: { uri: string; mimeType: string } }) => {
    const formData = new FormData();
    formData.append("name", params.name);
    formData.append("userTag", params.userTag);
    if (params.profileImage) {
      const ext = params.profileImage.mimeType.split("/")[1] ?? "jpg";
      formData.append("profileImage", {
        uri: params.profileImage.uri,
        type: params.profileImage.mimeType,
        name: `profile.${ext}`,
      } as unknown as Blob);
    }
    return apiClient.post<RegisterResult>("/api/v1/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getMe: () =>
    apiClient.get<ApiResult<UserResponse>>("/api/v1/users/me"),

  checkTag: (params: { tag: string }) =>
    apiClient.get<ApiResult<CheckTagResponse>>("/api/v1/users/check-tag", { params }),
};
