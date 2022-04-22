package org.camunda.bpm.extension.commons.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
public class AppConfig {

    @Value("${formsflow.ai.api.url}")
    private String API_BASE_URL;

    @Value("${formsflow.ai.formio.url}")
    private String FORM_BASE_URL;

    @PostConstruct
    public void init(){
        RestAPIBuilderUtil.getInstance(API_BASE_URL, FORM_BASE_URL);
    }

    @Bean
    public ObjectMapper objectMapper(){
        return new ObjectMapper();
    }
}
