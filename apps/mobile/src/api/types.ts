/** 서버 에러 응답 타입 (GlobalExceptionHandler의 ErrorResponse 대응) */
export interface ApiError {
  errorCode: string;
  message: string;
}

/** 사용자 정보 응답 타입 (GET /api/v1/users/me, 서버 UserDto 대응) */
export interface UserResponse {
  userId: string;
  email: string;
  name: string;
  lastActiveProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}
