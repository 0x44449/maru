package com.maru.api.entity;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("contacts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContactEntity {

    @Column("owner_profile_id")
    private String ownerProfileId;

    @Column("contact_profile_id")
    private String contactProfileId;

    private String nickname;

    private String memo;

    @Builder.Default
    private Boolean favorite = false;

    @Column("created_at")
    private Instant createdAt;
}
