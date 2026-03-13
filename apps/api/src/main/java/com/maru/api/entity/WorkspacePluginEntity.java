package com.maru.api.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("workspace_plugins")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WorkspacePluginEntity {

    @Id
    @Column("workspace_plugin_id")
    private String workspacePluginId;

    @Column("workspace_id")
    private String workspaceId;

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
