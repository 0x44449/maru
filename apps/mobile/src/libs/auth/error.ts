import {
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

/** auth 계층에서 반환하는 정규화된 에러 코드 */
export type AuthErrorCode = "AUTH_CANCELLED" | "AUTH_FAILED";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export function isCancelError(e: unknown): boolean {
  // Google SDK 취소
  if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
    return true;
  }
  // Kakao SDK 취소 — 네이티브 모듈(RNKakaoLogins)이 에러 코드를 JS로 전달하지 않고
  // error.localizedDescription(iOS) / error.message(Android)만 reject하므로
  // 문자열 패턴에 의존할 수밖에 없음. SDK 업데이트 시 확인 필요.
  if (e instanceof Error && e.message.includes("statusCode=-1")) {
    return true;
  }
  return false;
}
