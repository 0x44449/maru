/** 서버 공통 응답 래퍼 */
export interface ApiResult<T, E extends string = string> {
  success: boolean;
  data: T | null;
  errorCode: E | null;
  message: string | null;
}

/** 서버 에러 응답 타입 (401, 500 등 시스템 에러용) */
export interface ApiError {
  errorCode: string;
  message: string;
}

/** 사용자 정보 응답 타입 (서버 UserDto 대응) */
export interface UserResponse {
  userId: string;
  userTag: string;
  email: string;
  name: string;
  personalProfile: {
    profileId: string;
    displayName: string;
    profileImageUrl: string;
  } | null;
  createdAt: string;
}

/** 태그 중복 검사 응답 */
export interface CheckTagResponse {
  userTag: string;
  status: "AVAILABLE" | "ALREADY_TAKEN" | "INVALID_FORMAT";
}
