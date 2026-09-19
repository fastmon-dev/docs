# Docs Dev Container

Compose-based dev environment for the fastmon docs site (Next.js). The API
reference is generated from the sibling backend and frontend checkouts, so both
are mounted read-write.

## Setup

1. Copy the per-developer env file and fill it in:

   ```sh
   cp .devcontainer/.env.example .devcontainer/.env
   ```

   `GH_TOKEN` is a fine-grained PAT on the `fastmon-dev` repos you work on
   (Contents, Pull requests, Issues read/write). It authenticates `gh` and,
   via `gh auth git-credential`, git itself. Every `git@github.com:` remote is
   rewritten to HTTPS inside the container. `GIT_EMAIL` is your commit email.

2. Make sure the host `~/.gitconfig` has `user.name`; it is bind-mounted
   read-only. Commits made in the container are not signed.

3. Check out `backend` and `frontend` next to `docs`.

Then open the folder in a dev-container-capable editor and reopen in the
container. The bootstrap runs via `postCreateCommand` and reports anything
missing from the steps above. If your editor skips lifecycle hooks, run it
yourself:

```sh
fastmon-docs-bootstrap              # npm ci; idempotent
npm run dev -- --hostname 0.0.0.0   # Next.js on :3000, forwarded to the host
```

## Workspace mode

One knob in `devcontainer.json`:

- **Mount mode (default)**: `["docker-compose.yml", "docker-compose.mount.yml"]`
  binds the host checkout, edits land on the host. `core.checkStat=minimal` in
  the image keeps git from flagging the whole tree on virtiofs.
- **Clone mode**: `["docker-compose.yml"]` puts the workspace on a named volume
  that the bootstrap fills with `git init` + `fetch`.

`node_modules` lives on a named volume in both modes.

## Persistent state

Everything that should survive a rebuild but does not belong in the repo is on
a named volume: the workspace (clone mode), `node_modules`, and the Claude Code
store (`CLAUDE_CONFIG_DIR=/home/dev/.claude`, separate from the host's
`~/.claude`). Nothing lives outside the repo on the host except the mounted git
identity.

Claude Code runs without permission prompts inside the container and may edit
the sibling repos. Those defaults are `claude-settings.json`, which the bootstrap
merges into the user-level `settings.json` on that volume (existing keys win,
so model, theme and plugins you set there stay).

## Troubleshooting

- **Bootstrap reports a missing token or email**: fix `.devcontainer/.env`,
  then rebuild (Compose reads `.env` at container start).
- **git asks for a username or 403s on push**: token missing, expired or without
  Contents write on that repo. `gh auth status` tells which.
- **Clean rebuild**: `docker compose -f .devcontainer/docker-compose.yml down -v`
  discards all volumes: uncommitted clone-mode work, `node_modules`, and the
  Claude Code login.
