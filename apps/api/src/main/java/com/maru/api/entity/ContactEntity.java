package com.maru.api.entity;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("contacts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContactEntity {

    @Column("owner_profile_id")
    private UUID ownerProfileId;

    @Column("contact_profile_id")
    private UUID contactProfileId;

    private String nickname;

    private String memo;

    @Builder.Default
    private Boolean favorite = false;

    @Column("created_at")
    private Instant createdAt;
}
