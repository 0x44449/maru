-- users 테이블에서 auth_provider 관련 컬럼 제거
-- 인증은 Supabase가 담당하고, 우리 DB에서는 email을 로그인 키로 사용

ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_auth_provider;
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider;
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider_id;
