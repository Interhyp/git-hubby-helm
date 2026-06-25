[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/git-hubby)](https://artifacthub.io/packages/search?repo=git-hubby)

# git-hubby Helm Chart

A Helm chart for the [git-hubby](https://github.com/Interhyp/git-hubby) Kubernetes operator, managing GitHub resources (organizations, repositories, teams, and security configurations) declaratively via Custom Resource Definitions (CRDs).

## Overview

This chart deploys the **git-hubby** controller manager, a Kubernetes operator that reconciles GitHub resources based on custom resources in your cluster. It manages:

- **Organizations** — GitHub org settings, Actions permissions, custom properties, code security configurations, and rulesets
- **Repositories** — Repository settings, merge strategies, deploy keys, webhooks, autolinks, rulesets, custom properties, and code security
- **Teams** — Team membership via IDP group sync or manual member lists, organization roles
- **CodeSecurityConfigurations** — GitHub Advanced Security features (code scanning, secret scanning, Dependabot, etc.)
- **RulesetPresets** — Reusable branch/tag protection rulesets
- **WebhookPresets** — Reusable webhook configurations
- **WebhookIgnorePresets** — URL patterns for webhooks to exclude
- **AutolinksPresets** — Reusable autolink reference configurations

## Prerequisites

- Kubernetes 1.19+
- Helm 3+
- [cert-manager](https://cert-manager.io/) installed in the cluster (for webhook and metrics TLS certificates)
- A GitHub App installation with appropriate permissions

## Installation

```bash
helm install git-hubby oci://ghcr.io/interhyp/git-hubby-helm/git-hubby \
  --version <version> \
  -n <namespace> --create-namespace \
  -f my-values.yaml
```

## Custom Resource Definitions (CRDs)

CRDs are located in `chart/crds/` and are installed automatically. The API group is `github.interhyp.de` with version `v1alpha1`.

| CRD | Description |
|-----|-------------|
| `Organization` | Manages a GitHub organization's settings, Actions config, custom properties, code security, and rulesets |
| `Repository` | Manages a GitHub repository's settings, visibility, merge strategies, webhooks, deploy keys, rulesets, and custom properties |
| `Team` | Manages a GitHub team's membership (IDP sync or manual), organization roles |
| `CodeSecurityConfiguration` | Defines GitHub Advanced Security feature settings (code scanning, secret scanning, Dependabot, etc.) |
| `RulesetPreset` | Defines reusable repository/branch rulesets (protection rules, required checks, etc.) |
| `WebhookPreset` | Defines reusable webhook configurations |
| `WebhookIgnorePreset` | Defines URL regex patterns to exclude from webhook creation |
| `AutolinksPreset` | Defines reusable autolink reference configurations |

## Configuration Parameters

### Controller Manager

| Parameter | Description | Default |
|-----------|-------------|---------|
| `controllerManager.replicas` | Number of controller manager replicas | `1` |
| `controllerManager.podLabels` | Additional labels for controller manager pods | `{}` |
| `controllerManager.nodeSelector` | Node selector for pod scheduling | `{}` |
| `controllerManager.tolerations` | Tolerations for pod scheduling | `[]` |
| `controllerManager.topologySpreadConstraints` | Topology spread constraints for pod distribution (`labelSelector` auto-injected) | soft spread across nodes |
| `controllerManager.podSecurityContext.runAsNonRoot` | Run pods as non-root user | `true` |
| `controllerManager.podSecurityContext.seccompProfile.type` | Seccomp profile type | `RuntimeDefault` |

### Manager Container

| Parameter | Description | Default |
|-----------|-------------|---------|
| `controllerManager.manager.image.repository` | Controller container image repository | `ghcr.io/interhyp/git-hubby` |
| `controllerManager.manager.image.tag` | Controller container image tag (defaults to chart `appVersion` if empty) | `""` |
| `controllerManager.manager.args` | Command-line arguments for the manager | See values.yaml |
| `controllerManager.manager.resources.limits.cpu` | CPU resource limit | `500m` |
| `controllerManager.manager.resources.limits.memory` | Memory resource limit | `128Mi` |
| `controllerManager.manager.resources.requests.cpu` | CPU resource request | `10m` |
| `controllerManager.manager.resources.requests.memory` | Memory resource request | `64Mi` |
| `controllerManager.manager.containerSecurityContext.allowPrivilegeEscalation` | Disallow privilege escalation | `false` |
| `controllerManager.manager.containerSecurityContext.capabilities.drop` | Linux capabilities to drop | `["ALL"]` |
| `controllerManager.manager.containerSecurityContext.readOnlyRootFilesystem` | Mount root filesystem as read-only | `true` |

### Environment Variables

| Parameter | Description | Default |
|-----------|-------------|---------|
| `envs` | Key-value map of environment variables injected into the manager container via a ConfigMap | `{}` |

| Variable | Description | Possible Values | Default |
|----------|-------------|-----------------|---------|
| `ENABLE_WEBHOOKS` | Enables or disables Kubernetes admission webhooks for validating `Organization` and `Repository` resources on create/update. | `"true"`, `"false"` | `"true"` (enabled unless explicitly set to `"false"`) |
| `GITHUB_MEMBER_SUFFIX` | A suffix appended to each team member username before matching/adding them on GitHub. Useful when GitHub usernames follow a naming convention (e.g. enterprise suffix). | Any string (e.g. `"_company-name"`, `""`) | `""` (no suffix) |
| `REPOSITORY_FINALIZER_MODE` | Controls what happens to a GitHub repository when its `Repository` CR is deleted from Kubernetes. | `"ignore"` (no action), `"archive"` (archive the repo), `"delete"` (delete the repo) | `"ignore"` |
| `ENABLE_STARTUP_SPREADING` | Enables startup spreading, which distributes reconciliation requests over time after a controller restart to avoid GitHub API rate limit spikes. | `"true"`, `"false"` | `"true"` |
| `SPREAD_INTERVAL_MINUTES` | Length (in minutes) of the interval over which delayed reconciliations are randomly distributed. Delayed reconciliations are scheduled between `(startup + SpreadPeriod)` and `(startup + SpreadPeriod + SpreadInterval)`. This value also serves as the requeue interval after a successful reconciliation. | Any positive integer | `180` |
| `STARTUP_SPREAD_PERIOD_MINUTES` | Duration (in minutes) after pod startup during which unchanged, healthy resources are delayed instead of reconciled immediately. Reconciliations for changed or unhealthy resources are never delayed. | Any positive integer | `5` |
| `LOG_LEVEL` | Sets the minimum log level. Overrides the `--zap-log-level` CLI flag. **Note:** `warn` is not supported due to limitations of the [logr](https://github.com/go-logr/logr) API used by controller-runtime — logr only provides `Info` (with verbosity levels) and `Error`; there is no distinct warn level. Use `info` to see all informational and warning-prefixed messages, or `error` to suppress them. | `"debug"`, `"info"`, `"error"` | `"info"` |

### Service Account

| Parameter | Description | Default |
|-----------|-------------|---------|
| `serviceAccount.create` | Create a ServiceAccount | `true` |
| `serviceAccount.name` | ServiceAccount name (defaults to fullname) | `""` |
| `serviceAccount.annotations` | Annotations for the ServiceAccount | `{}` |
| `serviceAccount.secrets` | Secrets to attach to the ServiceAccount | `[]` |
| `serviceAccount.automount` | Automount the ServiceAccount token | `true` |

### Metrics Service

| Parameter | Description | Default |
|-----------|-------------|---------|
| `metricsService.type` | Service type for the metrics endpoint | `ClusterIP` |
| `metricsService.ports[0].name` | Port name | `https` |
| `metricsService.ports[0].port` | Service port | `8443` |
| `metricsService.ports[0].targetPort` | Container target port | `8443` |
| `metricsService.ports[0].protocol` | Protocol | `TCP` |

### Webhooks

| Parameter | Description | Default |
|-----------|-------------|---------|
| `webhooks.enabled` | Enable or disable all Kubernetes admission webhook resources (ValidatingWebhookConfiguration, webhook Service, TLS Certificate, Issuer, and NetworkPolicy). Also sets the `ENABLE_WEBHOOKS` env var on the controller. | `true` |
| `webhookService.type` | Service type for the webhook endpoint | `ClusterIP` |

### TLS Certificates (cert-manager)

The chart creates a self-signed cert-manager `Issuer` and two `Certificate` resources automatically:

- **Serving certificate** — TLS for the webhook endpoint (stored in Secret `webhook-server-certificate`)
- **Metrics certificate** — TLS for the metrics endpoint (stored in Secret `metrics-server-cert`)

Both certificates use the built-in self-signed issuer deployed by the chart. No external issuer is required. These resources are not configurable via `values.yaml`.

### Other

| Parameter | Description | Default |
|-----------|-------------|---------|
| `kubernetesClusterDomain` | Kubernetes cluster domain suffix | `cluster.local` |
| `nameOverride` | Override the chart name | `""` |
| `fullnameOverride` | Override the full release name | `""` |

## Testing

This chart uses [helm-unittest](https://github.com/helm-unittest/helm-unittest) for unit testing. Tests are located in the `tests/` directory.

### Running tests locally

```bash
# Install the helm-unittest plugin (one-time)
helm plugin install https://github.com/helm-unittest/helm-unittest.git

# Run all tests
helm unittest .
```

Tests are also executed automatically in CI on every push to `main` and on pull requests.

## Architecture

The chart deploys:

1. **Deployment** — The controller manager pod running `/manager` with webhook and health probe endpoints
2. **Services** — A metrics service (port 8443) and a webhook service (port 443 → 9443)
3. **RBAC** — ClusterRoles and bindings for the manager, leader election, metrics auth, and per-CRD admin/editor/viewer roles
4. **Certificates** — A self-signed Issuer, a serving certificate for the webhook endpoint, and a metrics certificate (all via cert-manager)
5. **ValidatingWebhookConfiguration** — Admission webhooks validating `Organization` and `Repository` resources on CREATE/UPDATE
6. **NetworkPolicy** — Allows webhook traffic from `kube-system` namespace to the controller on port 9443
7. **ServiceMonitor** — Prometheus ServiceMonitor for scraping `/metrics` from the controller
8. **CRDs** — All custom resource definitions in `crds/`

## RBAC Roles

The chart creates the following ClusterRoles for each CRD (`organization`, `repository`, `team`, `codesecurityconfiguration`, `rulesetpreset`, `webhookpreset`, `webhookignorepreset`, `autolinkspreset`):

| Role | Permissions |
|------|-------------|
| `*-admin-role` | Full access (`*`) to the resource and `get` on status |
| `*-editor-role` | `create`, `delete`, `get`, `list`, `patch`, `update`, `watch` and `get` on status |
| `*-viewer-role` | `get`, `list`, `watch` and `get` on status |

Additionally:
- `*-manager-role` — Full operator permissions for all CRDs and secrets
- `*-leader-election-role` — ConfigMaps, Leases, and Events for leader election
- `*-metrics-auth-role` — TokenReviews and SubjectAccessReviews for metrics authentication
- `*-metrics-reader` — Read access to `/metrics` non-resource URL
