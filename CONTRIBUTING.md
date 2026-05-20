# Contributing to git-hubby-helm

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- [Helm](https://helm.sh/) 3+
- [helm-unittest](https://github.com/helm-unittest/helm-unittest) plugin — for running chart unit tests
- [helm-values-schema-json](https://github.com/losisin/helm-values-schema-json) plugin — for generating the schema
- [Node.js](https://nodejs.org/) (see `.node-version`) — only needed for commit linting locally and pre commit hooks
- [mise](https://mise.jdx.dev/) — manages tool versions automatically

### Installation

If you install `mise` first you can just run `mise install` and `mise run setup-helm-plugins` and everything will install for you 🙂.

## Development Workflow

1. **Fork & clone** this repository.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/my-change
   ```
3. **Make your changes** to templates, values, CRDs, etc.
4. **Lint the chart** locally:
   ```bash
   helm lint .
   ```
5. **Run unit tests**:
   ```bash
   helm unittest .
   ```
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add support for ingress resource"
   ```
7. **Push** and open a Pull Request against `main`.

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by [commitlint](https://commitlint.js.org/). Every commit message must follow:

```
<type>(<optional scope>): <description>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Testing

This project uses [helm-unittest](https://github.com/helm-unittest/helm-unittest) for unit testing Helm templates. Tests live in the `tests/` directory with the suffix `_test.yaml`.

### Running tests

```bash
# Install the needed helm plugins (one-time)
mise run setup-helm-plugins

# Run all unit tests
helm unittest .

# Lint the chart
helm lint .

# Generate the schema
helm schema

# Render templates locally for inspection
helm template .
```

### Writing tests

- Place test files in `tests/` with suffix `_test.yaml`
- Each test file should specify the `templates` it covers under `templates:`
- Use a fixed `release` name/namespace for deterministic assertions
- See existing test files for examples and the [helm-unittest docs](https://github.com/helm-unittest/helm-unittest/blob/main/DOCUMENT.md) for the full assertion API

### CI

Unit tests and chart linting run automatically on every push to `main` and on pull requests.

## Releases

Releases are fully automated via [semantic-release](https://semantic-release.gitbook.io/). When your PR is merged to `main`, a new version is published automatically if your commits contain releasable changes (`feat` = minor, `fix` = patch, `BREAKING CHANGE` = major).

## Code of Conduct

Please be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
