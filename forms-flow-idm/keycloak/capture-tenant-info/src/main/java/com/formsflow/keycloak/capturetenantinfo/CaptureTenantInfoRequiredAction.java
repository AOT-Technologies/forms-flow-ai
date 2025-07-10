package com.formsflow.keycloak.capturetenantinfo;

import org.keycloak.authentication.RequiredActionContext;
import org.keycloak.authentication.RequiredActionProvider;
import org.keycloak.authentication.RequiredActionFactory;
import org.keycloak.models.*;
import org.keycloak.services.validation.Validation;
import org.keycloak.events.EventBuilder;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;

public class CaptureTenantInfoRequiredAction implements RequiredActionProvider, RequiredActionFactory {

  public static final String PROVIDER_ID = "capture-tenant-info";
  private static final String SUCCESS_MESSAGE_KEY = "registrationCustomSuccessMsg";
  private static final String TENANT_REGISTRATION_CLIENT_ID = System.getenv("TENANT_REGISTRATION_CLIENT_ID");
  private static final String TENANT_FORM = "capture-tenant-info.ftl";

  @Override
  public void evaluateTriggers(RequiredActionContext context) {
    String clientId = context.getAuthenticationSession().getClient().getClientId();
    if (!TENANT_REGISTRATION_CLIENT_ID.equals(clientId)) {
      return;
    }

    UserModel user = context.getUser();
    String identityProvider = context.getAuthenticationSession().getAuthNote("idp");

    boolean shouldTrigger = identityProvider != null ||
        user.getFirstAttribute("tenantName") == null ||
        user.getFirstAttribute("tenantKey") == null;

    if (shouldTrigger && !user.getRequiredActionsStream().anyMatch(PROVIDER_ID::equals)) {
      user.addRequiredAction(PROVIDER_ID);
    }
  }

  @Override
  public void requiredActionChallenge(RequiredActionContext context) {
    String clientId = context.getAuthenticationSession().getClient().getClientId();
    if (!TENANT_REGISTRATION_CLIENT_ID.equals(clientId)) {
      return;
    }
    AuthenticationSessionModel authSession = context.getAuthenticationSession();
    if (authSession != null) {
      authSession.setAuthNote("skip_require_action", "true");
      authSession.setAuthNote("ignore_previous_user", "true");
    }

    Response challenge = context.form()
        .setAttribute("clientId", context.getAuthenticationSession().getClient().getClientId())
        .createForm(TENANT_FORM);
    context.challenge(challenge);
  }

  @Override
  public void processAction(RequiredActionContext context) {
    String clientId = context.getAuthenticationSession().getClient().getClientId();
    if (!TENANT_REGISTRATION_CLIENT_ID.equals(clientId)) {
      return;
    }
    MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();

    String tenantName = formData.getFirst("tenantName");
    String tenantKey = formData.getFirst("tenantKey");

    if (Validation.isBlank(tenantName)) {
      Response challenge = context.form()
          .setError("tenantNameMissing")
          .setAttribute("tenantKey", tenantKey)
          .createForm(TENANT_FORM);
      context.challenge(challenge);
      return;
    }

    if (Validation.isBlank(tenantKey)) {
      Response challenge = context.form()
          .setError("tenantKeyMissing")
          .setAttribute("tenantName", tenantName)
          .createForm(TENANT_FORM);
      context.challenge(challenge);
      return;
    }

    if (tenantKey.contains(" ")) {
      Response challenge = context.form()
          .setError("tenantKeyInvalid")
          .setAttribute("tenantName", tenantName)
          .createForm(TENANT_FORM);
      context.challenge(challenge);
      return;
    }

    UserModel user = context.getUser();
    user.setSingleAttribute("tenantName", tenantName.trim());
    user.setSingleAttribute("tenantKey", tenantKey.trim().toLowerCase());

    if (TENANT_REGISTRATION_CLIENT_ID.equals(clientId)) {
      // Disable user login
      user.setEnabled(false);

      // Remove required action
      user.removeRequiredAction(PROVIDER_ID);

      // Always show success message for try-it-now-client
      handlePostRegistrationFlow(context);
      return; // Don't proceed with login
    }

    // For other clients (if needed)
    user.removeRequiredAction(PROVIDER_ID);
    context.success();

  }

  private void handlePostRegistrationFlow(RequiredActionContext context) {
    try {
      // Clear any existing authentication session to prevent login
      context.getAuthenticationSession().setAuthNote("skip_require_action", "true");
      context.getAuthenticationSession().setAuthNote("ignore_previous_user", "true");
      context.getAuthenticationSession().setAuthNote("registration_success", "true");

      // Show static success message
      Response successPage = context.form()
          .setSuccess(context.form().getMessage(SUCCESS_MESSAGE_KEY))
          .createForm("registration-success.ftl");

      context.challenge(successPage);

    } catch (Exception e) {
      EventBuilder event = new EventBuilder(context.getRealm(), context.getSession(), context.getConnection());
      event.error("REGISTRATION_ERROR");
      context.failure();
    }
  }

  @Override
  public void close() {
  }

  @Override
  public RequiredActionProvider create(KeycloakSession session) {
    return this;
  }

  @Override
  public void init(org.keycloak.Config.Scope config) {
  }

  @Override
  public void postInit(KeycloakSessionFactory factory) {
  }

  @Override
  public String getId() {
    return PROVIDER_ID;
  }

  @Override
  public String getDisplayText() {
    return "Capture Tenant Info";
  }
}