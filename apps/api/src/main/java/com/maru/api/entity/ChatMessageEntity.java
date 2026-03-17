package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatMessageEntity {

    @Id
    @Column("chat_message_id")
    private String chatMessageId;

    @Column("chat_room_id")
    private String chatRoomId;

    private Integer seq;

    @Column("sender_id")
    private String senderId;

    private MessageType type;

    private String content;

    private String metadata;

    @Column("created_at")
    private Instant createdAt;

    public enum MessageType {
        TEXT, IMAGE, FILE, SYSTEM, INTERNAL_NOTE
    }
}
