#!/usr/bin/env bash
# Devcontainer bootstrap, baked into the image as fastmon-docs-bootstrap and
# run as postCreateCommand. Idempotent: re-run it any time, it never clobbers an
# existing checkout.
set -euo pipefail

WS=/workspaces/docs
problems=0
err() { echo "✗ $*" >&2; problems=$((problems + 1)); }

# 1. Per-developer prerequisites, from .devcontainer/.env on the host (see
#    .env.example) and the mounted ~/.gitconfig.
[ -n "${GH_TOKEN:-}" ] || err "GH_TOKEN is empty: set it in .devcontainer/.env and rebuild."
[ -n "${GIT_CONFIG_VALUE_0:-}" ] || err "GIT_EMAIL is empty: set it in .devcontainer/.env and rebuild."
git config user.name >/dev/null 2>&1 || err "git user.name is not set in the host ~/.gitconfig."
if [ "$problems" -gt 0 ]; then
  echo "$problems problem(s) above; git push and gh will not work until fixed." >&2
fi

# 2. Own the named volumes. Docker creates the mountpoints as root, and the
#    contents may belong to another UID: some editors remap dev to the host UID
#    on macOS (Zed does, the bare devcontainer CLI does not), so the same volume
#    is written as 501 one day and 1000 the next. Both argument lists must match
#    the sudoers entries in the Dockerfile exactly. `|| true` for mount mode,
#    where $WS is a bind mount and chown may fail.
sudo chown dev:dev "$WS" || true
sudo chown -R dev:dev "$WS/node_modules" /home/dev/.claude

# 3. Clone mode: fill the empty workspace volume. init+fetch instead of clone
#    because the node_modules sub-volume makes the directory non-empty.
if [ ! -d "$WS/.git" ]; then
  [ -n "${GH_TOKEN:-}" ] || { echo "Cannot fetch without GH_TOKEN." >&2; exit 1; }
  cd "$WS"
  git init -q -b main
  git remote add origin https://github.com/fastmon-dev/docs.git
  git fetch --tags origin
  git checkout -f -B main origin/main
fi

# 4. Dependencies.
cd "$WS"
npm ci

echo "fastmon-docs devcontainer bootstrap complete."
echo "Start the dev server with: npm run dev -- --hostname 0.0.0.0"
