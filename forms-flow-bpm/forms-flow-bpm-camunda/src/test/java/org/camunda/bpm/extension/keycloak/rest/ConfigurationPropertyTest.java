package org.camunda.bpm.extension.keycloak.rest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Configuration Property Test.
 * Test class for ConfigurationProperty.
 */
@ExtendWith(SpringExtension.class)
public class ConfigurationPropertyTest {

    /*@Autowired
    private RestApiSecurityConfigurationProperties configProps;

    @Test
    void test_restapisecurityconfig_propertybinding() {
        assertEquals("keycloak", configProps.getProvider());
        assertEquals("camunda-rest-api", configProps.getRequiredAudience());
        assertEquals(true, configProps.getEnabled());
    }

    @EnableConfigurationProperties(RestApiSecurityConfigurationProperties.class)
    public static class RestApiSecurityConfigurationPropertiesTest {
        // nothing
    }*/
}
