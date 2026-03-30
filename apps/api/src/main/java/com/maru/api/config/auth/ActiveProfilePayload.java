package com.maru.api.config.auth;

import java.util.UUID;

public record ActiveProfilePayload(
        UUID profileId
) {
}
