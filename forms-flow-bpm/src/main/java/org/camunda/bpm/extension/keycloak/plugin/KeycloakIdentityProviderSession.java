/**
 * 
 */
package org.camunda.bpm.extension.keycloak.plugin;

import java.util.Collections;
import java.util.List;

import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.Tenant;
import org.camunda.bpm.engine.identity.TenantQuery;
import org.camunda.bpm.engine.identity.User;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.bpm.extension.keycloak.*;
import org.camunda.bpm.extension.keycloak.cache.QueryCache;
import org.camunda.bpm.extension.keycloak.rest.KeycloakRestTemplate;
import org.camunda.bpm.extension.keycloak.util.KeycloakPluginLogger;
import org.springframework.util.StringUtils;

/**
 * Keycloak Identity Provider Session.
 * Class for Keycloack identity provider session.
 */
public class KeycloakIdentityProviderSession
		extends org.camunda.bpm.extension.keycloak.KeycloakIdentityProviderSession {

	private CustomConfig config;
	private TenantService tenantService;
	protected QueryCache<CacheableKeycloakTenantQuery, List<Tenant>> tenantQueryCache;

	public KeycloakIdentityProviderSession(KeycloakConfiguration keycloakConfiguration,
			KeycloakRestTemplate restTemplate, KeycloakContextProvider keycloakContextProvider,
			QueryCache<CacheableKeycloakUserQuery, List<User>> userQueryCache,
			QueryCache<CacheableKeycloakGroupQuery, List<Group>> groupQueryCache,
			QueryCache<CacheableKeycloakTenantQuery, List<Tenant>> tenantQueryCache, 
			QueryCache<CacheableKeycloakCheckPasswordCall, Boolean> checkPasswordCache, CustomConfig config) {
		super(keycloakConfiguration, restTemplate, keycloakContextProvider, userQueryCache, groupQueryCache, checkPasswordCache);
		this.config = config;
		this.groupService = new KeycloakGroupService(keycloakConfiguration, restTemplate, keycloakContextProvider,
				config);
		this.userService = new KeycloakUserService(keycloakConfiguration, restTemplate, keycloakContextProvider,
				config);
		this.tenantService = new TenantService(restTemplate, keycloakContextProvider, config);
		this.tenantQueryCache = tenantQueryCache;
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
	 * 
	 * @see org.camunda.bpm.extension.keycloak.KeycloakGroupService#getKeycloakAdminGroupId(java.lang.String)
	 */
	public String getKeycloakAdminGroupId(String configuredAdminGroupName) {
		return groupService.getKeycloakAdminGroupId(configuredAdminGroupName);
	}

	/**
	 * find groups meeting given group query criteria (with cache lookup and post
	 * processing).
	 * 
	 * @param groupQuery the group query
	 * @return list of matching groups
	 */
	protected List<Group> findGroupByQueryCriteria(KeycloakGroupQuery groupQuery) {
		StringBuilder resultLogger = new StringBuilder();

		if (KeycloakPluginLogger.INSTANCE.isDebugEnabled()) {
			resultLogger.append("Keycloak group query results: [");
		}

		List<Group> allMatchingGroups = groupQueryCache.getOrCompute(CacheableKeycloakGroupQuery.of(groupQuery),
				this::doFindGroupByQueryCriteria);

		List<Group> processedGroups = groupService.postProcessResults(groupQuery, allMatchingGroups, resultLogger);

		if (KeycloakPluginLogger.INSTANCE.isDebugEnabled()) {
			resultLogger.append("]");
			KeycloakPluginLogger.INSTANCE.groupQueryResult(resultLogger.toString());
		}

		return processedGroups;
	}

	/**
	 * find all groups meeting given group query criteria (without cache lookup or
	 * post processing).
	 * 
	 * @param groupQuery the group query
	 * @return list of matching groups
	 */
	private List<Group> doFindGroupByQueryCriteria(CacheableKeycloakGroupQuery groupQuery) {
		if (StringUtils.hasLength(groupQuery.getUserId())) {
			// if restriction on userId is provided, we're searching within the groups of a
			// single user
			return groupService.requestGroupsByUserId(groupQuery);
		} else {
			return groupService.requestGroupsWithoutUserId(groupQuery);
		}
	}

	@Override
	public TenantQuery createTenantQuery() {
		return new CustomKeycloakTenantQuery(org.camunda.bpm.engine.impl.context.Context.getProcessEngineConfiguration()
				.getCommandExecutorTxRequired());
	}

	@Override
	public TenantQuery createTenantQuery(CommandContext commandContext) {
		return new CustomKeycloakTenantQuery();
	}

	protected long findTenantCountByQueryCriteria(CustomKeycloakTenantQuery tenantQuery) {
		return findTenantByQueryCriteria(tenantQuery).size();
	}

	private List<Tenant> doFindTenantByQueryCriteria(CacheableKeycloakTenantQuery tenantQuery) {
		if (!config.isEnableMultiTenancy()) {
			return Collections.emptyList();
		}
		return tenantService.requestTenantsByUserId(tenantQuery.getUserId());
	}

	protected List<Tenant> findTenantByQueryCriteria(CustomKeycloakTenantQuery tenantQuery) {

		List<Tenant> allMatchingTenants = tenantQueryCache.getOrCompute(CacheableKeycloakTenantQuery.of(tenantQuery),
				this::doFindTenantByQueryCriteria);

		return allMatchingTenants;
	}

	@Override
	public Tenant findTenantById(String id) {
		return createTenantQuery(org.camunda.bpm.engine.impl.context.Context.getCommandContext()).tenantId(id)
				.singleResult();
	}

}
