package com.formsflow.keycloak.registration;

import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;

import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.FormMessage;
import org.jboss.logging.Logger;
import jakarta.ws.rs.WebApplicationException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class TryItNowRegistrationFormAction implements FormAction {

  private static final Logger LOG = Logger.getLogger(TryItNowRegistrationFormAction.class);
  private static final String SUCCESS_MESSAGE_KEY = "registrationCustomSuccessMsg";
  private static final String TENANT_REGISTRATION_CLIENT_ID = System.getenv("TENANT_REGISTRATION_CLIENT_ID");

  @Override
  public void validate(ValidationContext context) {
    String clientId = context.getAuthenticationSession().getClient().getClientId();
    if (!Objects.equals(TENANT_REGISTRATION_CLIENT_ID, clientId)) {
      // Not the expected client – exit without validating anything
      // let the flow continue
      context.success();
      return;
    }

    MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
    List<FormMessage> errors = new ArrayList<>();

    String tenantName = formData.getFirst("tenantName");
    String tenantKey = formData.getFirst("tenantKey");
    LOG.infof("[TryItNowRegistrationForm] Validation begins for tenant fileds.");

    if (tenantName == null || tenantName.isBlank()) {
      errors.add(new FormMessage("tenantName", "Tenant Name is required."));
    }
    if (tenantKey == null || tenantKey.isBlank()) {
      errors.add(new FormMessage("tenantKey", "Tenant Key is required."));
    } else if (tenantKey.contains(" ") || !tenantKey.matches("^\\S+$")) {
      errors.add(new FormMessage("tenantKey", "Tenant Key must not contain spaces."));
    }

    if (!errors.isEmpty()) {
      context.validationError(formData, errors);
    } else {
      context.success();
    }
  }

  @Override
  public void success(FormContext context) {
    String clientId = context.getAuthenticationSession().getClient().getClientId();
    boolean isTryItNow = clientId != null &&
        clientId.contains(TENANT_REGISTRATION_CLIENT_ID);

    if (isTryItNow) {
      UserModel user = context.getUser();
      if (user != null) {
        // Disable the user account
        user.setEnabled(false);
        LOG.infof("[TryItNowRegistrationForm] user disbled!");

        // Create and render the custom success page
        LoginFormsProvider form = context.getSession().getProvider(LoginFormsProvider.class);
        form.setSuccess(SUCCESS_MESSAGE_KEY);
        Response response = form.createForm("registration-success.ftl");

        // Stop the flow and render the custom page
        throw new WebApplicationException(response);

      }
    }
  }

  @Override
  public void buildPage(FormContext context, LoginFormsProvider form) {

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
    // No required actions needed
  }

  @Override
  public void close() {
    // Clean up if needed
  }
}