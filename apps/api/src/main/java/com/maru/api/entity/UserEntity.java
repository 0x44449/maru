package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @Column("user_id")
    private UUID userId;

    private String email;

    private String name;

    @Column("user_tag")
    private String userTag;

    @Builder.Default
    @Column("user_tag_changed")
    private Boolean userTagChanged = false;

    @Column("last_active_profile_id")
    private UUID lastActiveProfileId;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

}
