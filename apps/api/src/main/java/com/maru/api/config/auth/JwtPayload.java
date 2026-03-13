package com.maru.api.config.auth;

import java.time.Instant;
import java.util.Map;

public record JwtPayload(
        String sub,
        String email,
        String issuer,
        Instant issuedAt,
        Instant expiresAt,
        Map<String, Object> claims
) {
}
