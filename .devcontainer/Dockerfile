# Upstream Node 26. Digest-pinned to defend against tag hijacking; bump
# deliberately via `docker pull node:26-bookworm-slim` + inspect.
FROM node:26-bookworm-slim@sha256:e89172f5e6154ba212269866bf3fbadbca8eb7901e10c0eccf08f2147bfae505

RUN apt-get update \
  && apt-get install -y --no-install-recommends sudo git ca-certificates openssh-client gnupg fish make \
  && rm -rf /var/lib/apt/lists/* \
  && chsh -s /usr/bin/fish node \
  && echo 'node ALL=(root) NOPASSWD: /usr/bin/chown node\:node /workspaces/docs/node_modules /home/node/.claude' > /etc/sudoers.d/node \
  && chmod 0440 /etc/sudoers.d/node \
  && visudo -c -f /etc/sudoers.d/node \
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
RUN install -d -m 0700 -o node -g node /home/node/.ssh \
 && printf 'Host github.com\n    HostName github.com\n    User git\n    IdentityFile /home/node/.ssh/id_fastmon_docs\n    IdentitiesOnly yes\n    StrictHostKeyChecking accept-new\n' > /home/node/.ssh/config \
 && chmod 0600 /home/node/.ssh/config \
 && chown node:node /home/node/.ssh/config
