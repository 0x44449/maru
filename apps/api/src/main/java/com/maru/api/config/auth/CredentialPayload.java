package com.maru.api.config.auth;

public record CredentialPayload(
        String userId,
        String email
) {
}
