# Repository Guidelines

## Project Structure & Module Organization
This repository is a small monorepo. The active product code is in `apps/mobile`, an Expo + React Native app. Routes live in `apps/mobile/src/app` and follow Expo Router naming such as `(tabs)/chat.tsx` and `user-register.tsx`. Shared tokens and hooks live in `apps/mobile/src/constants`, auth code lives in `apps/mobile/src/libs`, and types live in `apps/mobile/src/types`. Static assets are under `apps/mobile/assets`. Product docs are in `docs/`, and local container setup lives in `infra/docker/docker-compose.yml`.

## Build, Test, and Development Commands
Run mobile commands from `apps/mobile`.

- `npm install`: install app dependencies.
- `npm run start`: start the Expo dev server.
- `npm run ios`: build and run the iOS app locally.
- `npm run android`: build and run the Android app locally.
- `npm run web`: run the app in a browser for quick UI checks.
- `npm run lint`: run Expo's ESLint configuration.
- `npm run reset-project`: reset the Expo starter scaffold; do not run this on active feature branches unless intended.

## Coding Style & Naming Conventions
Use TypeScript with strict mode enabled and 2-space indentation. Follow the existing style in `apps/mobile/src`: double quotes, semicolons, and functional React components. Keep route files lowercase and hyphenated, for example `profile-detail.tsx`. Export utilities and constants with clear camelCase names; reserve PascalCase for React components and types. Use alias imports like `@/constants/theme` instead of deep relative paths. Lint with `npm run lint` before opening a PR.

## Testing Guidelines
There is no committed unit-test runner or coverage gate yet. For now, treat `npm run lint` as the minimum automated check and verify changed flows manually in Expo on at least one platform. When adding tests, place them next to the feature or under `__tests__` and use `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes with short Korean summaries, for example `feat: 채팅/연락처 탭 UI 구현` and `chore: app.json 삭제`. Keep that format: `feat:`, `fix:`, `docs:`, `style:`, `chore:`. PRs should include a concise description, linked issue or task, affected platforms, and screenshots or recordings for UI changes. Call out any required environment variables such as Expo public auth keys.

## Configuration Tips
Do not commit local secrets. Repo-level ignores already cover `.env` and `.env.local`. Avoid editing generated native dependencies such as `ios/Pods` unless the change specifically targets native setup.
