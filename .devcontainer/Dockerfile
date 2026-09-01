# Upstream Node 26. Digest-pinned to defend against tag hijacking; bump
# deliberately via `docker pull node:26-bookworm-slim` + inspect.
FROM node:26-bookworm-slim@sha256:e89172f5e6154ba212269866bf3fbadbca8eb7901e10c0eccf08f2147bfae505

RUN apt-get update \
  && apt-get install -y --no-install-recommends sudo git ca-certificates openssh-client gnupg fish make vim curl \
  && rm -rf /var/lib/apt/lists/* \
  # Rename the image's stock `node` user/group (uid/gid 1000) to `dev` so the
  # whole monorepo shares one dev-user name (matches backend) — Einheitlichkeit.
  # -m moves /home/node → /home/dev; -s sets fish as the login shell.
  && usermod -l dev -d /home/dev -m -s /usr/bin/fish node \
  && groupmod -n dev node \
  && echo 'dev ALL=(root) NOPASSWD: /usr/bin/chown dev\:dev /workspaces/docs /workspaces/docs/node_modules /home/dev/.claude' > /etc/sudoers.d/dev \
  && chmod 0440 /etc/sudoers.d/dev \
  && visudo -c -f /etc/sudoers.d/dev \
  && npm install -g @anthropic-ai/claude-code

# GitHub CLI (gh): always the latest release at build time (resolved via the
# /releases/latest redirect, no API call, no rate limit), verified against the
# release's checksums file. A rebuild picks up whatever is current. Auth comes
# from the GH_TOKEN environment variable (see devcontainer.json).
# TARGETARCH is set by BuildKit.
ARG TARGETARCH
RUN set -eu; \
    case "$TARGETARCH" in \
      amd64) arch=amd64 ;; \
      arm64) arch=arm64 ;; \
      *) echo "unsupported TARGETARCH: $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    ver="$(curl -fsSLI -o /dev/null -w '%{url_effective}' https://github.com/cli/cli/releases/latest)"; \
    ver="${ver##*/v}"; \
    base="https://github.com/cli/cli/releases/download/v${ver}"; \
    tmp="$(mktemp -d)"; cd "$tmp"; \
    curl -fsSLO "${base}/gh_${ver}_linux_${arch}.tar.gz"; \
    curl -fsSLO "${base}/gh_${ver}_checksums.txt"; \
    sha256sum --check --ignore-missing "gh_${ver}_checksums.txt"; \
    tar -xzf "gh_${ver}_linux_${arch}.tar.gz"; \
    install -m 0755 "gh_${ver}_linux_${arch}/bin/gh" /usr/local/bin/gh; \
    cd /; rm -rf "$tmp"; \
    gh --version

# SSH config: container-local (not mounted from host) so we explicitly limit
# which identities ssh offers. `IdentitiesOnly yes` + only the per-repo deploy
# key means git push/pull can't accidentally pick up another mounted key —
# the signing key stays invisible to the ssh auth flow.
#
# `StrictHostKeyChecking accept-new` silently trusts github.com's host key on
# first contact, then rejects subsequent changes — so GitHub's periodic key
# rotations don't require manual intervention, but a MITM with a different
# key after first contact still fails. known_hosts lives on the image's
# writable layer (not bind-mounted) so ssh-keygen-style atomic rewrites don't
# trip on cross-device link() errors.
RUN install -d -m 0700 -o dev -g dev /home/dev/.ssh \
 && printf 'Host github.com\n    HostName github.com\n    User git\n    IdentityFile /home/dev/.ssh/id_fastmon_docs\n    IdentitiesOnly yes\n    StrictHostKeyChecking accept-new\n' > /home/dev/.ssh/config \
 && chmod 0600 /home/dev/.ssh/config \
 && chown dev:dev /home/dev/.ssh/config

# The workspace lives on a named volume (see devcontainer.json workspaceMount),
# not a virtiofs bind mount — this avoids the OrbStack rename-atomicity race that
# makes Zed's git panel flash "all files changed" and risks empty-tree commits.
# A fresh named volume inherits ownership from the image directory it mounts
# over, so create that directory dev-owned here; otherwise the empty volume
# mounts as root and the postCreateCommand bootstrap clone (run as dev) can't
# write to it.
RUN mkdir -p /workspaces/docs && chown dev:dev /workspaces/docs

# Git change detection: compare only mtime+size (core.checkStat=minimal). The
# default also compares ctime/ino/dev/uid/gid, which are unstable across the
# OrbStack/virtiofs bind mount — git then reports the whole tree as modified
# ("all files changed") on every stat, the Zed git-panel flash. This defuses the
# rename race, making the host bind mount safe as the default workspace again.
# System scope so it applies regardless of workspace mode; set as root (writing
# /etc/gitconfig needs root).
RUN git config --system core.checkStat minimal
