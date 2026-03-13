package com.maru.api.entity;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("chat_members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatMemberEntity {

    @Column("chat_room_id")
    private String chatRoomId;

    @Column("profile_id")
    private String profileId;

    private String name;

    @Column("icon_url")
    private String iconUrl;

    @Column("last_read_message_id")
    private String lastReadMessageId;

    @Builder.Default
    @Column("notification_enabled")
    private Boolean notificationEnabled = true;

    @Column("joined_at")
    private Instant joinedAt;
}
