# Tenant Registration Provider

A Keycloak SPI extension for **forms-flow-ai** that ties user registration to tenant creation. When a user signs up via the tenant registration flow, a tenant is created via the Forms Flow Admin API, the user is added to the tenant’s default Keycloak group, and an account-created email is sent.

## Overview

The provider adds:

- **REST endpoint**: `GET /realms/{realm}/register-tenant` — starts the registration flow with tenant creation enabled (`create_tenant=true`).
- **Form actions** (used in the Registration flow):
  - **Pre Tenant Creation** — calls the tenant API before user creation; must run **before** "Registration User Creation".
  - **Post Tenant Assignment** — after user creation, adds the user to the tenant’s default group and sends the account-created email; must run **after** "Registration User Creation".
- **Authenticators** (optional, for non-form flows): `pre-tenant-creation-authenticator`, `post-tenant-assignment-authenticator`.

Flow summary:

1. User hits `/realms/{realm}/register-tenant?client_id=...&redirect_uri=...&create_tenant=true`.
2. **Pre Tenant Creation** validates email, calls `POST {FF_ADMIN_API_URL}/tenants`, stores `tenantId` and `defaultGroupId` in the auth session.
3. **Registration User Creation** creates the Keycloak user.
4. **Post Tenant Assignment** adds the user to the group, sets `tenantKey` attribute, optionally substitutes `__TENANT_KEY__` in `redirect_uri`, and sends the account-created email.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FF_ADMIN_API_URL` | Yes | Forms Flow Admin API base URL (e.g. `http://localhost:5010`). Tenant creation calls `POST {FF_ADMIN_API_URL}/tenants`. |
| `FF_KEYCLOAK_PUBLIC_URL` | No | Keycloak base URL as seen by clients (e.g. `http://localhost:8080/auth`). Set when Keycloak runs behind Docker or a proxy so the token issuer URL is correct. If unset, the request context URL is used. |
| `FF_BPM_CLIENT_ID` | No | Client ID used for the client-credentials token when calling the tenant API. Default: `forms-flow-bpm`. |

## Keycloak Requirements

- **Realm**: Registration must be allowed (Realm → Login → User registration **ON**).
- **Client**: A confidential client (e.g. `forms-flow-bpm`) with a **client secret** must exist in the realm; it is used to obtain the Bearer token for the tenant API.
- **Registration flow**: The two form actions must be added in the correct order (see below).

## Configuration Steps

### 1. Deploy the provider

**Using Docker (parent `keycloak/` folder):**

The `keycloak/Dockerfile` builds the tenant-registration JAR and copies it to `/custom/providers/`. When Keycloak starts via `start-keycloak.sh`, these providers are copied into Keycloak’s `providers` directory.

```bash
# From keycloak/
docker compose build
docker compose up -d
```

Ensure `FF_ADMIN_API_URL` and, if needed, `FF_KEYCLOAK_PUBLIC_URL` and `FF_BPM_CLIENT_ID` are set in your `.env` (see `sample.env`).

**Manual / standalone Keycloak:**

1. Build the JAR:
   ```bash
   mvn clean package
   ```
2. Copy `target/tenant-registration-*.jar` to Keycloak’s `providers/` directory.
3. Set the environment variables for the Keycloak process and restart Keycloak.

### 2. Configure the Registration flow

1. In Keycloak Admin: **Realm** → **Authentication** → **Flows**.
2. Duplicate the **Registration** flow (e.g. **Actions** → **Duplicate** and give it a name).
3. Open the duplicated flow. In the **Registration form** sub-flow, add and order executions as follows:

   **Before "Registration User Profile Creation":**
   - Add execution → **Pre Tenant Creation Form Action** → set to **Required**.

   **After "Registration User Profile Creation":**
   - Add execution → **Post Tenant Assignment Form Action** → set to **Required**.

4. **Save** the flow.
5. **Bind** the flow: open the **Actions** dropdown for your duplicated flow → **Bind flow** → **Registration**. Your custom flow is now used for registration.

### 3. Configure the First Broker Login flow (For social logins)

If users can register via an identity provider (e.g. social login), configure the First Broker Login flow so that tenant creation and assignment also run on first IdP login.

1. **Realm** → **Authentication** → **Flows**.
2. Duplicate the **First broker login** flow (e.g. **Actions** → **Duplicate** and give it a name).
3. Open the duplicated flow. Add the **authenticators** in this order:
   - **Pre Tenant Creation Authenticator** — before the step that creates the user from the IdP (e.g. before "first broker login User creation or linking" or equivalent).
   - **Post Tenant Assignment Authenticator** — after the user is created.
4. **Save** the flow.
5. **Bind** the flow: **Actions** → **Bind flow** → **First broker login**.

### 4. Ensure the BPM client exists

- In the realm, create or select the client used for the tenant API (default: `forms-flow-bpm`).
- Client must be **confidential** and have a **client secret**.
- If you use a different client, set `FF_BPM_CLIENT_ID` to that client’s ID.

### 5. Use the tenant registration endpoint

Direct users (or your app) to:

```
GET /auth/realms/{realm}/register-tenant?client_id={clientId}&redirect_uri={redirectUri}&create_tenant=true
```

- `client_id`: OIDC client id (e.g. your front-end app).
- `redirect_uri`: Must be a valid redirect URI for that client; after registration, Keycloak redirects here.
- `create_tenant=true`: Enables tenant creation and assignment in this registration.

To inject the created tenant key into the redirect URL, use the placeholder `__TENANT_KEY__` in `redirect_uri` (e.g. `https://app.example.com/landing/__TENANT_KEY__`). It will be replaced with the tenant id before redirect.

## Email template (account-created)

After a successful tenant registration, the **Post Tenant Assignment** step sends a welcome email to the new user using the **account-created** template.

- **When**: Sent once per registration, after the user is created and assigned to the tenant group.
- **Content**: Welcome message, account details (username, email, realm), and an optional “Sign in / Open app” link (the registration `redirect_uri`).
- **Theme files** (for reference / customization): The `formsflow` email theme includes matching HTML and plain-text templates:
  - `themes/formsflow/email/html/account-created.ftl`
  - `themes/formsflow/email/text/account-created.ftl`
  - Subject: `themes/formsflow/email/messages/messages_en.properties` → `accountCreatedSubject=Your account has been created`

**Configuring the account-created email:**

1. **Realm SMTP (required)**  
   Without SMTP, the provider logs a warning and does not send the email.  
   - **Realm** → **Realm settings** → **Email**.
   - Set **Host**, **Port**, **From**, and **Enable StartTLS** (or SSL) as needed.
   - If your server uses authentication, set **Enable Authentication** and **Username** / **Password**.
   - Use **Test connection** to verify.

2. **Email theme**  
   Set **Realm** → **Realm settings** → **Themes** → **Email theme** to **formsflow** so the realm uses the provided theme. The theme is deployed from `keycloak/themes/formsflow` (e.g. via the Docker setup).

3. **Customizing the template**  
   Edit the FTL files and/or `messages_en.properties` under `themes/formsflow/email/`, then rebuild and redeploy so the updated theme is available (e.g. rebuild the Keycloak Docker image). The provider currently builds the email body in code to match these templates; changing layout or variables in the FTL may require matching changes in the provider code.

## Redirect URI placeholder

You can use `__TENANT_KEY__` in the `redirect_uri` query parameter. After registration, it is replaced with the created tenant id so the application can route the user to the correct tenant context.

## Building

```bash
mvn clean package
```

Requires Java 17+. Keycloak version is defined in `pom.xml` (e.g. 26.4.1).

## Provider IDs (for reference)

| Type | Provider ID |
|------|-------------|
| Realm resource | `register-tenant` |
| Form action | `pre-tenant-creation-form-action` |
| Form action | `post-tenant-assignment-form-action` |
| Authenticator | `pre-tenant-creation-authenticator` |
| Authenticator | `post-tenant-assignment-authenticator` |
