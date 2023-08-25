package org.camunda.bpm.extension.commons.utils;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Data
@Component
@Validated
@NoArgsConstructor
@ConfigurationProperties
public class RestAPIBuilderConfigProperties {

    @Value("${spring.security.oauth2.client.provider.keycloak.user-name-attribute}")
    private String userNameAttribute;

}
