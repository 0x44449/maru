package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @Column("user_id")
    private String userId;

    @Column("auth_provider")
    private AuthProvider authProvider;

    @Column("auth_provider_id")
    private String authProviderId;

    private String email;

    private String name;

    @Column("last_active_profile_id")
    private String lastActiveProfileId;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    public enum AuthProvider {
        KAKAO, GOOGLE, APPLE
    }
}
