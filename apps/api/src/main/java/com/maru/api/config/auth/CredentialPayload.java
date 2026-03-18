package com.maru.api.config.auth;

import java.util.UUID;

/**
 * JWT + X-Profile-Id 헤더에서 추출한 인증 정보.
 *
 * @param authProviderId Supabase UUID (JWT sub)
 * @param authProvider   소셜 로그인 제공자 (JWT app_metadata.provider)
 * @param email          사용자 이메일 (JWT email claim)
 * @param profileId      X-Profile-Id 헤더 값 (nullable)
 */
public record CredentialPayload(
        String authProviderId,
        String authProvider,
        String email,
        UUID profileId
) {
}
