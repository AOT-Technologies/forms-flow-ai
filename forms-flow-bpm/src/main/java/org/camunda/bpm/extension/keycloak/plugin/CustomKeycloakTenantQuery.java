package org.camunda.bpm.extension.keycloak.plugin;

import java.util.List;

import org.camunda.bpm.engine.identity.Tenant;
import org.camunda.bpm.engine.impl.Page;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.bpm.engine.impl.interceptor.CommandExecutor;
import org.camunda.bpm.extension.keycloak.KeycloakTenantQuery;

public class CustomKeycloakTenantQuery extends KeycloakTenantQuery {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public CustomKeycloakTenantQuery() {
		super();
	}

	public CustomKeycloakTenantQuery(CommandExecutor commandExecutor) {
		super(commandExecutor);
	}

	@Override
	public long executeCount(CommandContext commandContext) {
		final org.camunda.bpm.extension.keycloak.plugin.KeycloakIdentityProviderSession identityProvider = getKeycloakIdentityProvider(
				commandContext);
		return identityProvider.findTenantCountByQueryCriteria(this);
	}

	@Override
	public List<Tenant> executeList(CommandContext commandContext, Page page) {
		final org.camunda.bpm.extension.keycloak.plugin.KeycloakIdentityProviderSession identityProvider = getKeycloakIdentityProvider(
				commandContext);
		return identityProvider.findTenantByQueryCriteria(this);
	}

	protected org.camunda.bpm.extension.keycloak.plugin.KeycloakIdentityProviderSession getKeycloakIdentityProvider(
			CommandContext commandContext) {
		return (org.camunda.bpm.extension.keycloak.plugin.KeycloakIdentityProviderSession) commandContext
				.getReadOnlyIdentityProvider();
	}

}
