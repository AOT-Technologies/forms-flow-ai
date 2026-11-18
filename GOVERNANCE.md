<!--
SPDX-FileCopyrightText: 2026 AOT Technologies

SPDX-License-Identifier: Apache-2.0
-->

# Governance

formsflow.ai is an open-source project stewarded by **AOT Technologies**. This
document describes how decisions are made and how the project is maintained.

## Roles

- **Maintainers** — review and merge contributions, triage issues, cut releases,
  and set technical direction. Maintainers are the members of the GitHub teams
  listed in [CODEOWNERS](CODEOWNERS).
- **Contributors** — anyone who submits issues or pull requests under the
  [Contributing guide](CONTRIBUTING.md).

## Decision making

- Routine changes are approved by maintainer review on a pull request (at least
  one maintainer approval).
- Significant or breaking changes are discussed in an issue or Discussion before
  implementation and require maintainer consensus. As project steward, AOT
  Technologies is the final decision maker where consensus cannot be reached.
- Public API changes follow [Semantic Versioning](https://semver.org/); breaking
  changes ship only in a major version and are documented in
  [CHANGELOG.md](CHANGELOG.md).

## Releases

Releases are cut by maintainers and published via the automated CD workflows,
with container images pushed to the `formsflow` organisation on Docker Hub. See
[CHANGELOG.md](CHANGELOG.md).

## Becoming a maintainer

Sustained, high-quality contributions may lead to an invitation to become a
maintainer, at the discretion of the existing maintainers.

## Security

Vulnerabilities are handled privately as described in [SECURITY.md](SECURITY.md).

## Code of conduct

All participation is governed by the [Code of Conduct](CODEOFCONDUCT.md).
