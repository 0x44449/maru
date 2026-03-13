package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("workspace_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WorkspaceProfileEntity {

    @Id
    @Column("profile_id")
    private String profileId;

    @Column("workspace_id")
    private String workspaceId;

    private String position;

    private MemberRole role;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    public enum MemberRole {
        ADMIN, MEMBER
    }
}
