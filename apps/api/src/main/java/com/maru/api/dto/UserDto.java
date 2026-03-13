package com.maru.api.dto;

import com.maru.api.entity.UserEntity;

import java.time.Instant;

public record UserDto(
        String userId,
        String email,
        String name,
        String lastActiveProfileId,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserDto from(UserEntity entity) {
        return new UserDto(
                entity.getUserId(),
                entity.getEmail(),
                entity.getName(),
                entity.getLastActiveProfileId(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
