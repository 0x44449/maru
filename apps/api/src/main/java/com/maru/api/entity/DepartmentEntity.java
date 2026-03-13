package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("departments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DepartmentEntity {

    @Id
    @Column("department_id")
    private String departmentId;

    @Column("workspace_id")
    private String workspaceId;

    private String name;

    @Column("sort_order")
    private Integer sortOrder;

    @Column("created_at")
    private Instant createdAt;
}
