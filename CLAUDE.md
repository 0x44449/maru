# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

마루(Maru)는 멀티 프로필 기반 경량 그룹웨어다. 개인 메신저와 조직 업무 도구를 하나의 앱에서 프로필 전환으로 사용한다.

## Tech Stack

- **Backend**: Spring Boot 4.0.3, Java 25
- **DB**: PostgreSQL (port 35432), Spring Data JDBC, Flyway 마이그레이션
- **인증**: Supabase OAuth2 Resource Server (JWT)
- **파일**: MinIO (Object Storage)
- **API 문서**: springdoc-openapi (Swagger UI)
- **빌드**: Gradle (Kotlin DSL), Lombok

## Architecture

```
maru/
├── apps/
│   └── api/                          # Spring Boot API 서버 (port 8080)
│       └── src/main/java/com/maru/api/
│           ├── config/
│           │   ├── auth/             # JWT 인증, SecurityConfig, @AllowPublic, @Authenticated
│           │   ├── exception/        # GlobalExceptionHandler, WellKnownException
│           │   ├── MinioConfig.java
│           │   ├── SwaggerConfig.java
│           │   └── WebConfig.java
│           ├── domain/               # 도메인별 Controller → Service → Repository
│           │   ├── user/
│           │   ├── profile/
│           │   ├── workspace/
│           │   └── chat/
│           ├── dto/                  # 공유 응답 DTO
│           └── entity/              # Spring Data JDBC 엔티티
├── docs/                              # 프로젝트 문서
│   ├── design-system/                # 디자인 시스템 규격 및 프리뷰
│   │   ├── DESIGN_SYSTEM.md
│   │   ├── tokens.json
│   │   ├── preview.html, color-pick.html, wireframe.html
│   │   └── modules/                  # 모듈별 규격(.md) + 프리뷰(.html)
│   │       # auth, home, messenger, chat-list, chat-drawer,
│   │       # contacts, approval, more
│   └── specs/
│       └── SYSTEM_SPEC.md            # 서버 구현 기준 문서
├── infra/
│   └── docker/
│       └── docker-compose.yml        # PostgreSQL, MinIO 등 로컬 인프라
└── CLAUDE.md
```

## Core Concepts

- **User**: 인증된 계정. 소셜 로그인 전용 (카카오/Google/Apple), Supabase 위임
- **Profile**: 개인 프로필 1개(자동) + 조직 프로필 N개(워크스페이스당 1개). 프로필 간 데이터 완전 격리
- **Workspace**: 조직 단위. 플러그인으로 기능 조합 (결재, 근무관리, 공지톡, 일정, 외부소통)
- **Messaging**: WebSocket 실시간, 프로필별 독립 채팅, 채널 채팅(외부 소통) 지원

상세 시스템 규격은 `docs/specs/SYSTEM_SPEC.md` 참조.

## Code Conventions

- 도메인별 패키지 구조: `domain/{name}/` 하위에 Controller, Service, Repository, dto/ 배치
- 공유 DTO는 `dto/` 패키지에 Java record로 작성, 도메인 전용 요청 DTO는 `domain/{name}/dto/`
- 엔티티는 `entity/` 패키지에 집중 배치 (Spring Data JDBC)
- 인증 필요 엔드포인트는 `@Authenticated` + `RequestPayload` 파라미터로 JWT 정보 주입
- 공개 엔드포인트는 `@AllowPublic` 어노테이션 사용
- 예외 처리는 `WellKnownException` → `GlobalExceptionHandler` → `ErrorResponse` 구조

## 현재 진행 상황

- **엔티티**: 전체 구현 완료 (User, Profile, WorkspaceProfile, Workspace, WorkspacePlugin, Department, DepartmentMember, Contact, ChatRoom, ChatMember, ChatMessage, Channel, ChannelManager, File)
- **공유 DTO**: User, Profile, Workspace, Department 구현 완료, 나머지는 빈 스텁 (기능 구현 시 채울 예정)
- **미구현**: Flyway 마이그레이션, Service, Repository, Controller 로직

## Build & Run

```bash
cd apps/api
./gradlew bootRun          # 서버 실행
./gradlew build             # 빌드
./gradlew test              # 테스트
```

## 작업 컨벤션

- 한국어로 커뮤니케이션
- 카카오톡을 주요 디자인 레퍼런스로 참고
- 화면/기능 단위 애자일 방식 개발 — DTO/API를 미리 전부 정의하지 않고, 기능 구현 시 필요한 것을 함께 만듦
