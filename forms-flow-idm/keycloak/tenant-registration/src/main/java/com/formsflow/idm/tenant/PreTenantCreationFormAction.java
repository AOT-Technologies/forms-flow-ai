/*
 * FormAction that creates a tenant BEFORE user is created.
 * Must be placed BEFORE "Registration User Creation" in the registration flow.
 * Registration fails if tenant creation fails.
 * Trigger: auth note create_tenant=true (set by /register-tenant endpoint).
 */

package com.formsflow.idm.tenant;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.jboss.logging.Logger;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.MultivaluedMap;

/**
 * FormAction that creates a tenant before user creation.
 * Execution order: Must be placed BEFORE "Registration User Creation" in the Registration Form sub-flow.
 * Flow: 1) Check create_tenant in auth note. 2) Get email from form. 3) Call tenant API. 4) Store tenantId and defaultGroupId in auth notes. 5) On API failure, registration fails.
 */
public class PreTenantCreationFormAction implements FormAction {

    private static final Logger logger = Logger.getLogger(PreTenantCreationFormAction.class);

    public static final String PROVIDER_ID = "pre-tenant-creation-form-action";
    /** Auth note set by /register-tenant endpoint; value "true" triggers tenant creation. */
    public static final String CREATE_TENANT_REQUIRED_NOTE = "create_tenant";
    /** Client note key for tenant creation flag (same value as auth note key; used so flag survives IdP redirect). */
    public static final String CREATE_TENANT_CLIENT_NOTE = "create_tenant";
    public static final String TENANT_ID_NOTE = "tenantId";
    public static final String DEFAULT_GROUP_ID_NOTE = "defaultGroupId";
    /** Auth note storing the tab ID for which tenant creation completed (idempotency by session tab). */
    public static final String REGISTRATION_COMPLETED_TAB_NOTE = "registration_completed_tab";
    /** Auth note timestamp (millis) marking when tenant creation started for this auth session (used for idempotency). */
    public static final String REGISTRATION_IN_PROGRESS_NOTE = "registration_in_progress";
    /** How long a registration is considered in-progress for idempotency checks (ms). */
    private static final long REGISTRATION_IN_PROGRESS_TIMEOUT_MS = 90_000L;
    private static final String EMAIL_FIELD = "email";
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@]+@[^@]+\\.[^@]+$");

    private final TenantService tenantService = new TenantService();

    @Override
    public void buildPage(FormContext context, LoginFormsProvider form) {
    }

    @Override
    public void validate(ValidationContext context) {
        AuthenticationSessionModel authSession = context.getAuthenticationSession();

        String createTenant = authSession.getAuthNote(CREATE_TENANT_REQUIRED_NOTE);
        if (createTenant == null || !"true".equalsIgnoreCase(createTenant)) {
            context.success();
            return;
        }

        // Idempotency by session tab: if registration already completed for this tab, skip tenant creation.
        String currentTabId = authSession.getTabId();
        String completedTabId = authSession.getAuthNote(REGISTRATION_COMPLETED_TAB_NOTE);
        if (currentTabId != null && currentTabId.equals(completedTabId)) {
            logger.debugf("PreTenantCreationFormAction: registration already completed for this tab (tabId=%s), skipping tenant creation", currentTabId);
            context.success();
            return;
        }

        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        String email = formData.getFirst(EMAIL_FIELD);

        if (email == null || email.trim().isEmpty()) {
            List<FormMessage> errors = new ArrayList<>();
            errors.add(new FormMessage(EMAIL_FIELD, "Email is required for tenant creation"));
            context.validationError(formData, errors);
            return;
        }

        String emailTrimmed = email.trim();

        if (!EMAIL_PATTERN.matcher(emailTrimmed).matches()) {
            List<FormMessage> errors = new ArrayList<>();
            errors.add(new FormMessage(EMAIL_FIELD, "Invalid email format"));
            context.validationError(formData, errors);
            return;
        }

        if (context.getSession().users().getUserByEmail(context.getRealm(), emailTrimmed) != null) {
            logger.info("Registration attempt with existing email address");
            List<FormMessage> errors = new ArrayList<>();
            errors.add(new FormMessage(EMAIL_FIELD, "Unable to complete registration. Please verify your information or contact support."));
            context.validationError(formData, errors);
            return;
        }

        try {
            // Idempotency / duplicate-submit guard: if tenant creation was started recently for this auth session,
            // treat a new submit as a duplicate and surface a validation error instead of calling the tenant API again.
            String inProgressNote = authSession.getAuthNote(REGISTRATION_IN_PROGRESS_NOTE);
            long now = System.currentTimeMillis();
            if (inProgressNote != null) {
                try {
                    long startedAt = Long.parseLong(inProgressNote);
                    if (now - startedAt < REGISTRATION_IN_PROGRESS_TIMEOUT_MS) {
                        logger.debugf("PreTenantCreationFormAction: registration already in progress for this auth session (startedAt=%d), rejecting duplicate submit", startedAt);
                        List<FormMessage> errors = new ArrayList<>();
                        errors.add(new FormMessage(null, "Registration is already in progress. Please wait before trying again."));
                        context.validationError(formData, errors);
                        return;
                    }
                } catch (NumberFormatException e) {
                    logger.debugf("PreTenantCreationFormAction: invalid registration_in_progress note: %s", inProgressNote);
                }
            }

            authSession.setAuthNote(REGISTRATION_IN_PROGRESS_NOTE, Long.toString(now));

            logger.debug("PreTenantCreationFormAction: calling tenant API with email from form");
            TenantService.TenantCreationResult result = tenantService.createTenant(context.getSession(), emailTrimmed);
            authSession.setAuthNote(TENANT_ID_NOTE, result.getTenantId());
            authSession.setAuthNote(DEFAULT_GROUP_ID_NOTE, result.getDefaultGroupId());
            authSession.setAuthNote(REGISTRATION_COMPLETED_TAB_NOTE, authSession.getTabId());
            logger.infof("PreTenantCreationFormAction: tenant created, tenantId=%s, defaultGroupId=%s", result.getTenantId(), result.getDefaultGroupId());
            context.success();
        } catch (TenantService.TenantServiceException e) {
            logger.errorf(e, "Tenant creation failed for email: %s", email);
            List<FormMessage> errors = new ArrayList<>();
            errors.add(new FormMessage(null, "Failed to create tenant. Please try again later."));
            context.error("tenant_creation_failed");
            // Mark in-progress note as stale so a retry is allowed immediately after a failure.
            authSession.setAuthNote(REGISTRATION_IN_PROGRESS_NOTE, "0");
            context.validationError(formData, errors);
        }
    }

    @Override
    public void success(FormContext context) {
        // No-op; tenant created in validate()
    }

    @Override
    public boolean requiresUser() {
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
    }

    @Override
    public void close() {
    }
}
