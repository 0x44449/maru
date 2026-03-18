package com.maru.api.dto;

import com.maru.api.entity.ProfileEntity;
import com.maru.api.entity.UserEntity;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID userId,
        String userTag,
        String email,
        String name,
        ProfileSummary personalProfile,
        Instant createdAt
) {
    public record ProfileSummary(
            UUID profileId,
            String displayName,
            String profileImageUrl
    ) {
        public static ProfileSummary from(ProfileEntity entity) {
            return new ProfileSummary(
                    entity.getProfileId(),
                    entity.getDisplayName(),
                    entity.getProfileImageUrl()
            );
        }
    }

    public static UserDto from(UserEntity user, ProfileEntity personalProfile) {
        return new UserDto(
                user.getUserId(),
                user.getUserTag(),
                user.getEmail(),
                user.getName(),
                personalProfile != null ? ProfileSummary.from(personalProfile) : null,
                user.getCreatedAt()
        );
    }
}
