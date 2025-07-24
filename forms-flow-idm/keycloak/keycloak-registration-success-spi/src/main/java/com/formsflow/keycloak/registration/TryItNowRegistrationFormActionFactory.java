package com.formsflow.keycloak.registration;

import org.keycloak.Config;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormActionFactory;
import org.keycloak.models.AuthenticationExecutionModel.Requirement;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

import java.util.Collections;
import java.util.List;

public class TryItNowRegistrationFormActionFactory implements FormActionFactory {

  public static final String PROVIDER_ID = "try-it-now-registration";

  @Override
  public FormAction create(KeycloakSession session) {
    return new TryItNowRegistrationFormAction();
  }

  @Override
  public void init(Config.Scope config) {
  }

  @Override
  public void postInit(KeycloakSessionFactory factory) {
  }

  @Override
  public void close() {
  }

  @Override
  public String getId() {
    return PROVIDER_ID;
  }

  @Override
  public String getDisplayType() {
    return "Try It Now Registration Form Action";
  }

  @Override
  public String getReferenceCategory() {
    return "registration";
  }

  @Override
  public boolean isConfigurable() {
    return false;
  }

  @Override
  public boolean isUserSetupAllowed() {
    return false;
  }

  @Override
  public Requirement[] getRequirementChoices() {
    return new Requirement[] { Requirement.REQUIRED, Requirement.DISABLED };
  }

  @Override
  public String getHelpText() {
    return "Validates Try It Now registration fields and sets attributes after registration.";
  }

  @Override
  public List<ProviderConfigProperty> getConfigProperties() {
    return Collections.emptyList();
  }
}
