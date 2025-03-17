# Rune of the Day

A React Native app built with Expo that delivers a daily rune from the Elder Futhark set, complete with its symbol, name, and meaning. The app also includes features like a rune list and interactive flashcards to help users learn about runes.

## Features

- **Daily Rune**: A randomly selected rune displayed each day with its symbol, name, and meaning.
- **Rune List**: A comprehensive view of all 24 Elder Futhark runes.
- **Flashcards**: Interactive flashcards with flip animations for learning rune meanings.
- **Theming**: Light and dark mode support based on the user’s system preferences.
- **Navigation**: Bottom tab navigation for seamless access to app sections.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/rune-of-the-day.git
   cd rune-of-the-day
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Start the development server**:

   ```bash
   expo start
   ```

4. **Run the app**:
   - iOS: Press `i` in the terminal to open in an iOS simulator.
   - Android: Press `a` to open in an Android emulator.
   - Web: Press `w` to run in a browser.

### Project Structure

- `assets/`: Static assets like custom fonts.
- `app/`: Core source code.
  - `components/`: Reusable UI components.
  - `data/`: Rune data (symbols, names, meanings).
  - `hooks/`: Custom React hooks.
  - `screens/`: Screen components for each tab.
- `index.tsx`: Main app entry point.

### Custom Font

The app uses a custom font to render rune symbols. Ensure the font file is in `assets/fonts/` and properly loaded in `App.tsx`.

### Navigation

Built with `@react-navigation/native` and a bottom tab navigator for switching between the Daily Rune, Rune List, and Flashcard screens.

### Theming

The app adapts to light and dark modes using a custom `useTheme` hook tied to the system’s color scheme.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Submit a pull request.

## License

Licensed under the MIT License.
