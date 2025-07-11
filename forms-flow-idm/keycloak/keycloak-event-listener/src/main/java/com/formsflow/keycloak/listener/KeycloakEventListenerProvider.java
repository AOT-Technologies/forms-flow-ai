package com.formsflow.keycloak.listener;

import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

public class KeycloakEventListenerProvider implements EventListenerProvider {

  private static final Logger logger = LoggerFactory.getLogger(KeycloakEventListenerProvider.class);
  private static final String TENANT_REGISTRATION_CLIENT_ID = System.getenv("TENANT_REGISTRATION_CLIENT_ID");

  @Override
  public void onEvent(Event event) {
    if (event.getType() == EventType.REGISTER) {
      String clientId = event.getClientId();
      logger.info("User registered with client_id: {}", clientId);

      // ✅ Only proceed for try-it-now-client
      if (!Objects.equals(TENANT_REGISTRATION_CLIENT_ID, clientId)) {
        logger.info("Skipping Camunda trigger: Not target client_id");
        return;
      }

      String camundaUrl = System.getenv("PUBLIC_PROCESS_START_URL");
      String processKey = System.getenv("PROCESS_KEY");
      String tenantKey = System.getenv("PROCESS_TENANT_KEY");

      if (camundaUrl == null || processKey == null || tenantKey == null) {
        logger.warn(
            "One or more required environment variables (PUBLIC_PROCESS_START_URL, PROCESS_KEY, PROCESS_TENANT_KEY) are missing.");
        return;
      }

      String startUrl = camundaUrl + processKey + "/start?tenantKey=" + tenantKey;
      String jsonPayload = "{}";

      // ✅ Run Camunda trigger asynchronously to avoid blocking Keycloak threads
      CompletableFuture.runAsync(() -> {
        try {
          HttpClient httpClient = HttpClient.newBuilder()
              .connectTimeout(Duration.ofSeconds(5)) // Timeout to avoid hanging
              .build();

          HttpRequest startRequest = HttpRequest.newBuilder()
              .uri(URI.create(startUrl))
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
              .build();

          logger.info("Triggering Camunda process at: {}", startUrl);
          HttpResponse<String> startResponse = httpClient.send(startRequest, HttpResponse.BodyHandlers.ofString());

          logger.info("Camunda response status: {}", startResponse.statusCode());
          logger.info("Camunda response body: {}", startResponse.body());

        } catch (Exception e) {
          logger.error("Error while triggering Camunda process", e);
        }
      });
    }
  }

  @Override
  public void onEvent(org.keycloak.events.admin.AdminEvent adminEvent, boolean includeRepresentation) {
    // No-op
  }

  @Override
  public void close() {
    // No resources to close
  }
}
