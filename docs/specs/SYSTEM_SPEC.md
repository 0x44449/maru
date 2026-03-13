# 마루 (Maru) System Specification

> 모바일 기반 경량 그룹웨어 · 서버 구현 기준 문서
> Last updated: 2026-03-14

---

## 목차

1. [시스템 개요](#1-시스템-개요)
2. [인증](#2-인증)
3. [사용자 & 멀티 프로필](#3-사용자--멀티-프로필)
4. [워크스페이스](#4-워크스페이스)
5. [플러그인 시스템](#5-플러그인-시스템)
6. [메시징](#6-메시징)
7. [연락처](#7-연락처)
8. [외부 소통 채널](#8-외부-소통-채널)
9. [데이터 모델](#9-데이터-모델)
10. [API 설계](#10-api-설계)

---

## 1. 시스템 개요

### 1.1 컨셉

마루(Maru)는 **멀티 프로필 기반 경량 그룹웨어**다. 개인 메신저와 조직 업무 도구를 하나의 앱에서 프로필 전환으로 사용한다.

**핵심 구조:**
- 하나의 계정(User)이 여러 프로필을 가짐
- 개인 프로필 1개 (자동 생성) + 조직 프로필 N개 (워크스페이스당 1개)
- 프로필 간 데이터는 완전 격리 (채팅, 연락처, 알림 모두 별개)
- 워크스페이스 기능은 플러그인으로 조합

**레퍼런스:** 디스코드의 서버 전환 UX + 카카오톡의 채팅 UX + 슬랙의 워크스페이스 개념

### 1.2 프로필 종류

| 구분 | 개인 프로필 | 조직 프로필 |
|------|------------|------------|
| 생성 | 가입 시 자동 | 워크스페이스 참여 시 자동 |
| 탭 구성 | 홈 / 채팅 / 연락처 / 더보기 | 홈 / 채팅 / 연락처 / 워크스페이스 / 더보기 |
| 연락처 | 플랫 구조, 직접 추가 | 조직 트리 구조, 관리자 관리 |
| 홈 화면 | 내 프로필 + 워크스페이스 목록 | 근무/결재/공지 등 플러그인 위젯 |

---

## 2. 인증

### 2.1 소셜 로그인

이메일/비밀번호 방식 없이 소셜 로그인으로만 진입한다.
소셜 인증 자체는 Supabase 등 외부 서비스에 위임하고, 앱 서버는 인증 결과만 받아서 처리한다.

**지원 프로바이더:**
- 카카오
- Google
- Apple

### 2.2 인증 플로우

```
소셜 로그인 버튼 클릭
  → 외부 인증 서비스(Supabase)에서 OAuth 처리
  → 인증 완료 → 앱 서버에 사용자 조회
    ├─ 기존 사용자 → 앱 진입
    └─ 신규 사용자 → 사용자 등록 절차
```

#### 신규 사용자 등록 (User Setup)

소셜 로그인 후 최초 1회 실행. 소셜 계정에서 가져온 정보를 기반으로 프로필 설정.

**소셜 계정에서 가져오는 정보:**
- 이메일 (필수, 소셜 프로바이더 제공)
- 이름 (가능한 경우 사전 입력)
- 프로필 사진 URL (가능한 경우)

**사용자가 입력/확인하는 정보 (개인 프로필에 저장):**
- 이름 (필수 — 소셜에서 가져왔으면 확인만)
- 프로필 사진 (선택 — 직접 업로드 또는 소셜 사진 사용)

**등록 완료 후:**
- User 생성 (email, auth 정보, 실명)
- 개인 프로필 자동 생성 (display_name, 사진 저장)
- 초대된 워크스페이스가 있으면 → WS 선택 화면
- 없으면 → 개인 홈 (WS 없음 상태)

### 2.3 토큰 관리

외부 인증 서비스(Supabase)의 토큰 관리를 그대로 활용.
- Access Token + Refresh Token 방식
- 토큰 갱신, 만료 정책은 인증 서비스 설정에 따름

### 2.4 자동 로그인

```
앱 시작
  → Refresh Token 존재 여부 확인
    ├─ 없음 → 로그인 화면
    └─ 있음 → 토큰 갱신 시도
        ├─ 성공 → 마지막 사용 프로필로 앱 진입
        └─ 실패 → 로그인 화면
```

### 2.5 관리자 초대 진입

워크스페이스 관리자가 초대 링크/코드를 발급하여 사용자를 초대하는 경로도 지원.

```
초대 링크 클릭
  → 앱 실행 (딥링크)
  → 로그인 상태 확인
    ├─ 로그인됨 → 해당 워크스페이스에 조직 프로필 생성 → 워크스페이스 홈
    └─ 미로그인 → 소셜 로그인 → 사용자 등록(신규) → 워크스페이스 자동 참여
```

---

## 3. 사용자 & 멀티 프로필

### 3.1 User (계정)

인증된 계정. 로그인 식별과 계정 수준 관리(본인인증, 계정복구 등)를 담당.
앱 내 활동(채팅, 연락처 등)은 Profile 단위로 동작한다.

**속성:**
- 고유 ID
- 이메일 (소셜 프로바이더에서 제공, 로그인 식별자)
- 실명 (계정 인증/복구용)
- 소셜 연동 정보 (프로바이더, 외부 ID)
- 마지막 사용 프로필 ID (자동 로그인 시 복원)
- 생성일, 수정일

### 3.2 개인 프로필 (Personal Profile)

User 생성 시 자동으로 1개 생성. 삭제 불가.

**역할:**
- 개인 채팅 (1:1, 그룹)
- 개인 연락처 관리
- 소속 워크스페이스 목록 확인 및 전환
- 외부 소통 채널과의 채팅 (소비자 입장)

**홈 화면 구성:**
- 프로필 배너 (display_name, User.email 참조 표시, "개인" 태그)
- 내 워크스페이스 목록 (각 WS의 미확인 알림 요약 표시)
- WS 없음 상태: 초대 코드 입력 / 새로 만들기 CTA

### 3.3 조직 프로필 (Workspace Profile)

워크스페이스 참여 시 자동 생성. 해당 워크스페이스 내에서의 정체성.
Profile(표시 이름, 사진) + WorkspaceProfile(직책, 권한) + DepartmentMember(부서 소속)로 구성.

**Profile 속성:**
- 고유 ID
- 표시 이름 (워크스페이스 내 이름, 기본값 = User.name)
- 프로필 사진 (기본값 = 개인 프로필 사진)
- 상태 메시지

**WorkspaceProfile 속성:**
- 직책 (관리자 설정)
- 권한 (관리자 / 멤버)

**부서 소속:**
- 복수 부서 소속 가능 (예: 경영팀 + TF팀)

**홈 화면 구성:** (플러그인에 따라 가변)
- 프로필 배너 (이름, 부서·직책)
- 근무 카드 (근무관리 플러그인 활성 시)
- Quick Stats (결재 대기, 공지 미확인 등)
- 결재 프리뷰, 공지톡 프리뷰

### 3.4 프로필 전환

**컨텍스트 바:** 앱 상단에 현재 프로필 표시. 탭하면 프로필 스위처 드롭다운 열림.

**프로필 스위처:**
- 개인 프로필 (항상 최상단)
- 조직 프로필 목록 (가입한 워크스페이스별)
- 각 프로필의 미확인 알림 수 뱃지 표시
- "워크스페이스 추가" 버튼

**전환 동작:**
- 프로필 전환 시 해당 프로필의 마지막 화면으로 이동 (또는 홈)
- 프로필이 다르면 같은 사람이라도 별개로 취급 (채팅, 연락처 격리)

### 3.5 알림 규칙

- 각 프로필의 알림은 해당 프로필 컨텍스트에서만 상세 표시
- 다른 프로필의 알림은 프로필 스위처 뱃지로 요약 표시 (숫자)
- 푸시 알림은 프로필 구분 없이 수신하되, 알림 내용에 프로필 컨텍스트 표시

---

## 4. 워크스페이스

### 4.1 개념

워크스페이스 = 조직 단위. 회사, 팀, 동호회 등 어떤 그룹이든 가능.
하나의 User가 여러 워크스페이스에 참여 가능.

### 4.2 워크스페이스 생성

```
WS 생성 버튼
  → 기본 정보 입력
    - 워크스페이스 이름 (필수)
    - 로고 (선택)
  → 플러그인 선택
    - 사용할 기능 체크 (나중에 변경 가능)
  → 생성 완료
    - 생성자 = 관리자 권한
    - 조직 프로필 자동 생성
```

### 4.3 속성

- 고유 ID
- 이름
- 로고 이미지
- 생성자 ID
- 활성 플러그인 목록
- 초대 설정 (코드, 링크)
- 생성일, 수정일

### 4.4 멤버 관리

**역할:**
- 관리자 (Admin): 워크스페이스 설정, 멤버 관리, 플러그인 관리, 조직 구조 편집
- 멤버 (Member): 활성 기능 사용

**초대 방식:**
- 초대 링크 (URL, 만료 설정 가능)
- 초대 코드 (6자리 영숫자, 만료 설정 가능)

**탈퇴/추방:**
- 멤버 자발적 탈퇴 가능
- 관리자가 멤버 추방 가능
- 탈퇴/추방 시 해당 조직 프로필 비활성화 (데이터는 보존, 채팅 기록 등)

### 4.5 워크스페이스 포털

조직 프로필의 "워크스페이스" 탭. 활성 플러그인의 진입점.

**표시 내용:**
- 워크스페이스 정보 (이름, 로고, 구성원 수)
- 활성 플러그인 그리드 (아이콘 + 이름 + 요약 정보)
- 관리자: 설정 버튼 (워크스페이스 설정, 플러그인 관리, 멤버 관리)

---

## 5. 플러그인 시스템

### 5.1 개념

워크스페이스 기능을 모듈화. 필요한 기능만 활성화하여 사용.
워크스페이스 생성 시 선택하고, 이후 관리자가 언제든 추가/제거 가능.

### 5.2 기본 플러그인 목록

| 플러그인 | 설명 | 주요 기능 |
|----------|------|-----------|
| **결재** | 전자결재 요청 및 승인 | 결재 작성, 승인/반려, 결재선, 문서 관리 |
| **근무 관리** | 출퇴근 기록 및 근무시간 | 출퇴근 기록, 근무시간 집계, 근무 상태 표시 |
| **공지톡** | 공지사항 등록 및 알림 | 공지 작성/게시, 읽음 확인, 카테고리 |
| **일정 관리** | 팀 캘린더 및 일정 공유 | 일정 CRUD, 공유 캘린더, 리마인더 |
| **외부 소통** | 외부 고객과 채팅 상담 | 채널 관리, 외부 채팅 응대, 담당자 배정 |

### 5.3 플러그인 인터페이스

각 플러그인이 제공해야 하는 것:
- **포털 카드**: 워크스페이스 포털 그리드에 표시할 요약 정보
- **홈 위젯**: 조직 홈 화면에 표시할 위젯 (Quick Stats, 프리뷰 카드)
- **전용 화면**: 플러그인 자체의 상세 화면들
- **알림**: 플러그인에서 발생하는 알림 타입 정의

### 5.4 플러그인 활성/비활성

- 활성화: 관리자가 켜면 즉시 사용 가능, 기존 데이터 있으면 복원
- 비활성화: 데이터 보존하되 UI에서 숨김. 재활성화 시 복원.
- 완전 삭제: 관리자 확인 후 데이터 포함 삭제 (복구 불가 경고)

---

## 6. 메시징

### 6.1 개요

프로필별 독립된 채팅 시스템. 개인 프로필과 조직 프로필의 채팅은 완전 분리.

### 6.2 채팅 유형

| 유형 | 개인 프로필 | 조직 프로필 |
|------|------------|------------|
| 1:1 채팅 | ✅ 개인 연락처 대상 | ✅ 조직 멤버 대상 |
| 그룹 채팅 | ✅ | ✅ |
| 채널 채팅 | ✅ (외부 소통 채널과) | ✅ (외부 문의 응대) |

### 6.3 메시지 타입

- 텍스트
- 이미지 (복수)
- 파일
- 시스템 메시지 (입장, 퇴장, 채팅방 설정 변경 등)

### 6.4 채팅방 속성

- 고유 ID
- 유형 (1:1, 그룹, 채널)
- 참여자 목록 (프로필 ID 기반, 채널 프로필 포함)
- 각 참여자별: 채팅방 이름/아이콘 커스텀, 읽음 위치, 알림 설정

### 6.5 실시간 통신

- WebSocket 기반 (연결 시 현재 프로필 컨텍스트 전달)
- 이벤트: 새 메시지, 읽음 처리, 타이핑 표시, 온라인 상태
- 프로필 전환 시 WebSocket 컨텍스트 갱신

### 6.6 푸시 알림

- 메시지 수신 시 푸시 알림
- 알림에 프로필 컨텍스트 표시 (개인 / 워크스페이스명)
- 채팅방 단위 알림 끄기 지원
- 프로필 단위 알림 끄기 지원

---

## 7. 연락처

### 7.1 개인 프로필 연락처

- **플랫 구조** (그룹/부서 없음)
- 사용자가 직접 추가/삭제
- 추가 방식: 마루 사용자 검색 (이름, 이메일)
- 저장 정보: 상대방의 개인 프로필 정보 (display_name, 프로필 사진)

### 7.2 조직 프로필 연락처

- **조직 트리 구조** (부서별 분류)
- 관리자가 조직 구성 관리 (부서 생성, 멤버 배치)
- 멤버가 직접 추가/삭제 불가
- 표시 정보: 이름, 직책, 부서, 프로필 사진
- 부서 접기/펼치기, 검색 기능

### 7.3 조직 트리 구조

```
워크스페이스
├── 부서 A
│   ├── 멤버 1 (직책)
│   └── 멤버 2 (직책)
├── 부서 B
│   └── 멤버 3 (직책)
└── 미배정 (부서 없는 멤버)
```

- 관리자가 부서 CRUD
- 관리자가 멤버를 부서에 배치
- 한 멤버가 여러 부서에 소속 가능 (N:N, 예: 경영팀 + TF팀)
- 부서 없는 멤버는 "미배정"으로 표시

---

## 8. 외부 소통 채널

### 8.1 개념

워크스페이스가 외부 개인 사용자와 소통하는 공식 창구.
워크스페이스당 복수 채널 생성 가능 (고객지원, 예약문의 등).

### 8.2 채널 구성

**채널 속성:**
- 고유 ID
- 소속 워크스페이스 ID
- 채널 이름
- 채널 아이콘
- 소개글
- 운영시간 (시작, 종료, 요일)
- 공개 범위: `public` (검색 공개) / `private` (링크 전용)
- 자동 응답 메시지 (운영시간 외)
- 활성 상태 (on/off)
- 생성일, 수정일

### 8.3 담당자

채널로 들어온 외부 문의에 응대하는 조직 내부 멤버.

**속성:**
- 채널 ID
- 조직 프로필 ID
- 역할: `primary` (주 담당) / `secondary` (보조)
- 배정일

**규칙:**
- 최소 1명의 담당자 필요
- 복수 담당자 가능
- 담당자 추가/제거는 관리자 또는 주 담당자가 수행

### 8.4 외부 채팅 플로우

#### 개인 → 채널 (외부 사용자 입장)

```
채널 탐색 (검색) 또는 공유 링크로 진입
  → 채널 프로필 확인 (이름, 소개, 운영시간)
  → "채팅 시작" 버튼
  → 채팅방 생성 (참여자: 내 개인 프로필 + 채널의 가상 프로필)
  → 메시지 전송
  → 상대방은 채널의 가상 프로필(Profile.type=CHANNEL)로만 표시
```

**개인 채팅 목록에서의 표시:**
- 일반 채팅과 섞여서 표시 (시간순)
- 채널 아이콘 + "채널" 뱃지로 구분
- 채널 이름으로 표시 (담당자 이름 아님)

#### 채널 → 담당자 (조직 내부 입장)

```
외부 사용자가 메시지 전송
  → 담당자들의 조직 채팅 목록에 표시
  → "외부" 뱃지 + 채널명 표시
  → 담당자가 응답 → DB에는 실제 담당자 프로필로 저장, 외부에는 채널 프로필로 치환하여 전달
```

**조직 채팅 목록에서의 표시:**
- 일반 내부 채팅과 섞여서 표시 (시간순)
- "외부" 뱃지로 구분
- 외부 사용자 이름 + 어떤 채널로 들어온 문의인지 표시

### 8.5 담당자 전용 기능

**내부 메모:**
- 외부 사용자에게 보이지 않는 메모
- 담당자 간 공유 (같은 채널의 담당자 전원 열람 가능)
- 채팅 타임라인에 별도 스타일로 표시

**대화 이관:**
- 현재 담당자가 다른 담당자에게 대화를 넘김
- 이관 후에도 대화 이력 유지
- 외부 사용자는 이관 사실을 인지할 수 없음

**자동 응답:**
- 운영시간 외 자동 메시지 발송
- 부재중 설정 시 자동 메시지

### 8.6 채널 탐색 (개인 측)

- 공개(`public`) 채널만 검색 가능
- 검색 기준: 채널 이름, 워크스페이스 이름
- 비공개(`private`) 채널은 공유 링크로만 접근

---

## 9. 데이터 모델

### 네이밍 규칙

- PK는 `{entity}_id` 형식 (예: `user_id`, `profile_id`) — 컬럼명만으로 어떤 엔티티인지 식별 가능
- PK 타입은 String (Supabase auth.users.id 등 외부 ID 수용)
- FK/릴레이션 제약은 명시하지 않음 — 애플리케이션 레벨에서 관리

### 9.1 Core

```
User
├── user_id: String (PK)
├── auth_provider: Enum [KAKAO, GOOGLE, APPLE]
├── auth_provider_id: String (외부 인증 서비스의 사용자 ID)
├── email: String (UNIQUE)
├── name: String (실명, 본인인증/계정관리용)
├── last_active_profile_id: String (nullable)
├── created_at: Timestamp
└── updated_at: Timestamp
```

> User의 name = 실명 (계정 인증, 복구, 고객센터 등 계정 수준 작업용).
> Profile의 display_name = 앱 내 표시용 (프로필마다 다르게 설정 가능).
> 소셜 인증은 Supabase 등 외부 서비스에 위임.

### 9.2 Profile

시스템 전체에서 "누구인가"를 식별하는 통합 ID. 채팅, 메시지, 연락처 등 모든 곳에서 `profile_id`로 참조.

```
Profile
├── profile_id: String (PK)
├── user_id: String (nullable, CHANNEL이면 null)
├── type: Enum [PERSONAL, WORKSPACE, CHANNEL]
├── display_name: String
├── profile_image_url: String (nullable)
├── status_message: String (nullable, 상태 메시지)
├── enabled: Boolean (default: true, 탈퇴/추방 시 false)
├── created_at: Timestamp
└── updated_at: Timestamp

UNIQUE(user_id, type) WHERE type = PERSONAL  -- 개인 프로필은 1개
```

> CHANNEL 타입은 실제 사람이 아닌 가상 프로필. 채널 생성 시 자동 생성되며, 외부 사용자에게 채팅 상대로 보인다.

### 9.2.1 WorkspaceProfile (조직 멤버십)

조직 프로필의 확장. Profile과 1:1로 PK를 공유한다.
서버에서는 분리 저장하되, 클라이언트에는 항상 프로필에 조직 컨텍스트를 포함하여 내려준다.

```
WorkspaceProfile
├── profile_id: String (PK)       ← Profile.profile_id와 동일 (1:1 공유)
├── workspace_id: String
├── position: String (nullable, 직책)
├── role: Enum [ADMIN, MEMBER]
├── created_at: Timestamp
└── updated_at: Timestamp

UNIQUE(user_id, workspace_id)   -- 워크스페이스당 프로필 1개 (user_id는 Profile에서 조회)
```

### 9.2.2 Profile API 응답 규칙

프로필 조회 시 조직 프로필이면 워크스페이스 컨텍스트를 항상 포함하여 응답한다.

```json
// 개인 프로필
{
  "profile_id": "...",
  "type": "PERSONAL",
  "display_name": "김도현",
  "profile_image_url": "...",
  "status_message": "안녕하세요",
  "enabled": true,
  "workspace": null
}

// 조직 프로필
{
  "profile_id": "...",
  "type": "WORKSPACE",
  "display_name": "김도현",
  "profile_image_url": "...",
  "status_message": "업무중",
  "enabled": true,
  "workspace": {
    "workspace_id": "...",
    "workspace_name": "주식회사 아테나",
    "workspace_logo_url": "...",
    "departments": ["개발팀", "TF팀"],
    "position": "백엔드 개발",
    "role": "MEMBER"
  }
}
```

### 9.3 Workspace

```
Workspace
├── workspace_id: String (PK)
├── name: String
├── description: String (nullable, 워크스페이스 소개)
├── logo_url: String (nullable)
├── created_at: Timestamp
└── updated_at: Timestamp

WorkspacePlugin
├── workspace_plugin_id: String (PK)
├── workspace_id: String
├── plugin_type: Enum [APPROVAL, ATTENDANCE, ANNOUNCEMENT, SCHEDULE, CHANNEL]
├── enabled: Boolean
├── config: JSON (nullable, 플러그인별 설정)
├── enabled_at: Timestamp
└── UNIQUE(workspace_id, plugin_type)

WorkspaceInvite
├── workspace_invite_id: String (PK)
├── workspace_id: String
├── code: String (UNIQUE)
├── creator_id: String (생성한 프로필 ID)
├── expires_at: Timestamp (nullable)
├── max_uses: Integer (nullable)
├── use_count: Integer (default: 0)
└── created_at: Timestamp
```

### 9.4 Department (조직 트리)

```
Department
├── department_id: String (PK)
├── workspace_id: String
├── name: String
├── sort_order: Integer
├── created_at: Timestamp
└── UNIQUE(workspace_id, name)

DepartmentMember (프로필-부서 N:N 연결)
├── department_id: String (복합 PK)
├── profile_id: String (복합 PK)
```

한 프로필이 여러 부서에 소속 가능 (예: 경영팀 + TF팀).

### 9.5 Contact (개인 연락처)

```
Contact
├── owner_profile_id: String (복합 PK)
├── contact_profile_id: String (복합 PK)
├── nickname: String (nullable, 별명)
├── memo: String (nullable)
├── favorite: Boolean (default: false)
├── created_at: Timestamp
```

조직 연락처는 별도 테이블 불필요 — 같은 워크스페이스의 Profile 목록이 곧 연락처.

### 9.6 Messaging

```
ChatRoom
├── chat_room_id: String (PK)
├── type: Enum [DIRECT, GROUP, CHANNEL]
├── created_at: Timestamp
└── updated_at: Timestamp

ChatMember
├── chat_room_id: String (복합 PK)
├── profile_id: String (복합 PK)
├── name: String (nullable, 내가 지정한 채팅방 이름)
├── icon_url: String (nullable, 내가 지정한 채팅방 아이콘)
├── last_read_message_id: String (nullable)
├── notification_enabled: Boolean (default: true)
├── joined_at: Timestamp

ChatMessage
├── chat_message_id: String (PK)
├── chat_room_id: String
├── sender_profile_id: String         ← 항상 실제 보낸 사람
├── type: Enum [TEXT, IMAGE, FILE, SYSTEM, INTERNAL_NOTE]
├── content: String
├── metadata: JSON (nullable, 파일 정보 등)
├── created_at: Timestamp
└── INDEX(chat_room_id, created_at)
```

> ChatRoom은 참여자가 누군지만 안다 (ChatMember). 그게 사람이든 채널이든 상관없음.
> 채널 채팅방은 ChatMember 중 Profile(type=CHANNEL)이 있는 방.
> 채널 채팅 메시지 조회 시, 요청자에 따라 sender를 다르게 내려줌:
>   - 외부 사용자 → sender를 채널 프로필로 치환
>   - 내부 담당자 → sender를 실제 담당자 프로필 그대로 표시
> 외부 사용자에게는 `INTERNAL_NOTE` 타입 메시지가 필터링되어 보이지 않음.

### 9.7 Channel (외부 소통 채널)

워크스페이스가 외부 소통용으로 운영하는 채널의 부가 설정.
채널 생성 시 Profile(type=CHANNEL)이 자동 생성되고, 이 프로필이 채팅방에 참여자로 들어감.

```
Channel
├── channel_id: String (PK)
├── workspace_id: String
├── profile_id: String                ← 채널의 프로필 (Profile.type=CHANNEL)
├── name: String
├── icon_url: String (nullable)
├── description: String (nullable)
├── operating_hours_start: Time (nullable)
├── operating_hours_end: Time (nullable)
├── operating_days: String (nullable, 예: "MON,TUE,WED,THU,FRI")
├── visibility: Enum [PUBLIC, PRIVATE]
├── auto_reply_message: String (nullable)
├── enabled: Boolean (default: true)
├── created_at: Timestamp
└── updated_at: Timestamp
```

ChannelManager — 채널 프로필을 빌려 쓸 수 있는 담당자 목록 (모자).

```
ChannelManager
├── channel_id: String (복합 PK)
├── profile_id: String (복합 PK)
├── role: Enum [PRIMARY, SECONDARY]
├── created_at: Timestamp
├── updated_at: Timestamp
```

### 9.8 File (파일 저장)

```
File
├── file_id: String (PK)
├── uploader_id: String (업로드한 프로필 ID)
├── original_name: String
├── stored_path: String
├── content_type: String
├── size: Long
└── created_at: Timestamp
```

---

## 10. API 설계

RESTful API 기본. 실시간은 WebSocket.

### 10.1 사용자 & 프로필

```
POST   /api/v1/users/register                             사용자 등록 (최초 1회, name, profile_image)
GET    /api/v1/users/me                                   내 정보
PATCH  /api/v1/users/me                                   내 정보 수정
GET    /api/v1/profiles                                   내 프로필 목록 (개인 + 조직들)
GET    /api/v1/profiles/:profileId                        프로필 상세
PATCH  /api/v1/profiles/:profileId                        프로필 수정
PUT    /api/v1/profiles/last-active                       마지막 활성 프로필 갱신
```

### 10.2 워크스페이스

```
POST   /api/v1/workspaces                                              생성
GET    /api/v1/workspaces/:workspaceId                                 상세
PATCH  /api/v1/workspaces/:workspaceId                                 수정 (관리자)
DELETE /api/v1/workspaces/:workspaceId                                 삭제 (관리자)
GET    /api/v1/workspaces/:workspaceId/members                         멤버 목록
POST   /api/v1/workspaces/:workspaceId/members/:profileId/role         역할 변경 (관리자)
DELETE /api/v1/workspaces/:workspaceId/members/:profileId              멤버 추방 (관리자)
POST   /api/v1/workspaces/:workspaceId/leave                           탈퇴
POST   /api/v1/workspaces/:workspaceId/invites                         초대 생성 (관리자)
POST   /api/v1/workspaces/join                                         초대 코드로 참여
```

### 10.3 부서 (조직 트리)

```
GET    /api/v1/workspaces/:workspaceId/departments                                    부서 목록
POST   /api/v1/workspaces/:workspaceId/departments                                    부서 생성 (관리자)
PATCH  /api/v1/workspaces/:workspaceId/departments/:departmentId                       부서 수정 (관리자)
DELETE /api/v1/workspaces/:workspaceId/departments/:departmentId                       부서 삭제 (관리자)
POST   /api/v1/workspaces/:workspaceId/departments/:departmentId/members               멤버 부서 추가 (관리자)
DELETE /api/v1/workspaces/:workspaceId/departments/:departmentId/members/:profileId     멤버 부서 제거 (관리자)
```

### 10.4 플러그인

```
GET    /api/v1/workspaces/:workspaceId/plugins                          활성 플러그인 목록
PUT    /api/v1/workspaces/:workspaceId/plugins/:pluginType              플러그인 활성/비활성 (관리자)
GET    /api/v1/workspaces/:workspaceId/plugins/:pluginType/config       플러그인 설정 조회
PATCH  /api/v1/workspaces/:workspaceId/plugins/:pluginType/config       플러그인 설정 변경 (관리자)
```

### 10.5 연락처

```
GET    /api/v1/profiles/:profileId/contacts                       연락처 목록 (개인: 플랫, 조직: 부서별)
POST   /api/v1/profiles/:profileId/contacts                       연락처 추가 (개인만)
DELETE /api/v1/profiles/:profileId/contacts/:contactProfileId      연락처 삭제 (개인만)
GET    /api/v1/users/search?q=                                    사용자 검색 (연락처 추가용)
```

### 10.6 메시징

```
GET    /api/v1/profiles/:profileId/chatrooms              채팅방 목록
POST   /api/v1/profiles/:profileId/chatrooms              채팅방 생성
GET    /api/v1/chatrooms/:chatRoomId                       채팅방 상세
GET    /api/v1/chatrooms/:chatRoomId/messages              메시지 목록 (커서 기반 페이징)
POST   /api/v1/chatrooms/:chatRoomId/messages              메시지 전송
PUT    /api/v1/chatrooms/:chatRoomId/read                  읽음 처리
PATCH  /api/v1/chatrooms/:chatRoomId/notification          알림 설정 변경
```

### 10.7 외부 소통 채널

```
# 채널 관리 (조직)
GET    /api/v1/workspaces/:workspaceId/channels              채널 목록
POST   /api/v1/workspaces/:workspaceId/channels              채널 생성 (관리자)
GET    /api/v1/channels/:channelId                            채널 상세
PATCH  /api/v1/channels/:channelId                            채널 수정
DELETE /api/v1/channels/:channelId                            채널 삭제 (관리자)

# 담당자 관리
GET    /api/v1/channels/:channelId/managers                   담당자 목록
POST   /api/v1/channels/:channelId/managers                   담당자 추가
DELETE /api/v1/channels/:channelId/managers/:profileId        담당자 제거
PATCH  /api/v1/channels/:channelId/managers/:profileId        담당자 역할 변경

# 채널 탐색 (개인)
GET    /api/v1/channels/search?q=                             채널 검색 (공개만)
GET    /api/v1/channels/:channelId/profile                    채널 프로필 (공개 정보)

# 채널 채팅
POST   /api/v1/channels/:channelId/chat                       채널에 채팅 시작 (개인)
POST   /api/v1/chatrooms/:chatRoomId/messages                 메시지 전송 (공통)
POST   /api/v1/chatrooms/:chatRoomId/internal-notes           내부 메모 작성 (담당자)
POST   /api/v1/chatrooms/:chatRoomId/transfer                 대화 이관 (담당자)
```

### 10.8 WebSocket 이벤트

**연결:** `ws://host/ws?profile_id={profileId}&token={accessToken}`

**서버 → 클라이언트:**
```
message.new          새 메시지 수신
message.read         상대방 읽음 처리
typing.start         상대방 타이핑 시작
typing.stop          상대방 타이핑 중지
profile.notification 다른 프로필의 알림 요약 업데이트
chatroom.updated     채팅방 정보 변경
```

**클라이언트 → 서버:**
```
message.send         메시지 전송
message.read         읽음 처리
typing.start         타이핑 시작
typing.stop          타이핑 중지
profile.switch       프로필 전환 (컨텍스트 갱신)
```

---

## 부록: 미결 사항

구현 전 결정이 필요한 항목들.

| # | 항목 | 설명 | 후보 |
|---|------|------|------|
| 1 | 파일 저장소 | 프로필 사진, 채팅 이미지/파일 | S3 / MinIO |
| 2 | 채널 카테고리 | 채널 검색 시 카테고리 분류 필요 여부 | 없음 / 고정 카테고리 / 자유 태그 |
| 3 | 채널 자동 배정 | 담당자 복수일 때 외부 문의 자동 배정 규칙 | 라운드로빈 / 수동 선택 / 최소 부하 |
| 4 | 읽음 표시 범위 | 채널 채팅에서 읽음 표시를 외부에 보여줄지 | 표시 / 비표시 |
| 5 | 채널 차단 | 외부↔채널 상호 차단 기능 필요 여부 | 필요 / 추후 |
| 6 | 파일 전송 제한 | 채널 채팅 파일 첨부 허용 범위 | 전체 허용 / 이미지만 / 불가 |
| 7 | 메시지 검색 | 채팅 내 메시지 전문 검색 | Elasticsearch / DB LIKE |
| 8 | 데이터 보관 정책 | 탈퇴/추방 후 데이터 보관 기간 | 영구 / 90일 / 즉시 삭제 |
| 9 | 멀티 디바이스 | 동시 접속 허용 여부 및 동기화 | 허용 / 최근 1대만 |
| 10 | 오프라인 지원 | 메시지 로컬 캐시 및 오프라인 전송 대기 | 지원 / 미지원 |
