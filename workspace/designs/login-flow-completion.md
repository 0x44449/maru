# 로그인 플로우 마무리 설계

## 목적

로그인 화면의 UX를 제품 수준으로 완성하고, 인증 기반 자동 라우팅 구조를 잡는다:
1. 인증 상태에 따른 자동 라우팅 (Zustand + Supabase onAuthStateChange + Expo Router 그룹)
2. 로그인 진행 중 로딩 상태 표시
3. 로그인 실패 시 에러 모달 표시
4. 로그인 성공 후 서버 조회 → 사용자 등록/메인 화면 자동 분기

## 현재 상태

- `login.tsx`: 소셜 로그인 버튼만 존재, 로딩/에러 처리 없음
- 로그인 성공 시 무조건 `/user-register`로 이동
- `index.tsx`: `TODO: 실제 인증 상태에 따라 분기` — 현재 무조건 `/login` 리다이렉트
- 라우트 구조가 플랫 (인증/비인증 구분 없음)
- 상태관리 라이브러리 없음
- 백엔드 `GET /api/v1/users/me`: 구현됨 (사용자 없으면 404 `USER_NOT_FOUND`)
- API 호출 유틸리티 없음

---

## 1. 라우트 구조 변경

### 변경 전
```
src/app/
├── _layout.tsx
├── index.tsx              # → /login 리다이렉트
├── login.tsx
├── user-register.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── workspace.tsx
│   ├── chat.tsx
│   ├── contacts.tsx
│   └── more.tsx
├── chat-room.tsx
├── contact-add.tsx
└── profile-detail.tsx
```

### 변경 후
```
src/app/
├── _layout.tsx               # Root: Zustand 인증 상태 → 자동 라우팅
├── (auth)/                   # 미인증 사용자용
│   ├── _layout.tsx           # Stack (headerShown: false)
│   └── login.tsx
├── (onboarding)/             # 인증됨 + 서버 미등록 사용자용
│   ├── _layout.tsx           # Stack (headerShown: false)
│   └── user-register.tsx
└── (app)/                    # 인증됨 + 등록 완료 사용자용
    ├── _layout.tsx           # Stack (headerShown: false)
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── workspace.tsx
    │   ├── chat.tsx
    │   ├── contacts.tsx
    │   └── more.tsx
    ├── chat-room.tsx
    ├── contact-add.tsx
    └── profile-detail.tsx
```

### Root _layout.tsx 구현 패턴

세그먼트 기반 가드 패턴을 사용한다. 현재 세그먼트가 status에 맞는 그룹인지 확인하고,
올바르지 않을 때만 `<Redirect />`를 반환한다. 상태가 확정되기 전에는 로딩 화면만 표시한다.

```tsx
export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();

  // 상태 확정 전에는 로딩 화면만 표시 (Slot을 렌더링하지 않음)
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // 현재 세그먼트의 첫 번째 그룹 확인
  const inAuthGroup = segments[0] === "(auth)";
  const inOnboardingGroup = segments[0] === "(onboarding)";
  const inAppGroup = segments[0] === "(app)";

  // 올바른 그룹에 있지 않을 때만 Redirect 반환 (Slot을 렌더링하지 않음)
  if (status === "unauthenticated" && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }
  if (status === "unregistered" && !inOnboardingGroup) {
    return <Redirect href="/(onboarding)/user-register" />;
  }
  if (status === "error" && !inOnboardingGroup) {
    // 에러 상태에서도 onboarding 그룹으로 보내서 재시도 UI 제공
    return <Redirect href="/(onboarding)/user-register" />;
  }
  if (status === "authenticated" && !inAppGroup) {
    return <Redirect href="/(app)/(tabs)/workspace" />;
  }

  // 올바른 그룹에 있으면 정상 렌더링
  return <Slot />;
}
```

**라우팅 원칙:**
- 상태 확정 전(`"loading"`)에는 `<Slot />`을 렌더링하지 않아 잘못된 화면이 마운트되지 않음
- `<Redirect />`는 히스토리를 쌓지 않는 replace 동작 (뒤로가기로 이전 화면에 돌아가지 않음)
- 올바른 그룹에 이미 있으면 `<Slot />`만 렌더링하여 불필요한 리다이렉트 없음
- 뒤로가기는 같은 그룹 내에서만 동작 (그룹 간 전환은 status 변경으로만 발생)

### index.tsx 삭제
- 기존 `index.tsx`는 Root layout의 자동 라우팅으로 대체되므로 삭제

---

## 2. 인증 상태 관리 (Zustand + Supabase 연동)

### `src/stores/auth.ts` [신규]

```typescript
import { Session } from "@supabase/supabase-js";

type AuthStatus = "loading" | "unauthenticated" | "unregistered" | "error" | "authenticated";

interface AuthState {
  // 원시 상태 (직접 set)
  isInitialized: boolean;              // 초기화 완료 여부
  isCheckingUser: boolean;             // checkUser() 진행 중 여부
  session: Session | null;             // Supabase 세션 (onAuthStateChange가 관리)
  user: UserResponse | null;           // 서버 사용자 정보 (GET /me 결과)
  userFetchError: boolean;             // /me 조회 실패 여부 (5xx/네트워크 오류)

  // 파생 상태 (계산)
  readonly status: AuthStatus;
  // → !isInitialized || isCheckingUser    → "loading"
  // → !session                            → "unauthenticated"
  // → session && userFetchError           → "error"
  // → session && !user                    → "unregistered"
  // → session && user                     → "authenticated"

  // 액션
  checkUser: () => Promise<void>;      // GET /api/v1/users/me → user 설정 또는 null
  setUser: (user: UserResponse) => void; // 사용자 등록 완료 후 user 설정
  logout: () => Promise<void>;         // Supabase 로그아웃 → session/user 초기화
}
```

### Supabase 연동 — 스토어 생성 시 자동 등록

```
스토어 생성과 동시에 onAuthStateChange 리스너가 자동 등록된다.
별도의 initialize() 호출 없이, Supabase 클라이언트가 저장된 세션을 복원하면서
onAuthStateChange를 발동시켜 초기 상태 확인도 자동으로 처리된다.

onAuthStateChange((event, session) => {
  set({ session, isInitialized: true, userFetchError: false });
  if (session) → checkUser() 호출  // 내부에서 isCheckingUser를 true/false 전환
  else → set({ user: null, isCheckingUser: false })
})
```

### checkUser() 동시성 제어

`onAuthStateChange`는 `INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED` 등으로 여러 번 발동될 수 있다.
중복 요청과 stale 응답 문제를 방지하기 위해 다음 규칙을 적용한다:

- **요청 ID 기반 무시**: `checkUser()` 호출 시마다 요청 ID(카운터)를 증가시키고, 응답 도착 시 현재 요청 ID와 비교. 일치하지 않으면 응답을 무시한다.
- **중복 호출 시 이전 결과 무시**: 새 `checkUser()`가 호출되면 이전 호출의 응답은 도착해도 반영하지 않는다 (마지막 요청만 반영).
- **로그아웃 후 도착한 응답 무시**: `logout()` 시 요청 ID를 증가시켜, 이전에 보낸 `/me` 응답이 늦게 도착해도 user를 설정하지 않는다.

```typescript
// 의사코드
let requestId = 0;

checkUser: async () => {
  const currentRequestId = ++requestId;
  set({ isCheckingUser: true, userFetchError: false });
  try {
    const user = await api.get("/api/v1/users/me");
    if (currentRequestId !== requestId) return; // stale 응답 무시
    set({ user, isCheckingUser: false });
  } catch (e) {
    if (currentRequestId !== requestId) return; // stale 에러 무시
    if (e.errorCode === "USER_NOT_FOUND") {
      set({ user: null, isCheckingUser: false });          // → status = "unregistered"
    } else if (e.errorCode === "UNAUTHORIZED" || e.status === 401) {
      await supabase.auth.signOut();                        // → onAuthStateChange → "unauthenticated"
    } else {
      set({ userFetchError: true, isCheckingUser: false }); // → status = "error"
    }
  }
}
```

### 상태 전이 흐름

```
앱 시작 → 스토어 import 시 onAuthStateChange 리스너 자동 등록
  → Supabase가 저장된 세션 복원 → onAuthStateChange 발동
    → 세션 없음 → { isInitialized: true, session: null, user: null }
       → status = "unauthenticated"
    → 세션 있음 → { isInitialized: true, session, isCheckingUser: true }
       → status = "loading" (checkUser 진행 중이므로)
       → GET /me 200 → { user: UserResponse, isCheckingUser: false }
          → status = "authenticated"
       → GET /me 404 → { user: null, isCheckingUser: false }
          → status = "unregistered"
       → GET /me 401 → Supabase 로그아웃 → onAuthStateChange
          → status = "unauthenticated"
       → GET /me 5xx/네트워크 → { userFetchError: true, isCheckingUser: false }
          → status = "error"

소셜 로그인 성공
  → Supabase 세션 생성 → onAuthStateChange 발동
  → { session, isCheckingUser: true } → status = "loading"
  → checkUser() 완료 → 결과에 따라 status 자동 전환 → Root layout이 자동 라우팅

사용자 등록 완료
  → setUser(userResponse)
  → status = "authenticated" → Root layout이 (app) 그룹으로 자동 전환

로그아웃
  → supabase.auth.signOut() → onAuthStateChange 발동
  → { session: null, user: null, userFetchError: false }
  → status = "unauthenticated" → Root layout이 (auth) 그룹으로 자동 전환
```

### "error" 상태 처리

`status === "error"`일 때는 사용자 조회만 실패한 것이지 Supabase 인증은 유효한 상태이다.
Root layout에서 `(onboarding)` 그룹으로 보내되, user-register 화면에서 에러 상태를 감지하고
재시도 UI를 표시한다 (에러 모달 + "다시 시도" 버튼 → `checkUser()` 재호출).

**의존성 추가:** `zustand`

---

## 3. API 클라이언트

### `src/api/client.ts` [신규]

axios 기반 API 클라이언트. Supabase JWT를 자동 주입하는 인터셉터 포함.

```typescript
// axios 인스턴스 생성
// - baseURL: process.env.EXPO_PUBLIC_API_URL
// - request 인터셉터: supabase.auth.getSession()에서 access_token을 가져와
//   Authorization: Bearer 헤더 자동 주입
// - response 인터셉터: 에러 응답을 ApiError 구조로 변환하여 throw
```

**의존성 추가:** `axios`

### `src/api/types.ts` [신규]

```typescript
// 서버 에러 응답 타입 (GlobalExceptionHandler의 ErrorResponse 대응)
export interface ApiError {
  errorCode: string;
  message: string;
}

// 사용자 정보 응답 타입 (GET /api/v1/users/me, 서버 UserDto 대응)
export interface UserResponse {
  userId: string;
  email: string;
  name: string;
  lastActiveProfileId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### API 스펙: `GET /api/v1/users/me`

| 항목 | 값 |
|------|-----|
| Method | `GET` |
| Path | `/api/v1/users/me` |
| 인증 | `Authorization: Bearer <supabase_access_token>` |
| Request Body | 없음 |

**응답 상태코드 및 클라이언트 처리:**

| 상태코드 | 서버 응답 | errorCode | 클라이언트 상태 전이 |
|---------|----------|-----------|-------------------|
| 200 | `UserResponse` (JSON) | — | `user` 설정 → status = `"authenticated"` |
| 401 | `{ errorCode: "UNAUTHORIZED", message: "..." }` | `UNAUTHORIZED` | Supabase 로그아웃 → status = `"unauthenticated"` |
| 404 | `{ errorCode: "USER_NOT_FOUND", message: "..." }` | `USER_NOT_FOUND` | `user` = null → status = `"unregistered"` |
| 5xx | `{ errorCode: "UNHANDLED_ERROR", message: "..." }` | `UNHANDLED_ERROR` | `userFetchError` = true → status = `"error"` |
| 네트워크 오류 | 없음 (요청 실패) | — | `userFetchError` = true → status = `"error"` |

---

## 4. 에러 모달 컴포넌트

### `src/components/ErrorModal.tsx` [신규]

디자인 시스템 기반의 제품 수준 에러 모달.

**디자인 스펙:**
- `Modal` (React Native) + 반투명 오버레이 (`rgba(0,0,0,0.5)`)
- 모달 컨테이너: `surfaceRaised` 배경, `radius.lg` (12px), 좌우 마진 16px
- 패딩 24px
- 상단: 에러 아이콘 (원형 배경 `error.light` + 아이콘 `error.default`, 48px)
- 제목: fontSize `lg` (18px), `fontWeight.semibold`, `textPrimary`
- 본문: fontSize `sm` (14px), `textSecondary`, 중앙 정렬
- 버튼: 하단, full-width, solid variant (`primary.500` 배경, 흰색 텍스트), height 48px
- 진입 애니메이션: fade (React Native Modal의 기본 `fade` 사용)

**Props:**
```typescript
{
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;  // 기본값: "확인"
  onClose: () => void;
}
```

---

## 5. 로그인 화면 수정

### `src/app/(auth)/login.tsx` [이동 + 수정]

기존 `login.tsx`를 `(auth)/` 그룹으로 이동하고 로딩/에러 처리 추가.

**상태 추가:**
- `isLoading: boolean` — 로그인 진행 중 여부
- `error: { title: string; message: string } | null` — 에러 모달용

**로딩 상태 UX:**
- `isLoading === true` 일 때:
  - 소셜 로그인 버튼 비활성화 (opacity 0.4, 터치 불가)
  - 화면 중앙에 오버레이 + ActivityIndicator 표시 ("로그인 중..." 텍스트 포함)

**로그인 플로우:**
```
1. isLoading = true
2. 소셜 로그인 (카카오/구글) 호출
3. 성공 → Supabase 세션 생성 → onAuthStateChange 발동
   → Zustand 상태 자동 전환 → Root layout이 자동 라우팅
4. 소셜 로그인 실패 → 에러 모달 표시
5. finally: isLoading = false
```

- 로그인 화면에서 `router.replace()`를 직접 호출하지 않음
- Supabase onAuthStateChange → Zustand 상태 변경 → Root layout 자동 라우팅

**에러 모달 메시지:**
- 소셜 로그인 실패: 제목 "로그인 실패", 메시지 "로그인 중 문제가 발생했습니다. 다시 시도해주세요."
- 서버 오류: 제목 "연결 오류", 메시지 "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
- 사용자가 로그인 팝업을 취소한 경우는 에러 모달 표시하지 않음 (조용히 무시)

---

## 변경 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `apps/mobile/src/stores/auth.ts` | 신규 | Zustand 인증 상태 스토어 (Supabase onAuthStateChange 연동) |
| `apps/mobile/src/api/client.ts` | 신규 | axios 기반 API 클라이언트 (인터셉터로 JWT 자동 주입) |
| `apps/mobile/src/api/types.ts` | 신규 | API 응답/에러 타입 정의 |
| `apps/mobile/src/components/ErrorModal.tsx` | 신규 | 에러 모달 공통 컴포넌트 |
| `apps/mobile/src/app/_layout.tsx` | 수정 | 세그먼트 기반 가드 + 인증 상태 자동 라우팅 |
| `apps/mobile/src/app/(auth)/_layout.tsx` | 신규 | auth 그룹 레이아웃 |
| `apps/mobile/src/app/(auth)/login.tsx` | 이동+수정 | 기존 login.tsx 이동 + 로딩/에러 처리 |
| `apps/mobile/src/app/(onboarding)/_layout.tsx` | 신규 | onboarding 그룹 레이아웃 |
| `apps/mobile/src/app/(onboarding)/user-register.tsx` | 이동 | 기존 user-register.tsx 이동 |
| `apps/mobile/src/app/(app)/_layout.tsx` | 신규 | app 그룹 레이아웃 |
| `apps/mobile/src/app/(app)/(tabs)/_layout.tsx` | 이동 | 기존 (tabs) 레이아웃 이동 |
| `apps/mobile/src/app/(app)/(tabs)/*.tsx` | 이동 | 기존 탭 화면들 이동 |
| `apps/mobile/src/app/(app)/chat-room.tsx` | 이동 | 기존 파일 이동 |
| `apps/mobile/src/app/(app)/contact-add.tsx` | 이동 | 기존 파일 이동 |
| `apps/mobile/src/app/(app)/profile-detail.tsx` | 이동 | 기존 파일 이동 |
| `apps/mobile/src/app/index.tsx` | 삭제 | Root layout 자동 라우팅으로 대체 |
| `apps/mobile/.env.example` | 수정 | `EXPO_PUBLIC_API_URL=` 추가 |

## 의존성 추가

| 패키지 | 용도 |
|--------|------|
| `zustand` | 인증 상태 관리 |
| `axios` | HTTP 클라이언트 |

## 백엔드 변경 없음

- `GET /api/v1/users/me`는 이미 구현됨 (사용자 없으면 404 반환)
- 현재 구현으로 충분

---

## 고려사항

1. **사용자 취소**: 카카오/구글 로그인 팝업에서 사용자가 취소한 경우는 에러 모달을 표시하지 않음 (조용히 무시)
2. **네트워크 에러**: axios 네트워크 에러 시 "연결 오류" 모달 표시
3. **API_URL 환경변수**: `.env.example`에 `EXPO_PUBLIC_API_URL=` 항목 추가, `.env`에는 `EXPO_PUBLIC_API_URL=http://localhost:8080` 설정
4. **Supabase onAuthStateChange**: 스토어 생성 시 자동 등록. 세션 변경(로그인/로그아웃/토큰 갱신) 시 자동 상태 동기화
5. **스플래시 화면**: 인증 확인 중("loading" 상태)에는 `<Slot />`을 렌더링하지 않고 로딩 화면만 표시하여 잘못된 화면 마운트 방지
6. **status는 파생 상태**: isInitialized, isCheckingUser, session, user, userFetchError 5개 원시 상태의 조합으로 계산. 직접 할당하지 않아 상태 불일치 방지
7. **깜빡임 방지**: checkUser() 진행 중에는 isCheckingUser=true로 status가 "loading"을 반환. 기존 사용자가 잠깐 user-register 화면을 보는 문제 방지
8. **checkUser() 동시성 제어**: 요청 ID 기반으로 stale 응답 무시. 중복 호출, 로그아웃 후 늦은 응답 등 모든 경합 케이스 처리
9. **서버 오류와 미등록 구분**: `userFetchError` 원시 상태로 5xx/네트워크 오류를 `"unregistered"`와 분리. 서버 장애로 기존 사용자가 등록 화면을 보는 문제 방지
10. **세그먼트 기반 가드**: Root layout에서 `useSegments()`로 현재 그룹 확인 후, 올바른 그룹이면 `<Slot />` 렌더링, 아니면 `<Redirect />`만 반환하여 잘못된 화면 마운트 방지
