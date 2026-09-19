# Node 26. Digest-pinned; bump via `docker pull node:26-bookworm-slim` + inspect.
FROM node:26-bookworm-slim@sha256:e89172f5e6154ba212269866bf3fbadbca8eb7901e10c0eccf08f2147bfae505

# The image's stock `node` user (uid 1000) becomes `dev`, the monorepo's dev
# user. Sudo is limited to the two chown calls the bootstrap needs to take
# ownership of the named volumes (Docker creates the mountpoints as root, and
# their contents may carry another UID, see bootstrap.sh).
RUN apt-get update \
 && apt-get install -y --no-install-recommends sudo git ca-certificates gnupg fish make vim curl jq \
 && rm -rf /var/lib/apt/lists/* \
 && usermod -l dev -d /home/dev -m -s /usr/bin/fish node \
 && groupmod -n dev node \
 && printf '%s\n' \
      'dev ALL=(root) NOPASSWD: /usr/bin/chown dev\:dev /workspaces/docs' \
      'dev ALL=(root) NOPASSWD: /usr/bin/chown -R dev\:dev /workspaces/docs/node_modules /home/dev/.claude' \
      > /etc/sudoers.d/dev \
 && chmod 0440 /etc/sudoers.d/dev \
 && visudo -c -f /etc/sudoers.d/dev

# GitHub CLI, latest release at build time, checksum-verified. Auth is GH_TOKEN
# (docker-compose.yml); gh is also git's credential helper, so it is on the
# push path.
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

# Claude Code. Its state lives in CLAUDE_CONFIG_DIR (docker-compose.yml), a
# named volume, so the login survives rebuilds.
RUN npm install -g @anthropic-ai/claude-code

# Named-volume mountpoints, created dev-owned: a fresh volume inherits the
# ownership of the directory it mounts over.
RUN install -d -o dev -g dev /workspaces/docs /home/dev/.claude

# Bootstrap, baked in so it works on an empty workspace volume and can be
# re-run by hand.
COPY bootstrap.sh /usr/local/bin/fastmon-docs-bootstrap
RUN chmod 0755 /usr/local/bin/fastmon-docs-bootstrap

# Compare only mtime+size for change detection. ctime/inode are unstable on the
# virtiofs bind mount and would make git report the whole tree as modified.
RUN git config --system core.checkStat minimal
