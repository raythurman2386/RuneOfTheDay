# Contributing to Rune of the Day

Thank you for your interest in contributing! This is a small, offline-first
app, and we welcome contributions of all kinds — bug reports, feature ideas,
code, documentation, and design feedback.

## Code of Conduct

Be kind and respectful. Harassment or discrimination of any kind will not be
tolerated. We're building a community around a shared interest in runes and
thoughtful app design.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20.19.4+ (required for Expo SDK 56)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
- An Android emulator or physical device for testing

### Setup

1. **Fork and clone the repository**:

   ```bash
   git clone https://github.com/your-username/RuneOfTheDay.git
   cd RuneOfTheDay
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This also installs Husky git hooks automatically via the `prepare` script.

3. **Copy the environment template**:

   ```bash
   cp .env.example .env
   ```

   Fill in the values if you plan to build for distribution. For local
   development, the defaults are fine.

4. **Start the dev server**:

   ```bash
   npx expo start
   ```

5. **Run tests** to make sure everything is working:

   ```bash
   npm test
   ```

## Development Workflow

### Before You Commit

Pre-commit hooks run automatically via Husky + lint-staged:

- **Prettier** formats all staged files
- **ESLint** lints and auto-fixes staged `.ts`/`.tsx`/`.js`/`.jsx` files

You can also run these manually:

```bash
npm run format    # Prettier --write .
npm run lint      # ESLint
npm run typecheck # TypeScript --noEmit
npm test          # Jest
```

### Code Style

- **Prettier** handles all formatting — don't fight it.
- Use **named exports** for utilities and hooks; **default exports** for
  screen components (Expo Router convention).
- Prefer **`StyleSheet.create`** over inline styles.
- Use the **shared animation constants** from `app/constants/animations.ts`
  for any new animations.
- Use the **`Colors` palette** from `app/constants/Colors.ts` — never
  hardcode hex values in components.
- Add **`testID`** props to interactive elements for testability.
- Write **tests** for new logic — aim to maintain or improve coverage.

### Project Structure

```
app/
├── (tabs)/          # Bottom tab navigator screens
├── (modals)/        # Modal screens (settings)
├── components/      # Reusable UI components
├── constants/       # Colors, animation constants
├── contexts/        # React context providers
├── data/            # Rune data (runes.json, runes.ts)
├── hooks/           # Custom hooks
├── screens/         # Screen components
├── utils/           # Utility functions
└── widgets/         # Android home screen widget
```

### Testing

We use **Jest** with **@testing-library/react-native**. Tests live in
`app/__tests__/` mirroring the source structure.

- Run tests: `npm test`
- Run with coverage: `npm run test:coverage`
- Run a single file: `npx jest path/to/test.test.tsx`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add rune history screen
fix: notification fires on wrong day
test: expand flashcard coverage
docs: update privacy policy
refactor: extract shared Card component
chore: bump dependencies
```

## Pull Requests

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes, keeping commits focused and well-described.

3. Ensure all checks pass:

   ```bash
   npm run format:check
   npm run lint
   npm run typecheck
   npm test
   ```

4. Push and open a PR against `main`. Fill in the PR template.

5. Respond to review feedback promptly.

### PR Tips

- Keep PRs small and focused — one feature or fix per PR.
- Include screenshots for UI changes.
- Add or update tests for new behavior.
- Update the `CHANGELOG.md` under the `[Unreleased]` section.

## Reporting Issues

Use the [GitHub issue templates](https://github.com/raythurman2386/RuneOfTheDay/issues/new/choose)
for bug reports, feature requests, and questions. Include as much detail as
possible — device, OS version, steps to reproduce, and expected vs. actual
behavior.

## Security Vulnerabilities

See [SECURITY.md](./SECURITY.md) for the vulnerability reporting process.
**Do not open public issues for security vulnerabilities.**

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](./LICENSE).
