package com.maru.api.config.auth;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public record RequestPayloadDto(
        Jwt jwt,
        UUID profileId
) {
}
