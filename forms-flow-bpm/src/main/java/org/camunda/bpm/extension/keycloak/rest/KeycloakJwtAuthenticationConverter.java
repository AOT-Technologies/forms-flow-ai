package org.camunda.bpm.extension.keycloak.rest;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

public class KeycloakJwtAuthenticationConverter extends JwtAuthenticationConverter {
    public static final String PRINCIPAL_CLAIM_NAME = "preferred_username";
    public static final String AUTHORITY_PREFIX = "ROLE_";

    public KeycloakJwtAuthenticationConverter() {
        var grantedAuthoritiesConverter = new KeycloakRealmRolesGrantedAuthoritiesConverter();
        setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        setPrincipalClaimName(PRINCIPAL_CLAIM_NAME);
    }
}
