/**
 * 
 */
package org.camunda.bpm.extension.keycloak.plugin;

import java.util.List;

import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakGroupQuery;
import org.camunda.bpm.extension.keycloak.CacheableKeycloakUserQuery;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.camunda.bpm.extension.keycloak.KeycloakContextProvider;
import org.camunda.bpm.extension.keycloak.cache.QueryCache;
import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;

/**
 * @author aot
 *
 */
public class KeycloakIdentityProviderSession
		extends org.camunda.bpm.extension.keycloak.KeycloakIdentityProviderSession {

	public KeycloakIdentityProviderSession(KeycloakConfiguration keycloakConfiguration,
			KeycloakRestTemplate restTemplate, KeycloakContextProvider keycloakContextProvider,
			QueryCache<CacheableKeycloakUserQuery, List<User>> userQueryCache,
			QueryCache<CacheableKeycloakGroupQuery, List<Group>> groupQueryCache,
			String webClientId, boolean enableClientAuth) {
		super(keycloakConfiguration, restTemplate, keycloakContextProvider, userQueryCache, groupQueryCache);
		this.groupService = new  KeycloakGroupService(keycloakConfiguration, restTemplate, keycloakContextProvider, webClientId, enableClientAuth);
	}

	/**
	 * Get the group ID of the configured admin group. Enable configuration using group path as well.
	 * This prevents common configuration pitfalls and makes it consistent to other configuration options
	 * like the flag 'useGroupPathAsCamundaGroupId'.
	 * 
	 * @param configuredAdminGroupName the originally configured admin group name
	 * @return the corresponding keycloak group ID to use: either internal keycloak ID or path, depending on config
	 * 
	 * @see org.camunda.bpm.extension.keycloak.KeycloakGroupService#getKeycloakAdminGroupId(java.lang.String)
	 */
	public String getKeycloakAdminGroupId(String configuredAdminGroupName) {
		return groupService.getKeycloakAdminGroupId(configuredAdminGroupName);
	}
	
}
