# user-register-api 코드 리뷰

## 주요 지적 사항

### 1. `X-Profile-Id` 소유권 검증이 구현되지 않아 임의 UUID로 파일 업로드가 가능함

- 관련 파일: `apps/api/src/main/java/com/maru/api/config/auth/RequestPayloadResolver.java`
- 관련 위치: `toCredentialPayload()`, `extractProfileId()`
- 설계 문서는 `RequestPayloadResolver`에서 `(auth_provider, auth_provider_id)`로 사용자를 찾고, `X-Profile-Id`가 해당 사용자의 프로필인지 검증하도록 되어 있다.
- 하지만 현재 구현은 JWT에서 provider/email/sub만 추출하고, 헤더를 UUID로 파싱해서 그대로 `CredentialPayload`에 넣을 뿐이다. 소유권 검증이 전혀 없다.
- 그 결과 `[FileController.java](/Users/0x44449/Projects/maru/apps/api/src/main/java/com/maru/api/domain/file/FileController.java)`는 헤더 존재 여부만 확인한 뒤 업로드를 허용하므로, 인증된 사용자가 타인의 `profileId`를 임의로 넣어도 `uploader_id`로 기록할 수 있다.

### 2. 프로비저닝이 설계와 다르게 소셜 이름/기본 아바타를 반영하지 않음

- 관련 파일: `apps/api/src/main/java/com/maru/api/domain/user/UserService.java`
- 관련 위치: `provision()`
- 설계 문서는 이름 우선순위를 `JWT user_metadata.full_name/name` → 랜덤 이름으로 정의했고, PERSONAL 프로필에는 기본 아바타 URL을 넣도록 했다.
- 현재 구현은 `generateName()`만 호출해서 무조건 랜덤 이름을 만들고, `ProfileEntity` 생성 시 `profileImageUrl`도 비워 둔다.
- 즉 프로비저닝 결과가 설계와 다르고, 기본 아바타 초기화 코드가 있어도 실제 사용자에게 연결되지 않는다.

### 3. 파일 업로드 구현이 설계한 썸네일/상대경로/지연삭제 정책을 반영하지 않음

- 관련 파일: `apps/api/src/main/java/com/maru/api/domain/file/FileService.java`
- 관련 위치: `upload()`
- 설계는 원본 + 512x512 압축본(thumb) 생성, thumb URL 반환, 상대 경로 저장, 교체 시 soft delete/지연 삭제 정책을 정의했다.
- 현재 구현은 원본 1개만 업로드하고, 썸네일 생성이 없다. 반환 URL도 원본 경로 기준이고, `deleted_at`을 다루는 로직이나 스케줄러도 없다.
- 따라서 문서상 합의된 아바타 처리 정책 대부분이 아직 미구현 상태다.

### 4. `PATCH /api/v1/users/me`가 `X-Profile-Id` 필수 규칙을 실제로 강제하지 않음

- 관련 파일: `apps/api/src/main/java/com/maru/api/domain/user/UserController.java`
- 관련 위치: `updateMe()`
- 설계 문서는 `PATCH /api/v1/users/me`에 `X-Profile-Id` 필수를 명시하고 있다.
- 하지만 현재 컨트롤러/서비스는 `credential.profileId()` null 여부를 검사하지 않고, 헤더 값을 전혀 사용하지도 않는다. 그냥 `(auth_provider, auth_provider_id)` 기준으로 사용자를 찾고 PERSONAL profile을 수정한다.
- 설계와 구현 중 하나를 맞춰야 한다. 지금 구조를 유지할 거면 오히려 `PATCH /users/me`는 `X-Profile-Id` 불필요로 문서를 바꾸는 편이 더 자연스럽다.

## 추가 메모

- 모바일 `apps/mobile/src/stores/auth.ts`는 아직 `GET /api/v1/users/me` + `"unregistered"` 상태 기반 흐름을 유지하고 있어 v2 프로비저닝 설계와 맞지 않는다. 다만 이건 이미 후속 작업으로 남겨진 영역이다.
- `apps/mobile/src/app/(onboarding)/user-register.tsx`도 아직 `maruId`/필수 등록 흐름에 가까운 mock 상태다. 현재 리뷰 범위에서 blocker는 아니지만, v2 설계와는 아직 연결되지 않았다.

## 검증

- `apps/mobile`: `npx tsc --noEmit` 통과
- `apps/mobile`: `npm run lint` 통과
- `apps/api`: `./gradlew test`는 샌드박스 내 네트워크 제한으로 Gradle 배포본 다운로드가 막혀 실행하지 못함

## 결론

수정 후 재검토 권장. 특히 1번은 권한 검증 누락이라 실제 보안 문제로 이어질 수 있다.
