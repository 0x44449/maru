-- ============================================
-- V1: 초기 스키마 (UUID 기반)
-- ============================================

-- --------------------------------------------
-- users
-- --------------------------------------------
CREATE TABLE users (
    user_id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_tag           VARCHAR(12)  NOT NULL UNIQUE,
    user_tag_changed   BOOLEAN      NOT NULL DEFAULT false,
    email              VARCHAR(255) NOT NULL,
    name               VARCHAR(255) NOT NULL,
    last_active_profile_id UUID,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- --------------------------------------------
-- profiles
-- --------------------------------------------
CREATE TABLE profiles (
    profile_id        UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id           UUID,
    type              VARCHAR(50)  NOT NULL,
    display_name      VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(1024),
    status_message    VARCHAR(500),
    enabled           BOOLEAN      NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_profiles PRIMARY KEY (profile_id)
);

-- 개인 프로필은 user당 1개
CREATE UNIQUE INDEX uq_profiles_personal
    ON profiles (user_id) WHERE type = 'PERSONAL';

-- --------------------------------------------
-- workspaces
-- --------------------------------------------
CREATE TABLE workspaces (
    workspace_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    logo_url     VARCHAR(1024),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_workspaces PRIMARY KEY (workspace_id)
);

-- --------------------------------------------
-- workspace_profiles
-- --------------------------------------------
CREATE TABLE workspace_profiles (
    profile_id   UUID         NOT NULL,
    workspace_id UUID         NOT NULL,
    position     VARCHAR(255),
    role         VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_workspace_profiles PRIMARY KEY (profile_id)
);

-- --------------------------------------------
-- workspace_plugins
-- --------------------------------------------
CREATE TABLE workspace_plugins (
    workspace_plugin_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    workspace_id        UUID         NOT NULL,
    plugin_type         VARCHAR(50)  NOT NULL,
    enabled             BOOLEAN      NOT NULL DEFAULT false,
    config              TEXT,
    enabled_at          TIMESTAMPTZ,

    CONSTRAINT pk_workspace_plugins PRIMARY KEY (workspace_plugin_id),
    CONSTRAINT uq_workspace_plugins UNIQUE (workspace_id, plugin_type)
);

-- --------------------------------------------
-- departments
-- --------------------------------------------
CREATE TABLE departments (
    department_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    workspace_id  UUID         NOT NULL,
    name          VARCHAR(255) NOT NULL,
    sort_order    INTEGER      NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_departments PRIMARY KEY (department_id),
    CONSTRAINT uq_departments_name UNIQUE (workspace_id, name)
);

-- --------------------------------------------
-- department_members
-- --------------------------------------------
CREATE TABLE department_members (
    department_id UUID NOT NULL,
    profile_id    UUID NOT NULL,

    CONSTRAINT pk_department_members PRIMARY KEY (department_id, profile_id)
);

-- --------------------------------------------
-- contacts
-- --------------------------------------------
CREATE TABLE contacts (
    owner_profile_id   UUID NOT NULL,
    contact_profile_id UUID NOT NULL,
    nickname           VARCHAR(255),
    memo               TEXT,
    favorite           BOOLEAN      NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_contacts PRIMARY KEY (owner_profile_id, contact_profile_id)
);

-- --------------------------------------------
-- chat_rooms
-- --------------------------------------------
CREATE TABLE chat_rooms (
    chat_room_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    type         VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_chat_rooms PRIMARY KEY (chat_room_id)
);

-- --------------------------------------------
-- chat_members
-- --------------------------------------------
CREATE TABLE chat_members (
    chat_room_id          UUID         NOT NULL,
    profile_id            UUID         NOT NULL,
    name                  VARCHAR(255),
    icon_url              VARCHAR(1024),
    last_read_message_id  UUID,
    notification_enabled  BOOLEAN      NOT NULL DEFAULT true,
    joined_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_chat_members PRIMARY KEY (chat_room_id, profile_id)
);

-- --------------------------------------------
-- chat_messages
-- --------------------------------------------
CREATE TABLE chat_messages (
    chat_message_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    chat_room_id    UUID         NOT NULL,
    seq             INTEGER      NOT NULL,
    sender_id       UUID         NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    content         TEXT,
    metadata        TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_chat_messages PRIMARY KEY (chat_message_id)
);

CREATE INDEX idx_chat_messages_room_created
    ON chat_messages (chat_room_id, created_at);

-- --------------------------------------------
-- channels
-- --------------------------------------------
CREATE TABLE channels (
    channel_id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    workspace_id          UUID         NOT NULL,
    profile_id            UUID         NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    icon_url              VARCHAR(1024),
    description           TEXT,
    operating_hours_start TIME,
    operating_hours_end   TIME,
    operating_days        VARCHAR(255),
    visibility            VARCHAR(50)  NOT NULL,
    auto_reply_message    TEXT,
    enabled               BOOLEAN      NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_channels PRIMARY KEY (channel_id)
);

-- --------------------------------------------
-- channel_managers
-- --------------------------------------------
CREATE TABLE channel_managers (
    channel_id UUID         NOT NULL,
    profile_id UUID         NOT NULL,
    role       VARCHAR(50)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_channel_managers PRIMARY KEY (channel_id, profile_id)
);

-- --------------------------------------------
-- files
-- --------------------------------------------
CREATE TABLE files (
    file_id       UUID          NOT NULL DEFAULT gen_random_uuid(),
    uploader_id   UUID          NOT NULL,
    original_name VARCHAR(1024) NOT NULL,
    stored_path   VARCHAR(1024) NOT NULL,
    content_type  VARCHAR(255)  NOT NULL,
    size          BIGINT        NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ,

    CONSTRAINT pk_files PRIMARY KEY (file_id)
);
