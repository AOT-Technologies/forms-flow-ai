package org.camunda.bpm.extension.keycloak.showcase.rest;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * @author Carsten Buchberger
 */
@Component
public class KeycloakAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Value("${plugin.identity.keycloak.rest.authorityPrefix:}")
    private String authorityPrefix;

    @Value("${plugin.identity.keycloak.rest.authorityAttributeName:roles}")
    private String authorityAttributeName;

    public final AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        return new JwtAuthenticationToken(jwt, authorities);
    }

    public void setAuthorityPrefix(String authorityPrefix) {
        this.authorityPrefix = authorityPrefix;
    }

    public void setAuthorityAttributeName(String authorityAttributeName) {
        this.authorityAttributeName = authorityAttributeName;
    }

    protected Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        return this.getScopes(jwt).stream().map(authority -> authorityPrefix + authority)
                .map(SimpleGrantedAuthority::new).collect(Collectors.toList());
    }

    private Collection<String> getScopes(Jwt jwt) {

        Object scopes = jwt.getClaims().get(this.authorityAttributeName);
        if (scopes instanceof String) {
            if (StringUtils.hasText((String) scopes)) {
                return Arrays.asList(((String) scopes).split(" "));
            } else {
                return Collections.emptyList();
            }
        } else if (scopes instanceof Collection) {
            return (Collection<String>) scopes;
        }

        return Collections.emptyList();
    }
}