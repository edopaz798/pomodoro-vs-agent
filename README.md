# Pomodoro vs Agent · Stack Rush

Race your Cursor agent while you wait. Clear a SameGame-style color grid (**Stack Rush**) before you mark the agent done.

Mobile-first, dark, playful UI. **V1 is fully local** — no backend, state in `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Deploy (Unraid / NPM)

Static site on Unraid behind Nginx Proxy Manager:

- **Demo URL:** `http://stack-rush.local.edopaz.com`
- See **[DEPLOY.md](./DEPLOY.md)** for Dockerfile/compose, rebuild (`git pull` + `docker compose up -d --build`), and NPM proxy fields.

## How to play

1. **Start wait** → pick a pack (Short / Medium / Long) and optional task label → **Go**
2. Both clocks start. Clear groups of **2+ same-color** orthogonally connected tiles.
3. Gravity drops tiles down; empty columns pack left. When no 2+ groups remain, leftover tiles auto-clear and your clock stops — no **I cleared it** tap.
4. Hit **Agent done** when your agent finishes (honor system in V1).
5. First finish wins. Within **1 second** → agent wins. **Exit** mid-race → agent wins (forfeit).
6. **Pause** freezes only your clock.

### Packs

| Pack   | Grid | Colors | Boards |
|--------|------|--------|--------|
| Short  | 5×5  | 3      | 1      |
| Medium | 6×6  | 4      | 1      |
| Long   | 6×6  | 4      | 2      |

Refresh mid-race resumes from `localStorage`.

## V1 notes

- **Agent done** is honor-system — you tap it when the agent actually finishes.
- No accounts, sync, or leaderboards yet.
- Optional later: Unraid / self-hosted backend, PWA install, real agent hooks.

## Stack

Vite + React + TypeScript. No backend for V1.

## License

MIT (or your choice) — hackathon toy.
