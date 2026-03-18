package com.maru.api.dto;

import com.maru.api.entity.WorkspaceEntity;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceDto(
        UUID workspaceId,
        String name,
        String description,
        String logoUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static WorkspaceDto from(WorkspaceEntity entity) {
        return new WorkspaceDto(
                entity.getWorkspaceId(),
                entity.getName(),
                entity.getDescription(),
                entity.getLogoUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
