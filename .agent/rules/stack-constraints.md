---
trigger: always_on
---

# Tech Stack Constraints

## Expo Framework Strictness
- **No Ejecting:** Never suggest workflows that require "ejecting" or changing the `android` or `ios` directories directly unless using Config Plugins.
- **Library Selection:** Always prioritize Expo-managed libraries (e.g., `expo-filesystem`, `expo-image`, `expo-router`) over generic React Native community packages that require native linking.
- **Routing:** Use **Expo Router** (file-based routing in `app/` directory). Do not use `react-navigation` stack navigators manually unless strictly necessary.

## React Native Primitives
- **Styling:** Use `StyleSheet` objects only. No inline styles for layout.
- **Safe Areas:** Always wrap screen content in `SafeAreaView` (from `react-native-safe-area-context`) to handle notches and dynamic islands.
- **Icons:** Use `@expo/vector-icons`. Do not install `react-native-vector-icons`.