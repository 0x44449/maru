# Atena Design System v1.0.0

미니멀하고 깔끔하면서 부드러운 라운드를 가진 디자인 시스템.
웹과 모바일 모두 지원하며, 라이트/다크 모드를 포함한다.

> 디자인 토큰: [`tokens.json`](./tokens.json)

---

## Color

### Primary — Violet

깊고 감각적인 바이올렛 계열. 메인 액션, 강조, 브랜드 아이덴티티에 사용.

| Token | Value | 용도 |
|-------|-------|------|
| `primary.50` | `#f5f3ff` | 배경 하이라이트, 뱃지 배경 |
| `primary.100` | `#ede9fe` | 호버 배경 |
| `primary.200` | `#ddd6fe` | 비활성 상태 |
| `primary.300` | `#c4b5fd` | 다크모드 텍스트/아이콘 |
| `primary.400` | `#a78bfa` | 호버 상태 |
| `primary.500` | `#8b5cf6` | **기본 프라이머리** |
| `primary.600` | `#7c3aed` | 클릭/프레스 상태 |
| `primary.700` | `#6d28d9` | 강조 텍스트 |
| `primary.800` | `#5b21b6` | — |
| `primary.900` | `#4c1d95` | — |
| `primary.950` | `#2e1065` | 다크모드 배경 |

### Neutral

텍스트, 배경, 보더 등 범용으로 사용하는 무채색 팔레트.

| Token | Value | 용도 |
|-------|-------|------|
| `neutral.0` | `#ffffff` | 라이트 배경 |
| `neutral.50` | `#fafafa` | 라이트 서피스 |
| `neutral.100` | `#f5f5f5` | 비활성 배경 |
| `neutral.200` | `#e5e5e5` | 보더 (라이트) |
| `neutral.300` | `#d4d4d4` | 강한 보더, 디바이더 |
| `neutral.400` | `#a3a3a3` | 플레이스홀더 텍스트 |
| `neutral.500` | `#737373` | 보조 텍스트 |
| `neutral.600` | `#525252` | 세컨더리 텍스트 |
| `neutral.700` | `#404040` | 다크모드 보더 |
| `neutral.800` | `#262626` | 다크모드 서피스 |
| `neutral.900` | `#171717` | 라이트 기본 텍스트 |
| `neutral.950` | `#0a0a0a` | 다크모드 배경 |

### Semantic Colors

상태를 나타내는 색상. 각 색상은 light/default/dark 3단계.

| 상태 | Light | Default | Dark |
|------|-------|---------|------|
| Success | `#dcfce7` | `#22c55e` | `#15803d` |
| Warning | `#fef9c3` | `#eab308` | `#a16207` |
| Error | `#fee2e2` | `#ef4444` | `#b91c1c` |
| Info | `#dbeafe` | `#3b82f6` | `#1d4ed8` |

### Theme Tokens

컴포넌트에서 직접 참조하는 시맨틱 토큰. 라이트/다크 모드 전환 시 이 토큰만 교체.

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#ffffff` | `#0a0a0a` |
| `surface` | `#fafafa` | `#171717` |
| `surfaceRaised` | `#ffffff` | `#262626` |
| `border` | `#e5e5e5` | `#262626` |
| `borderStrong` | `#d4d4d4` | `#404040` |
| `textPrimary` | `#171717` | `#fafafa` |
| `textSecondary` | `#525252` | `#a3a3a3` |
| `textTertiary` | `#737373` | `#737373` |
| `textInverse` | `#ffffff` | `#171717` |
| `primaryBg` | `#f5f3ff` | `#2e1065` |
| `primaryText` | `#7c3aed` | `#c4b5fd` |

---

## Typography

### Font Family

| Token | Value |
|-------|-------|
| `sans` | `Pretendard`, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif |
| `mono` | `JetBrains Mono`, SF Mono, Fira Code, monospace |

모바일에서는 시스템 폰트로 자연스럽게 폴백된다.

### Font Size Scale

| Token | Size | 용도 |
|-------|------|------|
| `xs` | 12px | 캡션, 라벨 |
| `sm` | 14px | 보조 텍스트, 작은 버튼 |
| `base` | 16px | 기본 본문 |
| `lg` | 18px | 큰 본문 |
| `xl` | 20px | H6, 서브 타이틀 |
| `2xl` | 24px | H5 |
| `3xl` | 30px | H4 |
| `4xl` | 36px | H3 |
| `5xl` | 48px | H2 |
| `6xl` | 60px | H1, 히어로 |

### Heading 규격

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 60px | Bold (700) | 1.1 |
| H2 | 48px | Bold (700) | 1.2 |
| H3 | 36px | Semibold (600) | 1.2 |
| H4 | 30px | Semibold (600) | 1.3 |
| H5 | 24px | Semibold (600) | 1.3 |
| H6 | 20px | Medium (500) | 1.4 |

### Body 규격

| Size | Font Size | Weight | Line Height |
|------|-----------|--------|-------------|
| lg | 18px | Regular (400) | 1.5 |
| base | 16px | Regular (400) | 1.5 |
| sm | 14px | Regular (400) | 1.5 |
| xs | 12px | Regular (400) | 1.5 |

---

## Spacing

4px 단위 기반. 일관된 간격을 위해 이 스케일만 사용한다.

| Token | Value |
|-------|-------|
| `0` | 0px |
| `1` | 4px |
| `2` | 8px |
| `3` | 12px |
| `4` | 16px |
| `5` | 20px |
| `6` | 24px |
| `8` | 32px |
| `10` | 40px |
| `12` | 48px |
| `16` | 64px |
| `20` | 80px |
| `24` | 96px |

---

## Border Radius

기본값은 `md (8px)`. 딱딱하지 않으면서 깔끔한 라운드.

| Token | Value | 용도 |
|-------|-------|------|
| `none` | 0px | 라운드 없음 |
| `sm` | 4px | 작은 요소 (태그, 뱃지 내부) |
| `md` | **8px** | **기본값** — 버튼, 인풋, 카드 |
| `lg` | 12px | 큰 카드, 모달 |
| `xl` | 16px | 대형 컨테이너 |
| `2xl` | 24px | 특수 케이스 |
| `full` | 9999px | 원형 (아바타, pill 뱃지) |

---

## Shadow

은은한 3단계. 미니멀 톤을 유지하기 위해 과도한 그림자는 지양.

| Token | Value | 용도 |
|-------|-------|------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | 미세한 분리감 |
| `md` | `0 4px 12px rgba(0,0,0,0.08)` | 카드, 드롭다운 |
| `lg` | `0 8px 24px rgba(0,0,0,0.12)` | 모달, 팝오버 |

---

## Breakpoints

| Token | Value | 기기 |
|-------|-------|------|
| `sm` | 640px | 모바일 (가로) |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 작은 데스크탑 |
| `xl` | 1280px | 데스크탑 |
| `2xl` | 1536px | 대형 데스크탑 |

---

## Z-Index

레이어 충돌 방지를 위한 고정 스케일.

| Token | Value |
|-------|-------|
| `dropdown` | 1000 |
| `sticky` | 1100 |
| `overlay` | 1200 |
| `modal` | 1300 |
| `popover` | 1400 |
| `toast` | 1500 |

---

## Transition

| Token | Value | 용도 |
|-------|-------|------|
| `fast` | 150ms ease | 호버, 토글 |
| `normal` | 200ms ease | 일반 전환 |
| `slow` | 300ms ease | 모달, 페이지 전환 |

---

## Components

### Button

3가지 사이즈. 기본값은 `md`.

| Size | Height | Padding (좌우) | Font Size | Icon Size |
|------|--------|---------------|-----------|-----------|
| `sm` | 32px | 12px | 14px | 16px |
| `md` | **40px** | 16px | 14px | 20px |
| `lg` | 48px | 24px | 16px | 20px |

**Variant:**

| Variant | 설명 | 용도 |
|---------|------|------|
| `solid` | 프라이머리 배경 + 흰색 텍스트 | 주요 액션 (저장, 제출) |
| `outline` | 투명 배경 + 프라이머리 보더/텍스트 | 보조 액션 |
| `ghost` | 투명 배경 + 프라이머리 텍스트, 보더 없음 | 덜 중요한 액션 |
| `danger` | Error 배경 + 흰색 텍스트 | 삭제, 위험한 액션 |

### Input

Button과 동일한 높이 체계. 기본값은 `md`.

| Size | Height | Padding (좌우) | Font Size |
|------|--------|---------------|-----------|
| `sm` | 32px | 10px | 14px |
| `md` | **40px** | 14px | 14px |
| `lg` | 48px | 16px | 16px |

- 기본 보더: `neutral.200` (1px)
- 포커스: 프라이머리 보더 + 포커스 링
- 에러: `error.default` 보더
- 비활성: opacity 0.4, cursor not-allowed

### Avatar

둥근 사각형 아바타. 모든 모듈에서 이 규격을 공통으로 사용한다.

| Size | 크기 | Border Radius | 용도 |
|------|------|---------------|------|
| `xs` | 24px | 8px | 그룹 아바타 (3인 이상) |
| `sm` | 28px | 10px | 플로팅 알림 |
| `md` | 36px | 12px | 메시지 아바타, 참여자 목록 |
| `lg` | 48px | 16px | 채팅 목록 아이템 |
| `xl` | 56px | 20px | 프로필 카드, 서랍 프로필 |

- **형태**: 둥근 사각형 (크기의 약 1/3 비율 radius)
- Notification Badge, Presence Indicator 등 아바타가 아닌 요소는 원형(`full`) 유지

### Group Avatar

그룹 채팅에서 참여자 아바타를 겹쳐서 보여주는 Avatar의 확장 컴포넌트.

**2인 그룹:**

| 속성 | 값 |
|------|-----|
| 전체 영역 | 48×48px |
| 개별 아바타 크기 | 32px |
| Border Radius | 12px (`avatar.md` radius) |
| 보더 | 2px, `background` 색상 (겹침 분리) |
| 배치 | A: 좌상단, B: 우하단, 겹침 16px |

**3인 이상:**

| 속성 | 값 |
|------|-----|
| 전체 영역 | 48×48px |
| 개별 아바타 크기 | 24px (`avatar.xs`) / 4인: 22px |
| Border Radius | 8px |
| 보더 | 2px, `background` 색상 |
| 배치 (3인) | A,B: 상단, C: 하단 중앙 |
| 배치 (4인) | 2×2 그리드, 간격 2px |

**크기 변형** — 사용처에 따라 전체 영역 크기를 조정. 내부 비율은 동일 유지.

| 전체 영역 | 2인 아바타 | 3인+ 아바타 | 용도 |
|----------|----------|-----------|------|
| 48px | 32px | 24px | 채팅 목록 (기본) |
| 56px | 38px | 28px | 프로필 영역 |

### Notification Badge

읽지 않은 수를 표시하는 뱃지. 채팅 목록, 메시지 상태 등 여러 모듈에서 재사용.

| 속성 | 값 |
|------|-----|
| 숫자 있을 때 | 높이 20px, 좌우 패딩 6px, 최소 너비 20px |
| 숫자 없을 때 (점) | 10px 원형 |
| Font Size | 11px, bold (700) |
| 배경 | `error.default` |
| 텍스트 | `#ffffff` |
| Border Radius | `full` |
| 99 초과 | "99+" 표시 |

**배치 방식:**

| 방식 | 설명 |
|------|------|
| 독립 | 인라인 요소로 배치 (채팅 목록 우측 영역 등) |
| 오버레이 | 부모 요소 우상단, -4px offset |

**배리언트:**

| 배리언트 | 배경 | 용도 |
|---------|------|------|
| 기본 | `error.default` | 읽지 않은 알림 |
| 음소거 | `neutral.400` | 음소거된 채팅방 |

### Checkbox

| Size | 크기 | 아이콘 | Radius |
|------|------|--------|--------|
| `sm` | 16px | 12px | 4px |
| `md` | 20px | 14px | 4px |

- 미선택: `neutral.300` 보더 (1.5px), 투명 배경
- 선택: 프라이머리 배경 + 흰색 체크 아이콘
- 비활성: opacity 0.4
- 라벨과의 간격: 8px

### Radio

| Size | 크기 |
|------|------|
| `sm` | 16px |
| `md` | 20px |

- 미선택: `neutral.300` 보더 (1.5px), 투명 배경
- 선택: 프라이머리 보더 + 내부에 프라이머리 원 (크기의 50%)
- 라벨과의 간격: 8px

### Toggle (Switch)

| Size | 너비 | 높이 | Thumb 크기 |
|------|------|------|-----------|
| `sm` | 36px | 20px | 16px |
| `md` | 44px | 24px | 20px |

- OFF: `neutral.300` 배경, 흰색 thumb
- ON: 프라이머리 배경, 흰색 thumb (오른쪽으로 이동)
- Thumb 여백: 2px
- 전환 애니메이션: `150ms ease`

### Select (Dropdown)

Input과 동일한 높이 체계. 우측에 chevron-down 아이콘.

| Size | Height | Padding (좌우) | Font Size |
|------|--------|---------------|-----------|
| `sm` | 32px | 10px | 14px |
| `md` | 40px | 14px | 14px |
| `lg` | 48px | 16px | 16px |

- 드롭다운 메뉴: `surfaceRaised` 배경, `shadow.md`, `border-radius: 8px`
- 옵션 항목 높이: 36px, 좌우 패딩 12px
- 선택된 옵션: 프라이머리 배경 (연한) + 프라이머리 텍스트
- 호버: `rgba(0,0,0,0.04)` 배경

### Textarea

| 속성 | 값 |
|------|-----|
| 최소 높이 | 80px |
| Padding (좌우) | 14px |
| Padding (상하) | 10px |
| Font Size | 14px |
| Border Radius | 8px |

- 리사이즈: 세로만 허용 (`resize: vertical`)
- 나머지 상태(포커스, 에러, 비활성)는 Input과 동일

---

## Modal / Dialog

| Size | 너비 | 용도 |
|------|------|------|
| `sm` | 400px | 확인/취소, 간단한 폼 |
| `md` | 560px | 일반 폼, 상세 내용 |
| `lg` | 720px | 복잡한 폼, 미리보기 |

| 속성 | 값 |
|------|-----|
| Padding | 24px |
| Border Radius | 12px (lg) |
| 오버레이 | `rgba(0,0,0,0.5)` |
| Shadow | `shadow.lg` |
| 진입 애니메이션 | fade in + 아래에서 위로 8px 이동, `200ms ease` |
| 닫기 애니메이션 | fade out, `150ms ease` |

**구조:**
```
┌─ Modal ──────────────────────────┐
│ Header: 제목 (H6) + X 닫기 버튼   │
│──────────────────────────────────│
│ Body: 콘텐츠 영역                  │
│──────────────────────────────────│
│ Footer: 액션 버튼 (우측 정렬)       │
└──────────────────────────────────┘
```

- Header와 Footer 사이에 `border` 디바이더
- 모바일에서는 full-width (좌우 16px 마진)
- ESC 키 또는 오버레이 클릭으로 닫기

---

## Navigation

### Navbar (상단 내비게이션)

| 속성 | 데스크탑 | 모바일 |
|------|---------|--------|
| 높이 | 56px | 48px |
| 좌우 패딩 | 24px | 16px |
| 배경 | `surfaceRaised` | `surfaceRaised` |
| 하단 보더 | `border` 1px | `border` 1px |

- 로고: 좌측
- 내비 링크: 중앙 또는 좌측 로고 옆
- 액션 (검색, 알림, 프로필): 우측
- 모바일: 햄버거 메뉴 → 사이드 시트 또는 드롭다운

### Sidebar (사이드 내비게이션)

| 속성 | 값 |
|------|-----|
| 너비 (펼침) | 240px |
| 너비 (접힘) | 64px |
| 좌우 패딩 | 12px |
| 상하 패딩 | 16px |
| 항목 높이 | 40px |
| 항목 Radius | 8px |
| 배경 | `surface` |

- 활성 항목: 프라이머리 배경 (연한) + 프라이머리 텍스트
- 호버: `rgba(0,0,0,0.04)` 배경
- 아이콘 + 라벨 구성, 접힌 상태에서는 아이콘만 표시
- 섹션 구분: 라벨 (`xs`, `textTertiary`, uppercase) + 8px 상단 마진

### Tab

| 속성 | 값 |
|------|-----|
| 높이 | 40px |
| 좌우 패딩 | 16px |
| Font Size | 14px |
| Font Weight | Medium (500) |

- 비활성: `textTertiary` 색상
- 활성: `textPrimary` + 하단 2px 프라이머리 인디케이터
- 호버: `textPrimary` 색상
- 하단에 `border` 1px 전체 라인, 활성 탭의 인디케이터가 그 위에 위치

### Bottom Tab Bar (하단 탭 바)

모바일 앱 전체에서 사용하는 하단 고정 네비게이션.

```
┌──────┬──────┬──────┬──────┬──────┐
│  홈   │ 채팅  │ 결재  │ 연락처 │ 더보기 │
│ 🏠   │ 💬   │ 📄   │ 📒   │ ☰   │
└──────┴──────┴──────┴──────┴──────┘
```

**컨테이너:**

| 속성 | 값 |
|------|-----|
| 높이 | 56px (safe area 제외) |
| 배경 | `background` |
| 상단 보더 | `border` 1px |
| position | fixed, bottom: 0 |
| z-index | `sticky` (1100) |
| safe area | `padding-bottom: env(safe-area-inset-bottom)` |

**탭 아이템:**

| 속성 | 값 |
|------|-----|
| 레이아웃 | flex, 균등 분배 |
| 아이콘 | 24px |
| 정렬 | 중앙 |
| 터치 영역 | 48×48px |

**상태:**

| 상태 | 아이콘/라벨 색상 |
|------|----------------|
| 비활성 | `textTertiary` |
| 활성 | `primary.600` |

**탭 구성:**

| 순서 | 라벨 | 아이콘 | 화면 |
|------|------|--------|------|
| 1 | 홈 | `home` | 홈 화면 |
| 2 | 채팅 | `message-circle` | 채팅 목록 |
| 3 | 결재 | `file-check` | 결재 목록 |
| 4 | 연락처 | `book-user` | 조직 연락처 |
| 5 | 더보기 | `menu` | 더보기 메뉴 |

**뱃지:** 채팅, 결재 탭에 `Notification Badge` 표시 가능 (아이콘 우상단).

---

## Table

| 속성 | 값 |
|------|-----|
| 헤더 행 높이 | 44px |
| 데이터 행 높이 | 48px |
| 셀 좌우 패딩 | 16px |
| 셀 상하 패딩 | 12px |
| Font Size | 14px |

- 헤더: `surface` 배경, `textSecondary`, font-weight `semibold (600)`
- 행 구분: 하단 `border` 1px
- 호버: `rgba(0,0,0,0.02)` 배경
- 정렬: 텍스트 좌측, 숫자 우측
- 빈 상태: 중앙 정렬된 아이콘(lg) + 메시지

---

## Pagination

| 속성 | 값 |
|------|-----|
| 버튼 크기 | 36px x 36px |
| Font Size | 14px |
| 버튼 간격 | 4px |
| Border Radius | 8px |

- 현재 페이지: 프라이머리 배경 + 흰색 텍스트
- 다른 페이지: 투명 배경 + `textSecondary`
- 호버: `rgba(0,0,0,0.04)` 배경
- 비활성 (이전/다음): opacity 0.4

---

## Loading

### Skeleton

콘텐츠가 로딩 중일 때 레이아웃 구조를 미리 보여주는 플레이스홀더.

| 속성 | Light | Dark |
|------|-------|------|
| 기본 색상 | `#e5e5e5` | `#262626` |
| Shimmer 색상 | `#f5f5f5` | `#404040` |
| 애니메이션 | 좌→우 shimmer, 1.5s, infinite |
| Border Radius | 실제 콘텐츠와 동일하게 맞춤 |

- 텍스트 skeleton: 높이는 font-size와 동일, 너비는 60~80%
- 이미지 skeleton: 실제 이미지 비율과 동일
- 반복 항목: 3~5개의 skeleton 행 표시

### Spinner

| Size | 크기 | 용도 |
|------|------|------|
| `sm` | 16px | 버튼 내부 |
| `md` | 24px | 인라인 로딩 |
| `lg` | 40px | 페이지/섹션 로딩 |

- 스타일: 원형, stroke-width `2.5px`
- 색상: 프라이머리 (기본) 또는 흰색 (프라이머리 버튼 내부)
- 애니메이션: 회전, `0.75s linear infinite`

---

## Responsive Typography

모바일에서는 큰 제목의 사이즈를 줄여 가독성을 확보한다.

| Level | 데스크탑 (≥768px) | 모바일 (<768px) |
|-------|-----------------|----------------|
| H1 | 60px | 36px |
| H2 | 48px | 30px |
| H3 | 36px | 24px |
| H4 | 30px | 20px |
| H5 | 24px | 20px |
| H6 | 20px | 18px |
| Body | 변경 없음 | 변경 없음 |

---

## Icon

**라이브러리: [Lucide Icons](https://lucide.dev)**

미니멀하고 일관된 선 두께의 오픈소스 아이콘 세트. 웹/모바일 모두 지원.

| Size | 크기 | 용도 |
|------|------|------|
| `sm` | 16px | 인라인, 작은 버튼 |
| `md` | 20px | 기본 버튼, 내비게이션 |
| `lg` | 24px | 강조, 빈 상태 |

- Stroke Width: `1.75` (Lucide 기본값보다 살짝 가늘게 — 미니멀 톤)
- 색상: 주변 텍스트 색상을 따름 (`currentColor`)

---

## State (상태 패턴)

모든 인터랙티브 요소에 일관되게 적용하는 상태 규칙.

| 상태 | 처리 방식 |
|------|----------|
| **Default** | 기본 스타일 |
| **Hover** | opacity 0.85 또는 배경에 `rgba(0,0,0,0.04)` 오버레이 |
| **Active (Press)** | opacity 0.75 또는 배경에 `rgba(0,0,0,0.08)` 오버레이 |
| **Focus** | 포커스 링 표시 (아래 참고) |
| **Disabled** | opacity 0.4 + `cursor: not-allowed`. 클릭 이벤트 무시. |
| **Error** | 보더를 `error.default` 색상으로 변경 |
| **Loading** | 내부 콘텐츠 숨기고 스피너 표시. 클릭 방지. |

### Focus Ring

키보드 접근성을 위한 포커스 표시. `:focus-visible`에서만 표시 (마우스 클릭 시 안 보임).

```
box-shadow: 0 0 0 2px [background-color], 0 0 0 4px #7c3aed;
```

- 배경색 2px → 프라이머리 2px 순서의 이중 링
- 다크모드에서도 동일한 구조, 배경색만 다크 배경으로 교체

---

## Layout

### Container

콘텐츠 영역의 최대 너비. 중앙 정렬, 좌우 패딩 포함.

| Token | Max Width | 용도 |
|-------|-----------|------|
| `sm` | 640px | 좁은 콘텐츠 (로그인, 설정) |
| `md` | 768px | 블로그, 글 읽기 |
| `lg` | 1024px | 일반 대시보드 |
| `xl` | 1280px | 넓은 레이아웃 |

- 좌우 패딩: 모바일 `16px`, 데스크탑 `24px`

### Grid

| 속성 | 값 |
|------|-----|
| 컬럼 수 | 12 |
| Gutter (모바일) | 16px |
| Gutter (데스크탑) | 24px |

### 최소 터치 영역

모바일에서 탭 가능한 요소의 최소 크기: **44 x 44px** (WCAG 기준).
버튼이 이보다 작을 경우, 투명한 패딩으로 터치 영역을 확보한다.

---

## Border

| Token | Value | 용도 |
|-------|-------|------|
| `default` | 1px | 일반 보더 (카드, 인풋, 디바이더) |
| `strong` | 1.5px | 포커스 상태, 강조 보더 |

---

## Opacity

| Token | Value | 용도 |
|-------|-------|------|
| `disabled` | 0.4 | 비활성 상태 |
| `overlay` | 0.5 | 모달 뒤 오버레이 |
| `hover` | 0.08 | 고스트 버튼 호버 배경 |

---

## 사용 원칙

1. **Theme 토큰 우선 사용** — 컴포넌트에서 raw 컬러값 대신 `theme.textPrimary`, `theme.border` 등의 시맨틱 토큰을 사용한다. 다크모드 전환이 자동으로 처리된다.
2. **Spacing 스케일 준수** — 임의의 값(예: 13px, 7px) 대신 정의된 스케일만 사용한다.
3. **Border Radius 기본값** — 특별한 이유가 없으면 `md (8px)`를 사용한다.
4. **Shadow 절제** — 미니멀 톤 유지를 위해 그림자는 필요한 경우에만 사용한다.
5. **폰트는 Pretendard** — 웹에서는 CDN으로 로드, 모바일에서는 번들 또는 시스템 폰트 폴백.
6. **아이콘은 Lucide** — 프로젝트 간 통일된 아이콘 세트 사용. stroke-width 1.75.
7. **상태 패턴 준수** — hover/active/disabled/focus 상태를 위 규칙대로 일관되게 적용.
8. **최소 터치 영역 44px** — 모바일에서 탭 가능한 요소는 반드시 44x44px 이상.
9. **Focus는 :focus-visible만** — 마우스 클릭 시 포커스 링을 표시하지 않는다.
10. **반응형 타이포** — H1~H4는 모바일에서 자동으로 작아진다. 브레이크포인트 `md (768px)` 기준.
11. **모달은 모바일에서 full-width** — 데스크탑에서는 고정 너비, 모바일에서는 좌우 16px 마진.
12. **테이블 정렬** — 텍스트는 좌측, 숫자는 우측 정렬.
13. **로딩 상태 필수** — 데이터를 불러오는 모든 영역에 skeleton 또는 spinner를 제공한다.
