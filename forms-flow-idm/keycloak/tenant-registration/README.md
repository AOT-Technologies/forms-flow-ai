# Tenant Registration Keycloak Extension

Keycloak 26.4.1 extension for tenant-aware registration: custom `/register-tenant` URL, create tenant via external API at form submit, add user to Keycloak group (`defaultGroupId`), and send account-created email (async).

## Requirements

- Keycloak 26.4.1 (Quarkus)
- Java 17
- Environment: `FF_ADMIN_API_URL` — base URL for tenant API (e.g. `http://localhost:5000`). Final URL: `{FF_ADMIN_API_URL}/tenants`.

## Build

```bash
mvn clean package
```

JAR: `target/tenant-registration-1.0.0.jar`

## Installation

1. Copy the JAR to Keycloak's providers directory (e.g. `providers/`).
2. For Quarkus Keycloak, run `kc.sh build` then start Keycloak.

With Docker (this repo): the keycloak Dockerfile builds both `idp-selector` and `tenant-registration` and copies JARs into the Keycloak container; ensure `FF_ADMIN_API_URL` is set in the keycloak service environment (see `docker-compose.yml` and `sample.env`).

## Flow Configuration

1. In Keycloak Admin: **Authentication** → **Flows** → select **Registration** (or a copy).
2. Open the **Registration Form** sub-flow.
3. Add executions in this order:
   - **Pre Tenant Creation Form Action** (REQUIRED) — **before** Registration User Creation
   - **Registration User Creation** (built-in)
   - **Post Tenant Assignment Form Action** (REQUIRED) — **after** Registration User Creation

## Custom URL

- **URL**: `{keycloakBaseURL}/auth/realms/{realmName}/register-tenant`
- **Query params**: `client_id` (required), `redirect_uri` (optional).
- **Behaviour**: Creates an auth session with `create_tenant=true`, then runs the registration flow (default registration form). Form submit triggers PreTenantCreationFormAction (tenant API with email), then user creation, then PostTenantAssignmentFormAction (async: add user to group + send email).

## Tenant API Contract

- **POST** `{FF_ADMIN_API_URL}/tenants`
- **Request body**: `{ "key": "<5-char random>", "name": "<domain from email or key>", "details": { "createDefaultUsers": false, "createDefaultUserGroup": true, "skipAnalytics": false }, "trial": true }`
- **Response**: `{ "tenantId": "<id>", "defaultGroupId": "<keycloak group id>" }`
- **Failure**: Registration fails if the API returns non-2xx or throws.

## Post-registration (async)

- User is added to the Keycloak group identified by `defaultGroupId`.
- Account-created email is sent via `EmailTemplateProvider` (template: `account-created.ftl` in the formsflow email theme).
- If add-to-group or email fails, the user is disabled.

## Email Theme

Set the realm's **Email theme** to **formsflow** (or ensure the theme contains `email/html/account-created.ftl` and `email/text/account-created.ftl`). Subject key: `accountCreatedSubject` (in `email/messages/messages_en.properties`).

## Optional Authenticators

**Pre Tenant Creation** and **Post Tenant Assignment** authenticators are available for use in **top-level authentication flows** (e.g. browser or direct grant flows) when you need tenant creation and assignment without using the registration form sub-flow. For standard registration via `/register-tenant`, use the **Form Actions** (Pre Tenant Creation Form Action, Post Tenant Assignment Form Action) in the Registration Form sub-flow as described above.

### When to use them

- You have a custom or copied **browser** (or other) flow where registration is not done via the Registration Form sub-flow, but you still want to create a tenant and assign the user to a group.
- You trigger the flow with `create_tenant=true` in the auth session (e.g. from a custom endpoint or client that sets the auth note before starting the flow).

### How to configure

1. In Keycloak Admin: **Authentication** → **Flows** → create a new flow or copy an existing one (e.g. **Browser** or a flow that includes registration steps).
2. Add executions in this order:
   - **Pre Tenant Creation** (REQUIRED) — must run **before** the step that creates the user. When `create_tenant=true` is in the auth session, it calls the tenant API (with no email; `name` = `key`) and stores `tenantId` and `defaultGroupId` in auth notes. If the auth note is not set, it succeeds without calling the API.
   - Your existing steps that create or identify the user (e.g. Registration Form, or another mechanism).
   - **Post Tenant Assignment** (REQUIRED) — must run **after** the user exists. Reads `defaultGroupId` from auth notes; asynchronously adds the user to that Keycloak group and sends the account-created email; disables the user on failure. If `defaultGroupId` is missing, it succeeds without doing anything.
3. Set each execution requirement to **Required** (or Alternative/Disabled as needed).
4. Bind the flow to the desired client or flow alias (e.g. Browser flow, or a custom flow used by your client).

**Note:** The optional authenticators do not have access to form data. Pre Tenant Creation uses `key` and `name` = `key` only (no email). For registration with email-based tenant naming, use the Form Actions in the Registration Form sub-flow instead.
