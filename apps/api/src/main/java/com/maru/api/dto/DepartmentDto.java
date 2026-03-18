package com.maru.api.dto;

import com.maru.api.entity.DepartmentEntity;

import java.time.Instant;
import java.util.UUID;

public record DepartmentDto(
        UUID departmentId,
        UUID workspaceId,
        String name,
        Integer sortOrder,
        Instant createdAt
) {
    public static DepartmentDto from(DepartmentEntity entity) {
        return new DepartmentDto(
                entity.getDepartmentId(),
                entity.getWorkspaceId(),
                entity.getName(),
                entity.getSortOrder(),
                entity.getCreatedAt()
        );
    }
}
