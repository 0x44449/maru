package com.maru.api.entity;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("channel_managers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChannelManagerEntity {

    @Column("channel_id")
    private UUID channelId;

    @Column("profile_id")
    private UUID profileId;

    private ManagerRole role;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    public enum ManagerRole {
        PRIMARY, SECONDARY
    }
}
