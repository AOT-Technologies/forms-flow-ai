package org.camunda.bpm.extension.keycloak.plugin;

import java.util.Objects;

/**
 * Cacheable Keycloak Tenant Query.
 * Immutable wrapper over KeycloakGroupQuery that can be used as a cache key.
 * Note: keep equals/hashcode in sync with the list of fields
 */
public class CacheableKeycloakTenantQuery {

	private final String id;
	private final String name;
	private final String userId;

	private CacheableKeycloakTenantQuery(CustomKeycloakTenantQuery delegate) {
		this.id = delegate.getId();
		this.name = delegate.getName();
		this.userId = delegate.getUserId();
	}

	public static CacheableKeycloakTenantQuery of(CustomKeycloakTenantQuery tenantQuery) {
		return new CacheableKeycloakTenantQuery(tenantQuery);
	}

	public String getId() {
		return id;
	}

	public String getName() {
		return name;
	}
	
	public String getUserId() {
		return userId;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		CacheableKeycloakTenantQuery that = (CacheableKeycloakTenantQuery) o;
		return Objects.equals(id, that.id) && Objects.equals(name, that.name);
	}

	@Override
	public int hashCode() {
		int result = Objects.hash(id, name);
		return result;
	}
}
