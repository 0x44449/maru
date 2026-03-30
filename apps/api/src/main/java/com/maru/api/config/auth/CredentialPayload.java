package com.maru.api.config.auth;

import java.util.UUID;

/**
 * JWT + X-Profile-Id 헤더에서 추출한 인증 정보.
 *
 * @param email     사용자 이메일 (JWT email claim)
 * @param fullName  소셜 로그인 이름 (JWT user_metadata.full_name, nullable)
 * @param profileId X-Profile-Id 헤더 값 (nullable)
 */
public record CredentialPayload(
        String email,
        String fullName,
        UUID profileId
) {
}
