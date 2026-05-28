# PokeHub

A modern Pokémon companion app built with React + Vite. Browse the Pokédex, explore detailed Pokémon info, build teams, analyze type matchups, and try mini tools like a battle simulator and “Who’s That Pokémon?” quiz.

## Features

- **Pokédex**: Browse and search Pokémon with a smooth, responsive UI.
- **Pokémon details**: Types, stats, abilities, sprites, evolution chain, and more.
- **Daily Spotlight**: A daily Pokémon highlight.
- **Who’s That Pokémon?**: Quick quiz mini-game.
- **Team Builder**: Create a team and analyze coverage/weaknesses.
- **Battle Simulator**: Simple damage simulation with type effectiveness + STAB.
- **Weakness Calculator**: Defensive matchups (weak/resist/immune) by type(s).
- **Cries Player**: Listen to Pokémon cries (when available).
- **Size Compare**: Compare Pokémon size/weight.
- **Completion Tracker**: Track progress locally.

## Tech stack

- **React 19** + **React Router**
- **Vite** (dev server + build)
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Axios** (API requests)
- **Chart.js** / **react-chartjs-2** (charts)
- **html2canvas** (share/export helpers)

## Data source

This project uses **PokéAPI** (`https://pokeapi.co/`) as the primary data source.

## Getting started

### Prerequisites

- **Node.js** (recommended: latest LTS)
- **npm**

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project structure (high level)

- `src/components/`: UI + feature pages (Pokédex, battle, team builder, etc.)
- `src/routes/CustomRoutes.jsx`: App routes + lazy loading
- `src/utils/`: PokéAPI helpers, constants, type effectiveness logic
- `src/hooks/`: Reusable hooks (debounce, Pokémon list fetching)

## Notes

- **No environment variables required** (PokéAPI is public).
- If you ever see a React runtime error about “incompatible React versions”, make sure `react` and `react-dom` are pinned to the **same exact version**.
