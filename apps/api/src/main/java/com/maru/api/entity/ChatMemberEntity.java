package com.maru.api.entity;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("chat_members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatMemberEntity {

    @Column("chat_room_id")
    private UUID chatRoomId;

    @Column("profile_id")
    private UUID profileId;

    private String name;

    @Column("icon_url")
    private String iconUrl;

    @Column("last_read_message_id")
    private UUID lastReadMessageId;

    @Builder.Default
    @Column("notification_enabled")
    private Boolean notificationEnabled = true;

    @Column("joined_at")
    private Instant joinedAt;
}
