# Tenant Registration Keycloak Extension

Keycloak 26.4.1 extension for tenant-aware registration: custom `/register-tenant` URL, create tenant via external API at form submit, add user to Keycloak group (`defaultGroupId`), and send account-created email (synchronously in the request thread).

## Requirements

- Keycloak 26.4.1 (Quarkus)
- Java 17
- Environment: `FF_ADMIN_API_URL` — base URL for tenant API (e.g. `http://localhost:5000`). Final URL: `{FF_ADMIN_API_URL}/tenants`.
- The `forms-flow-bpm` client (or the client id from optional `FF_BPM_CLIENT_ID`, default: `forms-flow-bpm`) must exist in the realm as a **confidential** client with a client secret configured (Keycloak Admin → Clients → forms-flow-bpm → Credentials). The extension obtains the Bearer token via client credentials using `ClientModel.getSecret()` from the realm; no environment variable for the secret is required.
- Optional: `FF_KEYCLOAK_PUBLIC_URL` — base URL of Keycloak as reached by users and the Admin API (e.g. `http://192.168.2.100:8080/auth`). Set when you get 401 "invalid_claims" (issuer mismatch) because the request context uses an internal host (e.g. Keycloak in Docker); when set, the extension requests the token from this URL so the token's issuer matches.

## Build

```bash
mvn clean package
```

JAR: `target/tenant-registration-1.0.0.jar`

> IMP" Enable user registration in multitenant realm

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
- **Query params**: `client_id` (required), `redirect_uri` (optional), `create_tenant` (optional; if `true`, tenant creation and assignment run; if omitted or `false`, normal registration without tenant steps).
- **Behaviour**: When `create_tenant=true`, creates an auth session with that note and runs the registration flow. Form submit triggers PreTenantCreationFormAction (tenant API with email + Bearer token), then user creation, then PostTenantAssignmentFormAction (sync add-to-group, sync account-created email in request thread). When `create_tenant` is not set or false, tenant providers no-op and normal registration works unchanged.

## Tenant API Contract

- **POST** `{FF_ADMIN_API_URL}/tenants`
- **Headers**: `Authorization: Bearer <token>` (token obtained via client credentials for `forms-flow-bpm`).
- **Request body**: `{ "key": "<5-char random, starts with letter>", "name": "<SLD from email or key>", "details": { "createDefaultUsers": false, "createDefaultUserGroup": true, "skipAnalytics": false }, "trial": true }`
- **Response**: `{ "tenantId": "<id>", "defaultGroupId": "<keycloak group id>" }`
- **Failure**: Registration fails if the API returns non-2xx or throws.

## Post-registration

- User is added to the Keycloak group identified by `defaultGroupId`.
- Account-created email is sent synchronously via `EmailTemplateProvider` (template: `account-created.ftl` in the formsflow email theme). Email is sent in the request thread so Keycloak's template provider has request context (required for Quarkus).
- If add-to-group fails, the user is disabled. Email send failure is logged; registration still succeeds.

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
   - **Post Tenant Assignment** (REQUIRED) — must run **after** the user exists. Reads `defaultGroupId` from auth notes; adds the user to that Keycloak group and sends the account-created email (synchronously in the request thread); disables the user on add-to-group failure. If `defaultGroupId` is missing, it succeeds without doing anything.
3. Set each execution requirement to **Required** (or Alternative/Disabled as needed).
4. Bind the flow to the desired client or flow alias (e.g. Browser flow, or a custom flow used by your client).

**Note:** The optional authenticators do not have access to form data. Pre Tenant Creation uses `key` and `name` = `key` only (no email). For registration with email-based tenant naming, use the Form Actions in the Registration Form sub-flow instead.

## Troubleshooting

### Account-created email not received

- **Check logs:** Look for "Sending account-created email to …" then "Sent account-created email to …" (send attempted and succeeded in Keycloak), or "Failed to send account-created email to user …" (exception).
- **Realm SMTP:** Keycloak → Realm → **Email** must have valid SMTP settings. If SMTP is not configured, send will typically throw and you will see "Failed to send …" in the logs.
- **Realm Email theme:** Set the realm’s **Email** theme to **formsflow** (Realm → **Themes** → Email theme) so `account-created.ftl` and `accountCreatedSubject` are found.
- **Delivery:** If logs show "Sent account-created email to …" but the user does not receive the message, check spam/junk and SMTP delivery (bounces, mail server logs).

### Tenant API returns 401: "Authorization header is expected" / "authorization_header_missing"

The extension sends `Authorization: Bearer <token>` to the tenant API (header is set first so proxies that only forward the first headers receive it). A 401 with this message usually means one of:

0. **Extension not rebuilt/redeployed**  
   After changing the tenant-registration code, run `mvn clean package` and copy the new JAR into Keycloak’s providers, then rebuild/restart Keycloak. The current build uses `HttpClient` with `followRedirects(NEVER)` so the Authorization header is not stripped when the server redirects.

1. **Admin API not reachable or wrong URL**  
   `FF_ADMIN_API_URL` must be the base URL of the Forms Flow Admin API **as seen from the Keycloak process**. From inside a Keycloak container use the Docker service name (e.g. `http://forms-flow-api:5010`), not `http://localhost:5010`, unless Keycloak runs on the host.

2. **Token rejected by Admin API (issuer mismatch)**  
   The token is obtained from the **current realm** (e.g. `multitenant`) using the `forms-flow-bpm` client. The Admin API must validate tokens from the **same Keycloak issuer** (same base URL and realm). If Keycloak is reached as `http://localhost:8080` by users but the Admin API uses `KEYCLOAK_URL=http://keycloak:8080`, the token’s issuer (`http://localhost:8080/realms/multitenant`) will not match and validation can fail with a 401. Fix by aligning Keycloak URL/issuer used by the Admin API with the URL users use to reach Keycloak (or configure Keycloak’s frontend URL so the issued token’s issuer matches what the Admin API expects).

3. **Proxy stripping the header**  
   If a reverse proxy or API gateway sits in front of the Admin API, ensure it forwards the `Authorization` header (e.g. nginx: `proxy_set_header Authorization $http_authorization;`). Without it, the backend will see no header and return 401.

4. **Verify from Keycloak’s network**  
   From inside the Keycloak container, run:  
   `curl -v -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{}' "http://YOUR_FF_ADMIN_API_URL/tenants"`  
   If the Admin API receives this request with the header but the extension’s request does not, the issue is in the extension or its build. If curl’s request also arrives without the header, the issue is network/proxy between Keycloak and the Admin API.

5. **BPM client in realm**  
   In the same realm used for registration (e.g. `multitenant`), the `forms-flow-bpm` client (or `FF_BPM_CLIENT_ID`) must exist as a **confidential** client with a **client secret**; the extension uses it for the client-credentials token that is sent to the tenant API.

### Tenant API returns 401: "invalid_claims" / "incorrect claims, please check the audience and issuer"

The token is sent correctly but the Admin API rejects it because **issuer** or **audience** in the token does not match what the Admin API expects.

- **Cause**: The token is issued by Keycloak for realm `multitenant` with an **issuer** like `http://<keycloak-host>:<port>/auth/realms/multitenant` (the Keycloak URL users use, e.g. `http://192.168.2.100:8080/auth/realms/multitenant`). The Admin API validates the token using its own Keycloak URL (e.g. `KEYCLOAK_URL`). If that URL differs (e.g. Admin API uses `http://keycloak:8080/auth` while the token says `http://192.168.2.100:8080/auth`), validation fails with invalid_claims.

- **Fix**: Configure the Admin API so the Keycloak URL it uses for token validation **matches the issuer in the token** (same host and path). For example:
  - If users reach Keycloak at `http://192.168.2.100:8080/auth`, set the Admin API’s Keycloak base URL to `http://192.168.2.100:8080/auth` (and realm `multitenant` if required), **or**
  - Set Keycloak’s hostname/frontend URL (e.g. `KC_HOSTNAME=192.168.2.100` or `KC_HTTP_RELATIVE_PATH=/auth`) so the token issuer matches the URL the Admin API is already configured with.
- **Extension override**: If the request context uses an internal host (e.g. Keycloak in Docker), set `FF_KEYCLOAK_PUBLIC_URL` to the same base URL used by users and the Admin API (e.g. `http://192.168.2.100:8080/auth`). The extension will then request the token from that URL so the token’s issuer matches.
- **Audience**: If the Admin API expects a specific **audience** (e.g. client id), ensure the `forms-flow-bpm` client is included in the token audience (e.g. in Keycloak client scopes or in the Admin API’s accepted audiences).
