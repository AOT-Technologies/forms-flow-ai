package org.camunda.bpm.extension.keycloak.rest;

import net.minidev.json.JSONArray;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.Assert;

import java.util.*;
import java.util.stream.Collectors;

public class KeycloakRealmRolesGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private String authorityPrefix = "";

    public KeycloakRealmRolesGrantedAuthoritiesConverter() {
    }

    public KeycloakRealmRolesGrantedAuthoritiesConverter setAuthorityPrefix(String authorityPrefix) {
        Assert.notNull(authorityPrefix, "authorityPrefix cannot be null");
        this.authorityPrefix = authorityPrefix;
        return this;
    }

    /**
     * Get authorities from the {@code realm_access.roles} jwt claim
     *
     * @param source the source object to convert, which must be an instance of {@link Jwt} (never {@code null})
     * @return collection of {@link GrantedAuthority}
     */
    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        String tenantKey = source.getClaim("tenantKey");


        var rolesCollection = getUserGroups(source, tenantKey);

        return rolesCollection.stream()
                .filter(String.class::isInstance) // The realm_access.role is supposed to be a list of string, for good measure we double-check that
                .map(x -> new SimpleGrantedAuthority(authorityPrefix + x))
                .collect(Collectors.toSet());
    }

    /**
     * Retrieves groups for given userId
     *
     * @param userId
     * @param claims
     * @return
     */
    private List<String> getUserGroups(Jwt source, String tenantKey) {
        List<String> groupIds = new ArrayList<>();
        List<String> groups = source.getClaim("groups");
        List<String> roles = source.getClaim("roles");
        if ( groups!= null) {
            for (String group : groups) {
                String trimmed = StringUtils.contains(group, "/") ? StringUtils.substringAfter(group, "/") : group;
                groupIds.add(trimmed);
            }
        } else if (roles != null) { // Treat roles as alternative to groups
            for (String role : roles) {
                String trimmed = StringUtils.contains(role, "/") ? StringUtils.substringAfter(role, "/") : role;
                if (tenantKey != null) {
                    trimmed = tenantKey + "-" + trimmed;
                    groupIds.add("TENANT_"+tenantKey);
                }
                groupIds.add(trimmed);
            }
        }
        return groupIds;
    }


}