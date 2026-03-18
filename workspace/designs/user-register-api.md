# 사용자 등록 API 설계 (v2)

## 목적

소셜 로그인 시 서버가 자동으로 사용자를 프로비저닝한다.
프로필 설정(사용자 태그, 이름, 아바타)은 선택적으로 나중에 할 수 있다.

## 변경 배경

v1에서는 로그인 후 등록 폼을 반드시 완료해야 앱에 진입할 수 있었다.
이 방식은 "인증됨 + 미등록"이라는 회색지대 상태를 만들고, 해당 상태에서 파일 업로드 등 여러 동작을 처리해야 하는 복잡성이 있었다.

v2에서는 로그인 즉시 자동 프로비저닝으로 앱에 진입하고, 프로필 설정은 선택적으로 할 수 있도록 변경한다.

---

## 1. 식별자 체계

```
user_id          = UUID 자동생성 (내부 PK, FK 참조, 시스템 동작 기준)
user_tag          = 프로비저닝 시 자동생성, 사용자 변경 1회 가능 (NOT NULL, UNIQUE, 검색/공유/표시용)
auth_provider    = 소셜 로그인 제공자 (KAKAO, GOOGLE, APPLE)
auth_provider_id = Supabase UUID (인증 연결용)
profile_id       = UUID 자동생성 (서비스 내 모든 프로필 기반 동작 기준)
```

### user_tag 규칙

- 최소 4자, 최대 12자
- 허용 문자: 영문 소문자, 숫자, 밑줄(`_`), 마침표(`.`)
- 첫 글자는 영문 소문자 또는 숫자 (밑줄, 마침표로 시작 불가)
- 정규식: `^[a-z0-9][a-z0-9_.]{3,11}$`
- 프로비저닝 시 자동 생성 (예: `user_a8k3x2`)
- **변경 정책**: 자동생성 ID → 사용자 지정 ID로 1회 변경 가능. 이후 고정.
  - `user_tag_changed` (BOOLEAN, default false) 컬럼으로 변경 여부 추적
  - 자동생성 ID는 `user_` 접두사로 구분

### 역할 비유

- `user_tag` = 도메인 (사람이 기억하는 주소, 검색/공유에 사용)
- `user_id` = IP (시스템이 사용하는 내부 주소, FK 참조)

---

## 2. 자동 프로비저닝

### 트리거

`POST /api/v1/users/provision` — 로그인 직후 클라이언트가 호출하는 전용 API.
사용자가 없으면 생성, 있으면 기존 정보 반환 (멱등).

`GET /api/v1/users/me`는 순수 조회 전용. 사용자 없으면 404.

### 프로비저닝 동작

1. JWT에서 `sub` (Supabase UUID) + `app_metadata.provider` 추출
2. `(auth_provider, auth_provider_id)` 복합 조회
3. 사용자 없으면 자동 생성:
   - `users` INSERT: user_id = UUID, user_tag = 자동생성 (`user_` + 랜덤 영숫자), name = 소셜 로그인 이름 또는 임의 생성
   - `profiles` INSERT: PERSONAL 프로필 자동 생성, profile_id = UUID, display_name = name, profile_image_url = 기본 아바타 URL
   - `users.last_active_profile_id` = 생성된 PERSONAL 프로필 ID
4. 사용자 있으면 기존 정보 반환

### 이름 결정 우선순위

1. Supabase JWT의 `user_metadata.full_name` 또는 `user_metadata.name`
2. 자동 생성: "형용사 + 명사 + 임의숫자" 조합 (예: "졸린 고양이 482", "용감한 두부 91")

**자동 생성 단어 풀 (예시)**:
- 형용사: 졸린, 용감한, 수줍은, 배고픈, 느긋한, 씩씩한, 호기심많은, 엉뚱한, 반짝이는, 조용한, 활발한, 귀여운, 당당한, 명랑한, 겁없는 ...
- 명사: 고양이, 두부, 판다, 수달, 토끼, 구름, 별사탕, 감자, 호랑이, 펭귄, 다람쥐, 햄스터, 고래, 너구리, 해파리 ...
- 숫자: 1~999 랜덤

서버에 단어 풀을 두고, 조합 시 중복 가능성은 있으나 표시 이름이므로 UNIQUE 제약 없음.

### 기본 아바타

서버에 미리 준비된 기본 아바타 이미지 중 랜덤 배정.
기본 아바타 이미지는 서버/CDN에 사전 배포.

---

## 3. 인증 흐름 변경

### 변경 전 (v1)

```
로그인 → getMe 404 → "unregistered" → 등록 폼 필수 → 앱 진입
```

### 변경 후 (v2)

```
로그인 → POST /provision → 신규면 생성, 기존이면 반환 → 즉시 앱 진입
       → 프로필 설정은 나중에 (선택)
```

### AuthStatus 변경

```
변경 전: "loading" | "unauthenticated" | "unregistered" | "error" | "authenticated"
변경 후: "loading" | "unauthenticated" | "error" | "authenticated"
```

`"unregistered"` 상태 제거. 로그인 성공하면 항상 `"authenticated"`.

---

## 4. X-Profile-Id 커스텀 헤더

### 개요

프로필 기반 동작(연락처, 채팅 등)에서 "어떤 프로필로 행동하는지"를 전달한다.

```
Authorization: Bearer <jwt>          ← 인증 (누구인지)
X-Profile-Id: <profile-uuid>        ← 컨텍스트 (어떤 프로필로)
```

### 서버 구현

`CredentialPayload` 확장:

```java
// 변경 전
public record CredentialPayload(String userId, String email)

// 변경 후
public record CredentialPayload(String userId, String email, String profileId)
```

`RequestPayloadResolver` 변경:
1. JWT `sub` + `app_metadata.provider` → `(auth_provider, auth_provider_id)` 복합 조회 → `userId`
2. `X-Profile-Id` 헤더 → `profileId`
3. 헤더가 있으면: 해당 profile이 이 user 소유인지 검증
4. 헤더가 없으면: `profileId = null`

### X-Profile-Id 검증 실패 에러

| 케이스 | errorCode | 상태 | 설명 |
|--------|-----------|------|------|
| 헤더 형식 잘못됨 (UUID 아님) | `INVALID_PROFILE_ID` | 400 | 유효하지 않은 프로필 ID 형식 |
| 존재하지 않는 profileId | `INVALID_PROFILE_ID` | 400 | 프로필을 찾을 수 없음 |
| 내 소유가 아닌 profileId | `PROFILE_ACCESS_DENIED` | 403 | 해당 프로필에 접근 권한 없음 |
| 프로필 필수 API에서 헤더 누락 | `PROFILE_REQUIRED` | 400 | 프로필 선택이 필요한 API |

프로필 필수 여부는 각 컨트롤러 메서드에서 `credential.profileId()` null 체크로 처리한다.

### 클라이언트 구현

```typescript
// 프로필 전환 시 인터셉터에 설정
apiClient.defaults.headers["X-Profile-Id"] = activeProfileId;
```

provision 응답에 personalProfile.profileId가 포함되므로, 로그인 직후 세팅 가능.

---

## 5. API 스펙

### 5-1. 자동 프로비저닝

```
POST /api/v1/users/provision
```

**인증**: Bearer JWT 필요, X-Profile-Id 불필요
**Request Body**: 없음

**동작**:
- 사용자 미존재 → 자동 생성 후 반환
- 사용자 존재 → 기존 정보 반환 (멱등)

**응답 200**:
```json
{
  "userId": "uuid-xxx",
  "userTag": "user_a8k3x2",
  "email": "dohyun.kim@gmail.com",
  "name": "김도현",
  "personalProfile": {
    "profileId": "uuid-yyy",
    "displayName": "김도현",
    "profileImageUrl": "https://cdn.../avatars/default_03.png"
  },
  "createdAt": "2026-03-18T..."
}
```

**에러 응답**:

| 상태 | errorCode | 조건 |
|------|-----------|------|
| 401 | UNAUTHORIZED | JWT 없음 또는 만료 |

### 5-2. 내 정보 조회

```
GET /api/v1/users/me
```

**인증**: Bearer JWT 필요, X-Profile-Id 불필요

**동작**: 순수 조회. 사용자 없으면 404.

**응답 200**: provision과 동일한 형식

**에러 응답**:

| 상태 | errorCode | 조건 |
|------|-----------|------|
| 401 | UNAUTHORIZED | JWT 없음 또는 만료 |
| 404 | USER_NOT_FOUND | 사용자 미존재 |

### 5-3. 프로필 설정 (사용자 태그, 이름, 아바타)

```
PATCH /api/v1/users/me
```

**인증**: Bearer JWT 필요, X-Profile-Id 필수

**Request Body** (변경할 필드만 전송):
```json
{
  "userTag": "dohyun.kim",
  "name": "김도현",
  "profileImage": "https://minio.../users/xxx/profile.png"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userTag | String | X | 사용자 태그. 4~12자, `^[a-z0-9_.]{4,12}$` |
| name | String | X | 표시 이름 |
| profileImage | String | X | 프로필 이미지 URL |

**서버 동작**:
1. `userTag` 있으면: 이미 변경됨 여부 확인 (`user_tag_changed = true`이면 `USER_TAG_ALREADY_SET` 에러) → 형식 검증 + 중복 체크 후 저장 + `user_tag_changed = true`
2. `name` 있으면: users.name + PERSONAL profile.display_name 동시 업데이트
3. `profileImage` 있으면: PERSONAL profile.profile_image_url 업데이트

**응답 200**: getMe와 동일한 형식

**에러 응답**:

| 상태 | errorCode | 조건 |
|------|-----------|------|
| 400 | INVALID_USER_TAG | 사용자 태그 형식 불일치 |
| 400 | USER_TAG_ALREADY_SET | 이미 사용자 태그를 변경한 사용자 (1회 제한) |
| 409 | USER_TAG_ALREADY_EXISTS | 사용자 태그 중복 |

### 5-4. 사용자 태그 중복 검사

```
GET /api/v1/users/check-tag?tag={userTag}
```

**인증**: Bearer JWT 필요, X-Profile-Id 불필요

**응답 200**:
```json
{
  "userTag": "dohyun.kim",
  "status": "AVAILABLE"
}
```

| status | 설명 |
|--------|------|
| `AVAILABLE` | 사용 가능 |
| `INVALID_FORMAT` | 형식 불일치 (4~12자, `^[a-z0-9][a-z0-9_.]{3,11}$`) |
| `ALREADY_TAKEN` | 이미 사용 중 |

### 5-5. 파일 업로드

```
POST /api/v1/files/upload
Content-Type: multipart/form-data
```

**인증**: Bearer JWT 필요, X-Profile-Id 필수 (uploader_id로 사용)

**Request**: multipart/form-data
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File | O | 업로드할 파일 |

**파일 제한**:
- 허용 타입: image/jpeg, image/png, image/webp
- 최대 크기: 5MB

**서버 동작**:
1. 파일 타입/크기 검증 (MIME + 매직 바이트 시그니처 검사)
2. MinIO에 원본 업로드 (경로: `avatars/users/{userId}/{fileId}.{ext}`)
3. 리사이즈 처리: 정사각형 크롭 + 최대 512x512 압축본 생성 → MinIO에 별도 저장 (`avatars/users/{userId}/{fileId}_thumb.{ext}`)
4. `files` 테이블에 메타데이터 기록 (uploader_id = profile_id 기준)
5. 공개 URL 반환 (리사이즈 버전)

**파일 저장 정책**:
- 원본과 리사이즈본 모두 저장
- 파일명은 `{fileId}.{ext}` (원본 파일명 미노출)
- DB에는 상대 경로 저장 (`avatars/users/{userId}/{fileId}.png`), 응답 시 MinIO endpoint 조합하여 전체 URL 반환
- 아바타 교체 시 이전 파일은 즉시 삭제하지 않음. `files` 테이블에 삭제 표시(`deleted_at`) 후, 7일 경과한 파일을 스케줄러가 MinIO에서 물리 삭제

**응답 200**:
```json
{
  "fileId": "uuid-xxx",
  "url": "http://localhost:9000/maru/avatars/users/uuid-xxx/file-uuid.png",
  "contentType": "image/png",
  "size": 102400
}
```

**에러 응답**:

| 상태 | errorCode | 조건 |
|------|-----------|------|
| 400 | INVALID_FILE_TYPE | 허용되지 않은 파일 타입 |
| 400 | FILE_TOO_LARGE | 파일 크기 초과 (5MB) |

---

## 6. MinIO 인프라 설정

### 6-1. Docker Compose

```yaml
# infra/docker/docker-compose.yml에 추가
minio:
  image: minio/minio
  container_name: maru-minio
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
  ports:
    - "${EXTERNAL_MINIO_API_PORT}:9000"     # API
    - "${EXTERNAL_MINIO_CONSOLE_PORT}:9001"  # 웹 콘솔
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
```

```env
# infra/docker/.env에 추가
MINIO_ROOT_USER=maru
MINIO_ROOT_PASSWORD=maru1234
EXTERNAL_MINIO_API_PORT=9000
EXTERNAL_MINIO_CONSOLE_PORT=9001
```

### 6-2. application.yml

```yaml
minio:
  endpoint: http://localhost:9000
  access-key: maru
  secret-key: maru1234
  bucket: maru
```

### 6-3. Gradle 의존성

```kotlin
implementation("io.minio:minio:8.5.17")
```

### 6-4. MinioConfig.java

```java
@Configuration
public class MinioConfig {
    @Bean
    public MinioClient minioClient(
        @Value("${minio.endpoint}") String endpoint,
        @Value("${minio.access-key}") String accessKey,
        @Value("${minio.secret-key}") String secretKey
    ) {
        return MinioClient.builder()
            .endpoint(endpoint)
            .credentials(accessKey, secretKey)
            .build();
    }
}
```

### 6-5. 버킷 및 기본 아바타 초기화

서버 시작 시 `ApplicationRunner`로 자동 처리:

1. `maru` 버킷 존재 확인 → 없으면 생성
2. 버킷 정책을 public 읽기로 설정 (아바타 URL 직접 접근 가능)
3. `avatars/default/` 경로에 기본 아바타 이미지 존재 확인 → 없으면 업로드
   - 기본 아바타 이미지는 `src/main/resources/static/avatars/`에 포함

```java
@Component
public class MinioInitializer implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        // 1. 버킷 생성 (없으면)
        // 2. public 읽기 정책 설정
        // 3. 기본 아바타 업로드 (없으면)
    }
}
```

### 6-6. 저장 경로 구조

```
maru (bucket)
├── avatars/
│   ├── default/                    ← 기본 아바타 (서버 시작 시 자동 업로드)
│   │   ├── default_01.png
│   │   ├── default_02.png
│   │   └── ...
│   └── users/{userId}/             ← 사용자 커스텀 아바타
│       └── {fileId}.png
└── files/{fileId}/                 ← 일반 파일 (채팅 등, 추후)
    └── {originalName}
```

### 6-7. 파일 접근 정책

| 경로 | 접근 권한 | 이유 |
|------|----------|------|
| `avatars/*` | public 읽기 | 아바타는 모든 사용자에게 노출 |
| `files/*` | private (추후) | 채팅 파일 등은 인증 필요 |

아바타는 URL만 있으면 누구나 접근 가능. 채팅 파일 등 비공개 리소스는 추후 presigned URL 또는 서버 프록시로 처리.

---

## 7. DB 스키마 베이스라인 리셋

### 전략

V1 마이그레이션(VARCHAR ID 기반)을 삭제하고, V1 자체를 UUID 기반 스키마로 교체한다.
Flyway `flyway_schema_history` 테이블도 리셋하여 깨끗한 상태에서 시작.

**이 절차는 개발 전용**. 프로덕션 데이터가 없는 초기 개발 단계에서만 적용 가능.

**적용 절차**:
1. `flyway_schema_history` 테이블 DROP
2. 기존 모든 테이블 DROP
3. `V1__init_schema.sql`을 UUID 기반으로 교체
4. 서버 재시작 → Flyway가 새 V1을 적용

```sql
-- V1__init_schema.sql (UUID 기반으로 교체)
-- users
CREATE TABLE users (
    user_id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_tag           VARCHAR(12)  NOT NULL UNIQUE,
    user_tag_changed   BOOLEAN      NOT NULL DEFAULT false,
    auth_provider     VARCHAR(50)  NOT NULL,
    auth_provider_id  VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    name              VARCHAR(255) NOT NULL,
    last_active_profile_id UUID,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_auth_provider UNIQUE (auth_provider, auth_provider_id)
);

-- profiles 재생성 (user_id FK 타입 변경)
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

CREATE UNIQUE INDEX uq_profiles_personal
    ON profiles (user_id) WHERE type = 'PERSONAL';

-- 나머지 테이블도 V1과 동일하게 재생성 (user_id/profile_id 타입만 UUID로 변경)
-- workspaces: 변경 없음 (user_id 참조 없음)
CREATE TABLE workspaces (
    workspace_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    logo_url     VARCHAR(1024),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_workspaces PRIMARY KEY (workspace_id)
);

CREATE TABLE workspace_profiles (
    profile_id   UUID         NOT NULL,
    workspace_id UUID         NOT NULL,
    position     VARCHAR(255),
    role         VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_workspace_profiles PRIMARY KEY (profile_id)
);

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

CREATE TABLE departments (
    department_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    workspace_id  UUID         NOT NULL,
    name          VARCHAR(255) NOT NULL,
    sort_order    INTEGER      NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_departments PRIMARY KEY (department_id),
    CONSTRAINT uq_departments_name UNIQUE (workspace_id, name)
);

CREATE TABLE department_members (
    department_id UUID NOT NULL,
    profile_id    UUID NOT NULL,

    CONSTRAINT pk_department_members PRIMARY KEY (department_id, profile_id)
);

CREATE TABLE contacts (
    owner_profile_id   UUID NOT NULL,
    contact_profile_id UUID NOT NULL,
    nickname           VARCHAR(255),
    memo               TEXT,
    favorite           BOOLEAN      NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_contacts PRIMARY KEY (owner_profile_id, contact_profile_id)
);

CREATE TABLE chat_rooms (
    chat_room_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    type         VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_chat_rooms PRIMARY KEY (chat_room_id)
);

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

CREATE TABLE channel_managers (
    channel_id UUID         NOT NULL,
    profile_id UUID         NOT NULL,
    role       VARCHAR(50)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_channel_managers PRIMARY KEY (channel_id, profile_id)
);

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
```

---

## 7. 변경 파일 목록

### Backend

| 파일 | 변경 | 설명 |
|------|------|------|
| `docker-compose.yml` | 수정 | MinIO 서비스 추가 |
| `.env` (docker) | 수정 | MinIO 환경변수 추가 |
| `build.gradle.kts` | 수정 | MinIO 클라이언트 의존성 추가 |
| `application.yml` | 수정 | MinIO 접속 설정 추가 |
| `MinioConfig.java` | 수정 | MinioClient 빈 등록 구현 |
| `MinioInitializer.java` | 신규 | 버킷 생성 + 기본 아바타 자동 업로드 |
| `static/avatars/*.png` | 신규 | 기본 아바타 이미지 파일 |
| `V1__init_schema.sql` | 교체 | UUID 기반 스키마로 베이스라인 교체 |
| `UserEntity.java` | 수정 | user_id → UUID, user_tag 추가 |
| `ProfileEntity.java` | 수정 | profile_id/user_id → UUID |
| 기타 엔티티 | 수정 | VARCHAR ID → UUID 타입 변경 |
| `CredentialPayload.java` | 수정 | profileId 필드 추가 |
| `RequestPayloadResolver.java` | 수정 | 복합 조회 + X-Profile-Id 파싱 + 소유권 검증 |
| `UserController.java` | 수정 | provision, getMe, updateMe, checkId |
| `UserService.java` | 수정 | 프로비저닝 로직, 조회 로직, 프로필 설정 로직 |
| `UserRepository.java` | 수정 | findByAuthProviderAndAuthProviderId |
| `ProfileRepository.java` | 신규 | insert, findByUserId |
| `UserDto.java` | 수정 | userTag, personalProfile 포함 |
| `UpdateUserDto.java` | 신규 | userTag, name, profileImage |
| `CheckUserTagResponseDto.java` | 신규 | 태그 중복 검사 응답 |
| `FileController.java` | 신규 | 파일 업로드 |
| `FileService.java` | 신규 | MinIO 업로드 + files 테이블 기록 |
| `FileRepository.java` | 신규 | insert |

### Mobile (후속 작업)

- `AuthStatus`에서 `"unregistered"` 제거
- `stores/auth.ts` → getMe 대신 provision 호출, 응답 구조 변경 반영
- `api/client.ts` → X-Profile-Id 인터셉터
- `user-register.tsx` → 프로필 설정 화면으로 변경 (스킵 가능)

---

## 8. 고려사항

1. **email**: JWT에서 추출. 클라이언트가 보내지 않음.
2. **auth_provider**: JWT `app_metadata.provider`에서 추출.
3. **트랜잭션**: 프로비저닝 시 User + PERSONAL 프로필 생성은 하나의 트랜잭션.
4. **멱등성**: provision은 멱등. 이미 사용자가 있으면 기존 정보 반환.
5. **기본 아바타**: 서버/CDN에 사전 배포된 이미지 URL 중 랜덤 배정.
6. **파일 업로드**: 프로비저닝 이후 사용. X-Profile-Id 필수이며 `uploader_id`로 기록. 프로비저닝 후에는 항상 PERSONAL 프로필이 존재하므로 클라이언트가 보내지 못할 상황 없음.
7. **스키마 베이스라인 리셋**: 초기 개발 단계에서 V1을 UUID 기반으로 교체. Flyway history + 기존 테이블 DROP 후 새 V1 적용. 개발 전용 절차이며 프로덕션에서는 사용 불가.
8. **`(auth_provider, auth_provider_id)` 복합 조회**: provider 간 ID 충돌 가능성 원천 차단.
