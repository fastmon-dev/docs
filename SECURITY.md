# Security

This repository contains the source of the fastmon documentation site
(docs.fastmon.eu). It is a static site with no user data, accounts, or backend
of its own.

## Reporting a vulnerability

Please do not open a public issue for security reports.

- Vulnerabilities in the fastmon product (dashboard, API, tracker, collector):
  email support@fastmon.eu with "Security" in the subject.
- Problems in this docs site (for example a dependency advisory that affects
  the built output, or an XSS in a page component): use GitHub's private
  vulnerability reporting on this repository, or the same email address.

We confirm receipt within three working days.

## What this repository does automatically

- `npm audit --audit-level=high` and Google's OSV-Scanner run on every pull
  request and weekly (`.github/workflows/security.yml`).
- Dependabot keeps npm packages, the devcontainer image, and GitHub Actions up
  to date (`.github/dependabot.yml`).
- All workflows, including the deploy, run on GitHub-hosted runners. No
  self-hosted runner is attached to this repository.
