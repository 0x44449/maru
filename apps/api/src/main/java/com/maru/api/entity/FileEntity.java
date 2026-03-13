package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FileEntity {

    @Id
    @Column("file_id")
    private String fileId;

    @Column("uploader_id")
    private String uploaderId;

    @Column("original_name")
    private String originalName;

    @Column("stored_path")
    private String storedPath;

    @Column("content_type")
    private String contentType;

    private Long size;

    @Column("created_at")
    private Instant createdAt;
}
