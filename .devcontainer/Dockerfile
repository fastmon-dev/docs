# Upstream Node 26. Digest-pinned to defend against tag hijacking; bump
# deliberately via `docker pull node:26-bookworm-slim` + inspect.
FROM node:26-bookworm-slim@sha256:e89172f5e6154ba212269866bf3fbadbca8eb7901e10c0eccf08f2147bfae505

RUN apt-get update \
  && apt-get install -y --no-install-recommends sudo git ca-certificates openssh-client gnupg fish make vim \
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
