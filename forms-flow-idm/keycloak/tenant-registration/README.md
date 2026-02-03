# Tenant Registration Keycloak Extension

Keycloak 26.4.1 extension for tenant-aware registration: custom `/register-tenant` URL, create tenant via external API at form submit, add user to Keycloak group (`defaultGroupId`), substitute `{tenantKey}` in `redirect_uri` before redirect, measure registration flow time, and send account-created email asynchronously in a background thread (so the flow is not blocked on SMTP).

## Providers overview

| Provider name (Admin UI)        | Type        | Used in                          | Purpose |
|---------------------------------|-------------|-----------------------------------|---------|
| Pre Tenant Creation Form Action | Form Action | Registration Form sub-flow        | Before user creation: calls tenant API with email from form; stores `tenantId` and `defaultGroupId` in auth notes. |
| Post Tenant Assignment Form Action | Form Action | Registration Form sub-flow     | After user creation: adds user to group, sets `tenantKey`, sends account-created email. |
| Pre Tenant Creation             | Authenticator | First Broker Login (and other flows) | Before user creation: calls tenant API (no email; `name` = `key`); stores notes. No-op if `create_tenant` not set. |
| Post Tenant Assignment          | Authenticator | First Broker Login (and other flows) | After user exists: adds user to group, sets `tenantKey`, sends account-created email. No-op if user is null or notes missing. |

For **registration via form** (`/register-tenant`), use the **Form Actions** in the Registration Form sub-flow. For **social / IdP first login**, use the **Authenticators** in the First Broker Login flow (see below).

Provider IDs (for reference): `pre-tenant-creation-form-action`, `post-tenant-assignment-form-action`, `pre-tenant-creation-authenticator`, `post-tenant-assignment-authenticator`.

## Requirements

- Keycloak 26.4.1 (Quarkus)
- Java 17
- Environment: `FF_ADMIN_API_URL` — base URL for tenant API (e.g. `http://localhost:5000`). Final URL: `{FF_ADMIN_API_URL}/tenants`.
- The `forms-flow-bpm` client (or the client id from optional `FF_BPM_CLIENT_ID`, default: `forms-flow-bpm`) must exist in the realm as a **confidential** client with a client secret configured (Keycloak Admin → Clients → forms-flow-bpm → Credentials). The extension obtains the Bearer token via client credentials using `ClientModel.getSecret()` from the realm; no environment variable for the secret is required.
- Optional: `FF_KEYCLOAK_PUBLIC_URL` — base URL of Keycloak as reached by users and the Admin API (e.g. `http://192.168.2.100:8080/auth`). Set when you get 401 "invalid_claims" (issuer mismatch) because the request context uses an internal host (e.g. Keycloak in Docker); when set, the extension requests the token from this URL so the token's issuer matches.

## Build

From the `tenant-registration` directory (or the repo root with `-pl keycloak/tenant-registration`):

```bash
mvn clean package
```

Output JAR: `target/tenant-registration-1.0.0.jar`

> **Important:** Enable user registration in multitenant realm if using registration flows.

## Installation

1. Copy `tenant-registration-1.0.0.jar` to Keycloak's providers directory (e.g. `providers/`).
2. For Quarkus Keycloak, run `kc.sh build` then start Keycloak.

**Docker (this repo):** The keycloak Dockerfile builds both `idp-selector` and `tenant-registration` and copies the JARs into the Keycloak image. Set `FF_ADMIN_API_URL` (and optionally `FF_KEYCLOAK_PUBLIC_URL`, `FF_BPM_CLIENT_ID`) in the keycloak service environment (see `docker-compose.yml` and `sample.env`).

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
- **redirect_uri placeholder**: To have the generated tenant key injected into the redirect URL, use the placeholder **`__TENANT_KEY__`** in `redirect_uri` (e.g. `https://app.com/dashboard/__TENANT_KEY__`). This URL-safe form avoids browser blocking; the literal `{tenantKey}` is also supported but can trigger blocks. The client’s valid redirect URIs in Keycloak must allow the pattern (e.g. `https://app.com/dashboard/*`).
- **Behaviour**: When `create_tenant=true`, creates an auth session with that note and runs the registration flow. Form submit triggers PreTenantCreationFormAction (tenant API with email + Bearer token), then user creation, then PostTenantAssignmentFormAction (sync add-to-group, set `tenantKey`, substitute placeholder in `redirect_uri` if present, compute total registration time, and enqueue an async account-created email). When `create_tenant` is not set or false, tenant providers no-op and normal registration works unchanged.

## Tenant API Contract

- **POST** `{FF_ADMIN_API_URL}/tenants`
- **Headers**: `Authorization: Bearer <token>` (token obtained via client credentials for `forms-flow-bpm`).
- **Request body**: `{ "key": "<5-char random, starts with letter>", "name": "<SLD from email or key>", "details": { "createDefaultUsers": false, "createDefaultUserGroup": true, "skipAnalytics": false }, "trial": true }`
- **Response**: `{ "tenantId": "<id>", "defaultGroupId": "<keycloak group id>" }`
- **Failure**: Registration fails if the API returns non-2xx or throws.

## Post-registration

- User is added to the Keycloak group identified by `defaultGroupId`.
- The generated tenant id is stored on the user as attribute `tenantKey`, and if the original `redirect_uri` contained the placeholder `__TENANT_KEY__` (or `{tenantKey}`), it is replaced with the actual value in the auth session before Keycloak redirects back to the client.
- When `create_tenant=true`, the extension records a `registration_flow_start_time` at `/register-tenant` and, after successful post-tenant assignment, computes the total flow duration and appends it to the final redirect URL as `registration_duration_ms=<millis>`.
- Account-created email is rendered quickly in the request thread and sent asynchronously via a background sender using the realm’s SMTP settings, so the browser redirect is not blocked on SMTP.
- If add-to-group fails, the user is disabled. Email send failure is logged; registration still succeeds.

## Email Theme

Set the realm's **Email theme** to **formsflow** (or ensure the theme contains `email/html/account-created.ftl` and `email/text/account-created.ftl`) for consistency with other formsflow emails. Subject key: `accountCreatedSubject` (in `email/messages/messages_en.properties`).

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
   - **Post Tenant Assignment** (REQUIRED) — must run **after** the user exists. Reads `defaultGroupId` from auth notes; adds the user to that Keycloak group, sets `tenantKey`, performs `redirect_uri` `{tenantKey}` substitution and duration calculation, and enqueues an async account-created email. If `defaultGroupId` is missing, it succeeds without doing anything.
3. Set each execution requirement to **Required** (or Alternative/Disabled as needed).
4. Bind the flow to the desired client or flow alias (e.g. Browser flow, or a custom flow used by your client).

### First Broker Login flow (IdP / social sign-in)

Use this when users sign in for the first time via an identity provider (e.g. Google, GitHub). The flow creates a tenant, creates or links the user from the IdP, then assigns the user to the tenant group and sends the account-created email.

**Prerequisite:** The auth note `create_tenant=true` must be set in the session before or when the user is sent to the IdP (e.g. by your application when redirecting to Keycloak with a query parameter or via a custom endpoint that sets the note). Without it, Pre Tenant Creation and Post Tenant Assignment no-op and first broker login behaves as standard Keycloak.

**Social login from register-tenant:** When users select an IdP (e.g. Google) from the register-tenant page (`/register-tenant?client_id=...&create_tenant=true`), the tenant-creation flag is stored in **both** auth note and client note. The authenticators fall back to the client note if the auth note is missing after the IdP redirect, so tenant creation and assignment run correctly without a separate "social sign-up" URL.

#### Option A (recommended): Keep built-in flow structure

This keeps Keycloak’s default behavior: "Create User If Unique" and "Handle Existing Account" remain **Alternative** inside the **"User creation or linking"** sub-flow. Keycloak only ignores Alternative steps when they are **top-level** siblings of Required steps; inside a sub-flow they run as designed.

1. In Keycloak Admin: **Authentication** → **Flows**.
2. **Copy** the built-in **First Broker Login** flow (e.g. name it "First Broker Login - Tenant"). Do **not** add "Create User If Unique" as a new top-level step.
3. In the copy, add **only** these two **top-level** executions:
   - **Pre Tenant Creation** (Required) — add it and place it **first** (before Review Profile and before the "User creation or linking" sub-flow).
   - **Post Tenant Assignment** (Required) — add it and place it **after** the "User creation or linking" sub-flow (and after "First Broker Login - Conditional Organization" if present).
4. Leave the existing **"User creation or linking"** sub-flow **unchanged** (Required; inside it, Create User If Unique and Handle Existing Account stay Alternative).
5. In **Authentication** → **Bindings**, set **First Broker Login** to your new flow (e.g. "First Broker Login - Tenant").

**Top-level order:**  
`Pre Tenant Creation` → `Review Profile` → `User creation or linking` (sub-flow) → … → `Post Tenant Assignment`

#### Option B: Flat flow with Create User If Unique required

If you prefer a flat flow without the "User creation or linking" sub-flow:

1. Create or edit a First Broker Login flow with **top-level** executions in this order: **Pre Tenant Creation** (Required) → **Create User If Unique** (Required) → **Post Tenant Assignment** (Required).
2. Set "Create User If Unique" to **Required**. If it is **Alternative** at the same level as other Required steps, Keycloak may skip it ("REQUIRED and ALTERNATIVE elements at same level" in logs) and the user is never created, so Post Tenant Assignment fails with user=null.
3. **Caveat:** Making "Create User If Unique" Required can change duplicate-account behavior (e.g. users may see an error instead of being able to link an existing account). Prefer Option A if you want to preserve built-in behavior.

**Note:** The optional authenticators do not have access to form data. Pre Tenant Creation uses `key` and `name` = `key` only (no email). For registration with email-based tenant naming, use the Form Actions in the Registration Form sub-flow instead.

## Troubleshooting

### Account-created email not received

- **Check logs:** Look for "Sending account-created email to …" then "Sent account-created email to …" (send attempted and succeeded in Keycloak), or "Failed to send account-created email to user …" (exception).
- **Realm SMTP:** Keycloak → Realm → **Email** must have valid SMTP settings. If SMTP is not configured, send will typically throw and you will see "Failed to send …" in the logs.
- **Realm Email theme:** Set the realm’s **Email** theme to **formsflow** (Realm → **Themes** → Email theme) so `account-created.ftl` and `accountCreatedSubject` are found.
- **Delivery:** If logs show "Sent account-created email to …" but the user does not receive the message, check spam/junk and SMTP delivery (bounces, mail server logs).

### Post tenant assignment fails on social login (user=null / IDENTITY_PROVIDER_FIRST_LOGIN_ERROR)

If logs show `PostTenantAssignmentAuthenticator.authenticate() entered, user=null` and `REQUIRED and ALTERNATIVE elements at same level! … idp-create-user-if-unique`, the First Broker Login flow is misconfigured: the step that creates the user was skipped, so Post Tenant Assignment runs with no user.

- **Recommended fix (Option A):** Copy the built-in First Broker Login flow. Add **Pre Tenant Creation** (Required) as the **first** top-level step and **Post Tenant Assignment** (Required) **after** the **"User creation or linking"** sub-flow. Do **not** add "Create User If Unique" as a top-level step—leave the sub-flow unchanged so it runs and creates the user before Post Tenant Assignment. See "First Broker Login flow (IdP / social sign-in)" → Option A above.
- **Alternative (Option B):** Use a flat flow with **Create User If Unique** set to **Required** and placed before Post Tenant Assignment (order: Pre Tenant Creation → Create User If Unique → Post Tenant Assignment). See Option B above.

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
