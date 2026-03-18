package com.maru.api.dto;

import com.maru.api.entity.ProfileEntity;

import java.time.Instant;
import java.util.UUID;

public record ProfileDto(
        UUID profileId,
        ProfileEntity.ProfileType type,
        String displayName,
        String profileImageUrl,
        String statusMessage,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProfileDto from(ProfileEntity entity) {
        return new ProfileDto(
                entity.getProfileId(),
                entity.getType(),
                entity.getDisplayName(),
                entity.getProfileImageUrl(),
                entity.getStatusMessage(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
