package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProfileEntity {

    @Id
    @Column("profile_id")
    private String profileId;

    @Column("user_id")
    private String userId;

    private ProfileType type;

    @Column("display_name")
    private String displayName;

    @Column("profile_image_url")
    private String profileImageUrl;

    @Column("status_message")
    private String statusMessage;

    @Builder.Default
    private Boolean enabled = true;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    public enum ProfileType {
        PERSONAL, WORKSPACE, CHANNEL
    }
}
