# 현재 설계 문서 일관성 리뷰

## 주요 지적 사항

### 1. `login-flow-completion.md`가 최신 `user-register-api.md (v2)`와 충돌함

- 관련 문서:
  - `workspace/designs/login-flow-completion.md`
  - `workspace/designs/user-register-api.md`
- `login-flow-completion.md`는 아직 `"unregistered"` 상태와 `GET /api/v1/users/me` 404 기반 분기를 전제로 한다.
- 반면 `user-register-api.md (v2)`는 로그인 직후 `POST /api/v1/users/provision`으로 자동 프로비저닝하고, `"unregistered"` 상태를 제거하는 설계로 바뀌었다.
- 게다가 최신 `user-register-api.md`는 `maru_id` 대신 `user_tag` 용어로도 바뀌었는데, `login-flow-completion.md`는 여전히 예전 등록/온보딩 개념에 머물러 있다.
- 즉 현재 기준으로는 `login-flow-completion.md`가 더 이상 최신 설계가 아니다. 구현자가 두 문서를 함께 보면 인증 상태 모델, 라우팅 기준, 프로필 설정 목적어 자체에서 혼란이 생긴다.
- 최소한 아래는 맞춰야 한다:
  - AuthStatus에서 `"unregistered"` 제거
  - 로그인 직후 `getMe` 대신 `provision` 호출
  - `(onboarding)` 그룹의 역할 재정의 또는 제거
  - `user-register.tsx`를 "필수 등록"이 아니라 "선택 프로필 설정" 화면으로 재정의
  - `maruId` 기준 서술을 `userTag` 기준으로 정리

### 2. `PATCH /api/v1/users/me`와 `POST /api/v1/files/upload`의 `X-Profile-Id` 요구사항이 더 명확하면 좋음

- 관련 문서: `workspace/designs/user-register-api.md`
- 두 API 모두 `X-Profile-Id`를 필수로 두고 있는데, 실제 의도는 PERSONAL profile을 전제로 한 프로필 수정/아바타 업로드에 가깝다.
- 현재 문서만 보면 "아무 owned profile이나 넣어도 되는지", "반드시 PERSONAL profile이어야 하는지"가 완전히 잠겨 있지는 않다.
- 특히 `PATCH /users/me`는 users.name과 PERSONAL profile.display_name을 함께 업데이트한다고 적혀 있으므로, 헤더가 WORKSPACE profile이어도 허용되는지 불명확하다.
- 구현 전에 아래 중 하나로 고정하는 편이 좋다:
  - 두 API는 PERSONAL profile만 허용
  - 또는 헤더는 단순 소유권 확인용이고, 실제 수정 대상은 항상 last_active/Personal profile이라고 명시

## 결론

개별 문서 품질은 괜찮지만, 현재는 `login-flow-completion.md`가 최신 v2 방향과 맞지 않는다. 다음 구현 전에 문서 간 기준을 한 번 정리하는 편이 안전하다.
