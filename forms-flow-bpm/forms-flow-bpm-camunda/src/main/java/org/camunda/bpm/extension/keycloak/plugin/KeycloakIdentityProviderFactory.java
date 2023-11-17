/**
 * 
 */
package org.camunda.bpm.extension.keycloak.plugin;

import java.util.List;

import org.camunda.bpm.engine.identity.Tenant;
import org.camunda.bpm.engine.impl.interceptor.Session;
import org.camunda.bpm.extension.keycloak.KeycloakConfiguration;
import org.camunda.bpm.extension.keycloak.cache.CacheConfiguration;
import org.camunda.bpm.extension.keycloak.cache.CacheFactory;
import org.camunda.bpm.extension.keycloak.cache.QueryCache;
import org.springframework.http.client.ClientHttpRequestInterceptor;

/**
 * Keycloak Identity Provider Factory.
 * Custom Keycloak Identity Provider Session Factory.
 */
public class KeycloakIdentityProviderFactory
		extends org.camunda.bpm.extension.keycloak.KeycloakIdentityProviderFactory {

	private CustomConfig config;
	protected QueryCache<CacheableKeycloakTenantQuery, List<Tenant>> tenantQueryCache;

	public KeycloakIdentityProviderFactory(KeycloakConfiguration keycloakConfiguration,
			List<ClientHttpRequestInterceptor> customHttpRequestInterceptors, CustomConfig config) {
		super(keycloakConfiguration, customHttpRequestInterceptors);
		this.config = config;

		CacheConfiguration cacheConfiguration = CacheConfiguration.from(keycloakConfiguration);

		this.setTenantQueryCache(CacheFactory.create(cacheConfiguration));
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public Session openSession() {
		return new KeycloakIdentityProviderSession(keycloakConfiguration, restTemplate, keycloakContextProvider,
				userQueryCache, groupQueryCache, tenantQueryCache, checkPasswordCache, this.config);
	}

	public QueryCache<CacheableKeycloakTenantQuery, List<Tenant>> getTenantQueryCache() {
		return tenantQueryCache;
	}

	public void setTenantQueryCache(QueryCache<CacheableKeycloakTenantQuery, List<Tenant>> tenantQueryCache) {
		this.tenantQueryCache = tenantQueryCache;
	}
}
