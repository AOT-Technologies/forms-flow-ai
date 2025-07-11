package com.formsflow.keycloak.listener;

import org.keycloak.Config;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;

public class KeycloakEventListenerProviderFactory implements EventListenerProviderFactory {

  @Override
  public EventListenerProvider create(KeycloakSession session) {
    return new KeycloakEventListenerProvider();
  }

  @Override
  public void init(Config.Scope config) {
    // Read config if needed
  }

  @Override
  public void postInit(org.keycloak.models.KeycloakSessionFactory factory) {
  }

  @Override
  public void close() {
  }

  @Override
  public String getId() {
    return "keycloak-event-listener";
  }
}
