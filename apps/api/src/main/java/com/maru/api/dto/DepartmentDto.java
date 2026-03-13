package com.maru.api.dto;

import com.maru.api.entity.DepartmentEntity;

import java.time.Instant;

public record DepartmentDto(
        String departmentId,
        String workspaceId,
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
