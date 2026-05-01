[中文](./README.md) | **English**

# Happy Eliminate

This is a web-based match-3 game built with Svelte, Vite, and Phaser 3.

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) - For building out-of-game UI and page interactions.
- **Build Tool**: [Vite 8](https://vitejs.dev/) - Provides a lightning-fast local development server and production builds.
- **Game Engine**: [Phaser 3.90](https://phaser.io/) - Handles core game scenes, sprite rendering, and physics/interaction logic.

## 📂 Core Directory Structure

```text
├── public/                 # Public static assets
│   └── game-assets/        # Game assets (backgrounds, tiles, sound effects, etc.)
├── scripts/                # Independent utility and testing scripts
│   └── test-logic.mjs      # Game logic test script
├── src/
│   ├── game/               # Core game system
│   │   ├── assets/         # Phaser asset loading manifest configuration
│   │   ├── audio/          # Game audio control
│   │   ├── phaser/         # Phaser game instance and Scene configurations
│   │   ├── simulation/     # Pure core rules, matching logic, RNG, and state deduction
│   │   └── stores/         # Data communication bridge between Svelte Stores and Phaser
│   ├── lib/                # Reusable Svelte components
│   ├── App.svelte          # Main page entry component
│   └── main.js             # Client mounting entry
```

## 🚀 Getting Started

This project recommends using [pnpm](https://pnpm.io/) as the package manager.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Local Development

Start the development server with Hot Module Replacement (HMR) support:

```bash
pnpm run dev
```

### 3. Test Game Logic

Run standalone scripts to verify the core game matching logic without relying on a browser environment:

```bash
pnpm run test:logic
```

### 4. Production Build

Build the project for production and preview the result locally:

```bash
pnpm run build
pnpm run preview
```

## 🎮 Architecture Philosophy

The project adopts a **Data and View Separation** design philosophy:
- **Logic Layer (`src/game/simulation/`)**: Handles all match detections, falling gravity, and pure game logic, completely decoupled from the rendering engine and UI framework.
- **Rendering Layer (`src/game/phaser/`)**: Focuses on drawing the state of the logic layer vividly with animations.
- **UI Interaction Layer (`src/lib/` & `App.svelte`)**: Utilizes Svelte's reactive `stores` to easily create and render external game UI elements (e.g., scoreboards, settings menus).
