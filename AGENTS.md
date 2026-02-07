# Repository Guidelines

## Project Structure & Module Organization
This is a Bun workspace monorepo:
- `packages/react-native-device-activity`: published library code (`src/`, `ios/`, `targets/`, `config-plugin/`).
- `apps/example`: Expo example app used for integration and iOS XCTest coverage (`ios/Tests`).
- `scripts/`: maintenance scripts (for example dependency/version sync).
- `.github/workflows/`: CI for linting, type-checking, Expo checks, SwiftLint, and iOS tests.

Keep shared logic in `packages/react-native-device-activity/src` and validate behavior through the example app when native code changes.

## Build, Test, and Development Commands
- `bun install`: install all workspace dependencies.
- `bun lint`: run ESLint at repo scope.
- `bun typecheck`: type-check package and example app.
- `bun run pre-push`: local gate used by Husky (`typecheck`, `lint`, strict SwiftLint).
- `cd packages/react-native-device-activity && bun run build`: build distributable output.
- `cd packages/react-native-device-activity && bun run test`: run JS tests via `expo-module test`.
- `cd apps/example && bun run ios` (or `android` / `start`): run the example app.
- `cd apps/example && bun run prebuild`: validate config-plugin prebuild behavior for iOS.

## Coding Style & Naming Conventions
- Use 2-space indentation for JS/TS/TSX/Swift (see `.editorconfig`).
- Follow ESLint config in `.eslintrc.js` (`universe/native` + `universe/web`).
- Swift formatting/linting is enforced by `.husky/pre-commit` (`swift format` + SwiftLint fix).
- Naming: `PascalCase` for React components/types, `camelCase` for variables/functions, `*.test.ts` for TS tests, `*Tests.swift` for XCTest files.

## Testing Guidelines
- Keep unit tests near source in `packages/react-native-device-activity/src`.
- Add or update XCTest cases in `apps/example/ios/Tests` for native Swift behavior.
- Run relevant checks locally before opening a PR: `bun run pre-push` and package/example-specific commands above.
- No explicit coverage threshold is configured; prioritize meaningful assertions for API behavior and regressions.

## Commit & Pull Request Guidelines
- Follow existing commit style: concise, imperative messages with conventional prefixes when applicable (`feat:`, `fix:`, `chore:`).
- Reference issues/PRs when relevant (for example `fix: handle observer crash (#83)`).
- PRs should include: change summary, risk/impact notes, and screenshots or logs for UI/native behavior changes.
- Ensure GitHub Actions pass (`Test` workflow); PR preview publishing is handled automatically by `pkg-pr-new`.
