package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FileEntity {

    @Id
    @Column("file_id")
    private UUID fileId;

    @Column("uploader_id")
    private UUID uploaderId;

    @Column("original_name")
    private String originalName;

    @Column("stored_path")
    private String storedPath;

    @Column("content_type")
    private String contentType;

    private Long size;

    @Column("created_at")
    private Instant createdAt;

    @Column("deleted_at")
    private Instant deletedAt;
}
