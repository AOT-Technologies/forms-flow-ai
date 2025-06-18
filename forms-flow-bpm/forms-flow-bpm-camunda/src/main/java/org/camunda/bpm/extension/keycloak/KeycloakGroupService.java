package org.camunda.bpm.extension.keycloak;

import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementation of group queries against Keycloak's REST API.
 */
public class KeycloakGroupService extends org.camunda.bpm.extension.keycloak.plugin.core.KeycloakGroupService {


	private static final Logger LOG = LoggerFactory.getLogger(KeycloakGroupService.class);
	
	public KeycloakGroupService(KeycloakConfiguration keycloakConfiguration, KeycloakRestTemplate restTemplate,
			KeycloakContextProvider keycloakContextProvider) {
		super(keycloakConfiguration, restTemplate, keycloakContextProvider);
	}

	/**
	 * Get the group ID of the configured admin group. Enable configuration using
	 * group path as well. This prevents common configuration pitfalls and makes it
	 * consistent to other configuration options like the flag
	 * 'useGroupPathAsCamundaGroupId'.
	 * 
	 * @param configuredAdminGroupName the originally configured admin group name
	 * @return the corresponding keycloak group ID to use: either internal keycloak
	 *         ID or path, depending on config
	 */
	public String getKeycloakAdminGroupId(String configuredAdminGroupName) {
		// here just return the name, without checking in keycloak. The original code
		// would break startup if the group doesn't exist.
		return configuredAdminGroupName;
	}

}
