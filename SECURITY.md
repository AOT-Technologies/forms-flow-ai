<!--
SPDX-FileCopyrightText: 2026 AOT Technologies

SPDX-License-Identifier: Apache-2.0
-->

# Security policy

The formsflow.ai maintainers take the security of the project seriously. This
document explains which versions receive security fixes and how to report a
vulnerability responsibly.

## Supported versions

formsflow.ai follows [Semantic Versioning](https://semver.org/). Security fixes are
applied to the latest 7.x release and the `master` branch.

| Version | Supported          |
| ------- | ------------------ |
| 7.3.x   | :white_check_mark: |
| < 7.3   | :x:                |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report suspected vulnerabilities privately through either of the following:

- **GitHub Security Advisories** — use the
  [private vulnerability reporting](https://github.com/AOT-Technologies/forms-flow-ai/security/advisories/new)
  form for this repository (preferred).
- **Email** — send details to **opensource@aot-technologies.com**.

When reporting, include as much of the following as you can:

- A description of the vulnerability and its potential impact, including the type
  of issue (for example injection, authentication bypass, information disclosure).
- The component or file involved (for example, `forms-flow-api`, `forms-flow-web`,
  `forms-flow-bpm`, `forms-flow-documents`, `forms-flow-data-layer`,
  `forms-flow-api-utils`, `forms-flow-analytics`, or the deployment configuration
  under `deployment/`).
- Steps to reproduce, including a minimal proof of concept if available.
- The version, commit, or deployment configuration affected.

## What to expect

- **Acknowledgement** within 3 business days of your report.
- An initial assessment and severity triage within 10 business days.
- Coordinated disclosure: we will work with you on a fix and a public
  disclosure timeline, and credit you in the advisory unless you prefer to
  remain anonymous.

Give us a reasonable opportunity to remediate the issue before any
public disclosure.

## Scope

This policy covers the code in this repository: the web application, API,
workflow (BPM), documents, data layer, and identity customizations, together
with the container images published from it and the default deployment
configuration. Vulnerabilities in third-party components that formsflow.ai
integrates, such as Form.io, Camunda, Keycloak, and Redash, should be reported
to the relevant upstream project; if such an issue affects formsflow.ai users,
we still welcome a heads-up so we can pin or patch accordingly.
