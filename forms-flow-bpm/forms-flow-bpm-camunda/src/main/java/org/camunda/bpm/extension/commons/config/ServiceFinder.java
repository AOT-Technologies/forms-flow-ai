package org.camunda.bpm.extension.commons.config;

import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.camunda.bpm.extension.hooks.rest.service.impl.AdminRestServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class ServiceFinder {

    private AdminRestService adminRestService;

    public AdminRestService getAdminRestService() {
        return adminRestService;
    }

    @Bean
    public AdminRestService getAdminRestService(
            @Value("${plugin.identity.keycloak.administratorGroupName}") String adminGroupName,
            AuthorizationService authorizationService, RepositoryService repositoryService
    ){
        adminRestService =  new AdminRestServiceImpl(adminGroupName, authorizationService, repositoryService);
        return adminRestService;
    }
}
