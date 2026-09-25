# Deploy Stack Rush on Unraid

Static Vite + React + TS SPA served by `nginx:alpine` behind Nginx Proxy Manager (NPM).

**Demo URL:** `http://stack-rush.local.edopaz.com`

## Layout on Unraid

| Item | Path / value |
|------|----------------|
| Compose stack | `/mnt/user/appdata/stack-rush/` |
| Container | `stack-rush-web` |
| Internal network | `internal` (NPM external network; override with `NPM_INTERNAL_NETWORK`) |
| Optional host port | `43180` → container `80` (`STACK_RUSH_PORT`) |

## First-time deploy

```bash
# On Unraid (or via SSH from Paz)
mkdir -p /mnt/user/appdata/stack-rush
cd /mnt/user/appdata/stack-rush

# Clone (or copy compose + Dockerfile + nginx.conf + source)
git clone https://github.com/edopaz798/pomodoro-vs-agent.git .

# Confirm NPM network name
docker network ls | grep -E 'internal|proxy'

# Build & start (attaches to external `internal` network)
docker compose up -d --build
```

Confirm container is on the proxy network:

```bash
docker inspect stack-rush-web --format '{{json .NetworkSettings.Networks}}'
# expect key "internal" (or your NPM_INTERNAL_NETWORK name)
```

## Rebuild after code changes

Assets are baked into the image at build time (`dist/` from `npm run build`).

```bash
cd /mnt/user/appdata/stack-rush
git pull
docker compose up -d --build
```

Equivalent local rebuild path (if you prefer building on Paz then copying):

```bash
git pull && npm ci && npm run build
# then either:
#   docker compose up -d --build   # multi-stage Dockerfile rebuilds dist
# or copy dist/ into a volume/image if you change the compose to mount it
```

How assets get into the container: the **multi-stage Dockerfile** runs `npm ci` + `npm run build` in a `node:22-alpine` stage, then copies `/app/dist` into `nginx:alpine` at `/usr/share/nginx/html`. No volume mount of `dist/` is required.

## NPM Proxy Host (create if missing)

| Field | Value |
|-------|--------|
| Domain Names | `stack-rush.local.edopaz.com` |
| Scheme | `http` |
| Forward Hostname / IP | `stack-rush-web` |
| Forward Port | `80` |
| Cache Assets | optional |
| Block Common Exploits | optional |
| Websockets Support | off (static SPA) |
| SSL | off or same as other `*.local.edopaz.com` hosts |
| Access List | same as live-paper-desk / cuentos (LAN / AdGuard) |

AdGuard (or local DNS) should already resolve `*.local.edopaz.com` to the Unraid / NPM host. If DNS is not ready yet, smoke with:

```bash
curl -sI --resolve stack-rush.local.edopaz.com:80:192.168.50.15 http://stack-rush.local.edopaz.com/
# or via container directly:
curl -sI http://127.0.0.1:43180/
docker exec stack-rush-web wget -qO- http://127.0.0.1/ | head
```

Expect **HTTP 200** and HTML that loads the idle Stack Rush screen.

## Do not touch

Do **not** restart or modify other stacks (`live-paper-desk`, `paper-engine`, `signal-diff`, `cuentos-noche`, etc.). Only create/update the `stack-rush` compose project.
