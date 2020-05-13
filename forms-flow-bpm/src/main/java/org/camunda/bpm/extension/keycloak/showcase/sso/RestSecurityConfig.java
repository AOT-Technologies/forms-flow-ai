package org.camunda.bpm.extension.keycloak.showcase.sso;


import org.camunda.bpm.extension.keycloak.showcase.filter.StatelessUserAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;

import javax.ws.rs.HttpMethod;


@Configuration
@EnableWebSecurity
@Order(SecurityProperties.BASIC_AUTH_ORDER - 25)
public class RestSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private StatelessUserAuthenticationFilter statelessUserAuthenticationFilter;

    @Autowired
    KeycloakAuthenticationConverter kcAuthenticationConverter;



    @Override
    public void configure(final HttpSecurity http) throws Exception {
        http.cors().and().requestMatchers().antMatchers("/engine-rest/**").
                and().authorizeRequests().antMatchers(HttpMethod.OPTIONS,"/engine-rest/**").permitAll()
                .anyRequest().authenticated().and().csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and().oauth2ResourceServer()
                .jwt().jwtAuthenticationConverter(grantedAuthoritiesExtractor());
    }

    Converter<Jwt, AbstractAuthenticationToken> grantedAuthoritiesExtractor() {
        return this.kcAuthenticationConverter;
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    @Bean
    public FilterRegistrationBean kcStatelessUserAuthenticationFilter() {
        FilterRegistrationBean filterRegistration = new FilterRegistrationBean();
        filterRegistration.setFilter(statelessUserAuthenticationFilter);
        filterRegistration.setOrder(103); // make sure the filter is registered after the Spring Security Filter Chain
        filterRegistration.addUrlPatterns("/engine-rest/*");
        return filterRegistration;
    }

}