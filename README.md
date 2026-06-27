# Rune of the Day

A React Native app built with Expo that delivers a daily rune from the Elder Futhark set, complete with its symbol, name, meaning, and associated Norse deity. The app also includes a rune list, rune detail view, and interactive flashcards to help users learn about runes.

## Features

- **Daily Rune**: A randomly selected rune displayed each day with its symbol, name, meaning, and associated deity. Reversed meanings are supported with visual rotation.
- **Rune List**: A comprehensive view of all 24 Elder Futhark runes with staggered entrance animations, meanings, and divine associations.
- **Rune Detail**: Full detail view for each rune with translation, primary/additional/reversed meanings, historical context, deities, keywords, magical uses, astrological associations, elements, colors, and correspondences.
- **Flashcards**: Interactive flip-card learning screen with flip animations, prev/next navigation, and progress counter.
- **Theming**: Light, dark, and system-based theme support persisted via AsyncStorage.
- **Navigation**: Expo Router file-based routing with bottom tab navigation.
- **Haptic Feedback**: Platform-safe tactile responses for enhanced user interaction:
  - Success feedback when daily rune loads
  - Medium feedback for card flips
  - Light feedback for navigation and list interactions
  - Graceful fallback on web and unsupported devices
- **Notifications**: Local scheduled daily notification at 6 AM with deep-linking to the Today tab on tap.
- **Privacy-Focused**: Completely offline app with no data collection.

## Privacy Policy

Our privacy policy is hosted on GitHub Pages and can be accessed at:

- Development: `https://raythurman2386.github.io/RuneOfTheDay/privacy.html`
- Production: Replace with your custom domain if applicable

The policy explains our commitment to user privacy, detailing:

- No data collection
- Local storage usage (AsyncStorage for settings and daily rune)
- Device-only storage
- No third-party services

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19.4+ required for Expo SDK 56)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
- npm

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/RuneOfTheDay.git
   cd RuneOfTheDay
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npx expo start
   ```

4. **Run the app**:
   - iOS: Press `i` in the terminal to open in an iOS simulator.
   - Android: Press `a` to open in an Android emulator.
   - Web: Press `w` to run in a browser.

### Project Structure

```
RuneOfTheDay/
├── app/                          # Core source code (Expo Router file-based routing)
│   ├── _layout.tsx               # Root layout: font loading, settings init, notification tap handler
│   ├── +not-found.tsx            # 404 fallback screen
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar configuration with custom haptic-enabled TabButton
│   │   ├── index.tsx             # "Today" tab → MainScreen
│   │   ├── runes.tsx            # "Runes" tab → FlatList of all 24 runes
│   │   └── learn.tsx             # "Learn" tab → FlashcardScreen
│   ├── (modals)/
│   │   └── settings.tsx          # Settings modal: theme, haptics, notifications
│   ├── rune/
│   │   └── [id].tsx              # Dynamic rune detail screen
│   ├── screens/                  # Screen components
│   │   ├── MainScreen.tsx        # Daily rune display
│   │   └── FlashcardScreen.tsx    # Flip-card learning
│   ├── components/               # Reusable UI components
│   │   ├── RuneIcon.tsx          # Rune symbol renderer (ElderFuthark font)
│   │   └── SettingsIcon.tsx      # Settings gear button
│   ├── hooks/                    # Custom React hooks
│   │   ├── useColorTheme.ts      # Theme resolution (system/light/dark)
│   │   ├── useHaptics.ts         # Haptic feedback with settings + platform gating
│   │   ├── useNotifications.ts   # Notification scheduling, permissions, channel setup
│   │   └── useRuneOfTheDay.ts    # Daily rune selection, persistence, refresh logic
│   ├── contexts/
│   │   └── SettingsContext.tsx   # Settings provider (theme + haptics) with AsyncStorage
│   ├── constants/
│   │   └── Colors.ts             # Light/dark color palettes
│   └── data/
│       ├── runes.ts              # Rune TypeScript interface
│       └── runes.json            # Full data for 24 Elder Futhark runes
├── assets/
│   ├── fonts/                    # ElderFuthark rune font (rune.ttf)
│   └── images/                   # App icon, adaptive icon, splash screens, favicon
├── app.json                      # Expo config (plugins, splash screen, permissions)
├── eas.json                      # EAS Build configuration (development/preview/production)
├── package.json                  # Dependencies, scripts, jest config
├── tsconfig.json                 # TypeScript config (strict mode, path aliases)
├── eslint.config.js              # ESLint flat config (expo preset + jest globals)
├── jest.setup.js                 # Test mocks (expo-notifications, AsyncStorage, haptics)
└── ROADMAP.md                    # Development roadmap and progress tracking
```

### Custom Font

The app uses a custom Elder Futhark font (`assets/fonts/rune.ttf`) to render rune symbols. The font is loaded in `app/_layout.tsx` as `ElderFuthark`. Note: the font maps runes to ASCII letters (e.g., "F" renders the Fehu ᚠ glyph), not to Unicode rune codepoints.

### Navigation

Built with Expo Router (file-based routing). The root `Stack` contains:

- `(tabs)` — Bottom tab navigator (Today / Runes / Learn) with a settings gear in the header
- `(modals)/settings` — Settings modal
- `rune/[id]` — Dynamic rune detail screen

### Theming

The app adapts to light, dark, or system color scheme using a custom `useColorTheme` hook, backed by `SettingsContext` with AsyncStorage persistence. Colors are defined in `app/constants/Colors.ts`.

### Notifications

Daily local notifications are scheduled at 6 AM via `expo-notifications`. The notification scheduling, permission management, and Android channel setup are handled in `app/hooks/useNotifications.ts`. Tapping a notification deep-links to the Today tab.

## Development

### Scripts

```bash
npm run start          # Start Expo dev server
npm run android        # Start on Android
npm run ios            # Start on iOS
npm run web            # Start on web
npm test               # Run jest test suite
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript compiler
npm run format         # Run Prettier formatter
npm run build:android:preview   # Build preview APK via EAS
npm run build:android           # Build production AAB via EAS
npm run submit:android           # Submit to Google Play Store
```

### Testing

The project uses Jest with `jest-expo` preset. Test files live in `app/__tests__/` with mirrors of the source structure. Shared mocks are in `app/__mocks__/`.

```bash
npm test              # Run tests
npm test -- --coverage  # Run with coverage report
```

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup, code style,
testing, and PR guidelines.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE)
file for details.
