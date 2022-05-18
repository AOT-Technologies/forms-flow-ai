package org.camunda.bpm.extension.keycloak.plugin;

import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakUserQuery;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Keycloak User Service.
 * Custom class for Implementation of user queries against Keycloak's REST API.
 */
public class KeycloakUserService  extends org.camunda.bpm.extension.keycloak.KeycloakUserService {

    /** This class' logger. */
    private static final Logger LOG = LoggerFactory.getLogger(KeycloakUserService.class);

    private String webClientId;
    private boolean enableClientAuth;
    private boolean enableMultiTenancy;
    private TenantService tenantService;

    public KeycloakUserService(KeycloakConfiguration keycloakConfiguration, KeycloakRestTemplate restTemplate,
                               KeycloakContextProvider keycloakContextProvider, CustomConfig config) {
        super(keycloakConfiguration, restTemplate, keycloakContextProvider);

        this.webClientId = config.getWebClientId();
        this.enableClientAuth = config.isEnableClientAuth();
        this.enableMultiTenancy = config.isEnableMultiTenancy();
        if (this.enableMultiTenancy) {
            this.tenantService = new TenantService(restTemplate, keycloakContextProvider, config);
        }
    }

    @Override
    public List<User> requestUsersByGroupId(CacheableKeycloakUserQuery query) {
        List<User> users = null;

        if (enableClientAuth) {
            if (enableMultiTenancy) {
                users = this.requestUsersByTenantAndClientRole();
            } else {
                users = this.requestUsersByClientRole();
            }
        } else {
            users = super.requestUsersByGroupId(query);
        }
        return users;
    }

    /**
     *
     * @return
     */
    protected List<User> requestUsersByClientRole(){
        List<User> users = new ArrayList<>();
        return users;
    }

    /**
     *
     * @return
     */
    protected List<User> requestUsersByTenantAndClientRole(){
        List<User> users = new ArrayList<>();
        return users;
    }
}
