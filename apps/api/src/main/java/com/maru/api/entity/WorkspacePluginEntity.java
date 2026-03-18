package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("workspace_plugins")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WorkspacePluginEntity {

    @Id
    @Column("workspace_plugin_id")
    private UUID workspacePluginId;

    @Column("workspace_id")
    private UUID workspaceId;

    @Column("plugin_type")
    private PluginType pluginType;

    @Builder.Default
    private Boolean enabled = false;

    private String config;

    @Column("enabled_at")
    private Instant enabledAt;

    public enum PluginType {
        APPROVAL, ATTENDANCE, ANNOUNCEMENT, SCHEDULE, CHANNEL
    }
}
