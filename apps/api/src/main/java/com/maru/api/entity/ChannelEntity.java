package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Table("channels")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChannelEntity {

    @Id
    @Column("channel_id")
    private UUID channelId;

    @Column("workspace_id")
    private UUID workspaceId;

    @Column("profile_id")
    private UUID profileId;

    private String name;

    @Column("icon_url")
    private String iconUrl;

    private String description;

    @Column("operating_hours_start")
    private LocalTime operatingHoursStart;

    @Column("operating_hours_end")
    private LocalTime operatingHoursEnd;

    @Column("operating_days")
    private String operatingDays;

    private Visibility visibility;

    @Column("auto_reply_message")
    private String autoReplyMessage;

    @Builder.Default
    private Boolean enabled = true;

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    public enum Visibility {
        PUBLIC, PRIVATE
    }
}
