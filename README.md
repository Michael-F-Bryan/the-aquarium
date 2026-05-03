# The Aquarium

A browser game where you need to keep your fish alive.

## Getting started (local shell)

- Install: `pnpm install`
- Dev server: `pnpm dev` (open the URL Vite prints; the shell should load with no console errors)
- Production build: `pnpm build` then `pnpm preview` if you want to smoke-test the bundle
- Checks: `pnpm lint` and `pnpm test`

## GitHub Pages (production build)

The **Deploy Pages** workflow (`.github/workflows/deploy.yml`) publishes `dist/` on every push to `main`. A green **deploy** job means GitHub accepted the Pages artifact (see the run summary on GitHub Actions).

The public project URL is normally **`https://michael-f-bryan.github.io/the-aquarium/`**. GitHub may **301** that to a path under your account’s [user Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites) custom domain. If you see a **404** after that redirect, the hostname in the `Location` header (for example `www.michaelfbryan.com`) is not actually serving GitHub Pages for `/the-aquarium/`—often because DNS for that host points at another provider while the `michael-f-bryan.github.io` repository still declares that custom domain in **Settings → Pages**. Align DNS with GitHub’s Pages records, or remove/change that custom domain configuration, then re-run **Deploy Pages**.

Verify the latest **github-pages** deployment with `curl` (requires a token with `repo` scope, e.g. `gh auth login`):

```bash
curl -sS -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $(gh auth token)" \
  "https://api.github.com/repos/Michael-F-Bryan/the-aquarium/deployments?environment=github-pages&per_page=1"
```

## Game Rules

- You start the game with one baby fish (random name and appearance).
- The player needs to feed the fish once per day or else it will lose a health point.
- Each fish starts with 3 health points. When a fish has 0 health points, it will die.
- Feeding is done by clicking in the aquarium. New flakes cannot be dropped too close to an existing flake (anti-spam spacing).
- Fish that have not eaten recently move toward the nearest flake and try to eat it.
- An uneaten piece of food disappears after its configured lifetime (default half a day).
- Each time a fish eats a flake, it replenishes a health point. If it is already at full health, its weight increases by 100g.
- Once a fish weighs at least 300g, each day it has a random chance of reproducing (based on age in days, capped by the reproduce chance slider).
- Babies start at 100g with 3 health. Each baby has a random chance of being a carnivore, set by the **Carnivore chance (per baby)** debug slider (no adult “mutation”).
- Carnivores must eat at least once per simulated day or they lose a health point (same hunger window as normals for calendar checks).
- When a carnivore catches a smaller fish, it gains 10% of the prey’s weight (rounded), a **skeleton** falls to the floor for two simulated days, and the prey is recorded as dead.
- Carnivores move faster than normals. When **not** hungry they wander; when hungry they hunt nearby smaller fish. Normals use **boids** when not hungry; when hungry they prioritize food (no boid flocking layer).
- Dead fish sink to the bottom and remain for the configured linger period (default 10 days).
- Score at each midnight reflects biomass (normals: weight/100; carnivores: weight/100 × age).

## Controls and persistence

- **Pause** (header button or Escape): opens a modal. Simulation and food drops pause while the modal is open.
- **Autosave**: at each new simulated calendar day, the game writes state, merged debug params, and a JPEG **thumbnail** of the tank to `localStorage` (`the-aquarium-autosave-v1`). From the pause menu, **Load autosave** restores that snapshot.
- **New game** (pause menu, with confirmation) resets the tank.

## Development

- **Tests**: `pnpm test` (Vitest, pure TypeScript simulation + ECS).
- **Dev snapshot** (only in `pnpm dev`): Debug panel can **Copy current** / **Load state** JSON using snapshot **schema v3** (`schemaVersion` + `state`, including `skeletons` and per-fish `appearance`).
- **Build**: `pnpm build`
- **Architecture**: see `docs/architecture.md` for the persistent ECS runtime, DTO read model, commands, rendering, and persistence boundaries.

## User Interface

The UI is split into header, left sidebar, central canvas, and right sidebar.

- **Left**: day, biomass, score; debug sliders (day length, food lifetime, reproduce cap, carnivore baby chance, dead linger); dev JSON loader in development builds.
- **Center**: canvas aquarium with floor decorations, food, skeletons, dead and live fish (SVG sprites plus procedural details).
- **Right**: live fish list, selected fish details, dead fish list.
- **Toasts** (bottom-left): short messages for feeding, predation, births, hunger stages, and deaths.
