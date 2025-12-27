# Event Management App 🎉

This is an **Event Management** mobile application built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/).

## Features

✨ **Tab Navigation** with 4 main screens:
- **Events** - Browse and manage events
- **Explore** - Search and discover events by category
- **Create** - Create new events with photos, location, and details
- **Profile** - User profile with statistics and settings

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Project Structure

This project uses [Expo Router](https://docs.expo.dev/router/introduction/) with file-based routing. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for a detailed overview of the project architecture.

```
app/
├── (tabs)/              # Tab navigation
│   ├── index.tsx       # Events tab
│   ├── explore.tsx     # Explore tab
│   ├── create.tsx      # Create event tab
│   └── profile.tsx     # Profile tab
├── _layout.tsx         # Root layout
```

## Technology Stack

- **React Native** (v0.81.5)
- **Expo SDK** (v54)
- **Expo Router** (v6) - File-based navigation
- **TypeScript** (v5.9)
- **React Navigation** - Tab navigation
- **Ionicons** - Icon library

## Learn More

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Expo Router documentation](https://docs.expo.dev/router/introduction/): Learn about file-based routing.
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the Community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

