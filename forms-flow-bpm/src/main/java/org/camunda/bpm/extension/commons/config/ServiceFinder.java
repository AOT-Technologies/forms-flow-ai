package org.camunda.bpm.extension.commons.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.camunda.bpm.extension.hooks.rest.service.FilterRestService;
import org.camunda.bpm.extension.hooks.rest.service.impl.AdminRestServiceImpl;
import org.camunda.bpm.extension.hooks.rest.service.impl.FilterRestServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class ServiceFinder {

    private AdminRestService adminRestService;
    private FilterRestService filterRestService;

    public AdminRestService getAdminRestService() {
        return adminRestService;
    }

    public FilterRestService getFilterRestService() {
        return filterRestService;
    }

    @Bean
    public AdminRestService getAdminRestService(
            @Value("${plugin.identity.keycloak.administratorGroupName}") String adminGroupName,
            AuthorizationService authorizationService, RepositoryService repositoryService
    ){
        adminRestService =  new AdminRestServiceImpl(adminGroupName, authorizationService, repositoryService);
        return adminRestService;
    }

    @Bean
    public FilterRestService getFilterRestService(ObjectMapper objectMapper, ProcessEngine processEngine) {
        filterRestService =  new FilterRestServiceImpl(objectMapper, processEngine);
        return filterRestService;
    }
}
