package org.camunda.bpm.extension.keycloak.plugin;

import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.authorization.Authorization;
import org.camunda.bpm.engine.authorization.AuthorizationQuery;
import org.camunda.bpm.engine.authorization.Permissions;
import org.camunda.bpm.engine.authorization.Resources;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;


@Component
public class CamundaAuthorizationInitializer {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(CamundaAuthorizationInitializer.class);

    @Autowired
    private CamundaAuthorizationProperties authorizationProperties;

    @Autowired
    private ProcessEngine processEngine;
    
    @Value("${plugin.identity.keycloak.enableMultiTenancy}")
	private boolean enableMultiTenancy;

    @PostConstruct
    public void initializeAuthorizations() {
    	if (!enableMultiTenancy) {
	        AuthorizationService authorizationService = processEngine.getAuthorizationService();
	
	        for (CamundaAuthorizationProperties.AuthorizationConfig config : authorizationProperties.getAuthorizations()) {
	            // Check if the authorization already exists
	        	for (String resourceType : config.getResourceType().split(",") ) {
	        		AuthorizationQuery query = authorizationService.createAuthorizationQuery()
	                        .resourceType(Resources.valueOf(resourceType))
	                        .resourceId(config.getResourceId());
	
	                if (config.getGroupId() != null) {
	                    query.groupIdIn(config.getGroupId());
	                } else if (config.getUserId() != null) {
	                    query.userIdIn(config.getUserId());
	                }
	
	                // Check if there is any matching authorization
	                Authorization existingAuthorization = query.singleResult();
	
	                if (existingAuthorization == null) {
	                    // Create a new authorization if none exists
	                    Authorization authorization = authorizationService.createNewAuthorization(Authorization.AUTH_TYPE_GRANT);
	
	                    if (config.getGroupId() != null) {
	                        authorization.setGroupId(config.getGroupId());
	                    } else if (config.getUserId() != null) {
	                        authorization.setUserId(config.getUserId());
	                    }
	
	                    authorization.setResource(Resources.valueOf(resourceType));
	                    authorization.setResourceId(config.getResourceId());
	
	                    for (String perm : config.getPermissions()) {
	                        authorization.addPermission(Permissions.valueOf(perm));
	                    }
	
	                    authorizationService.saveAuthorization(authorization);
	                } else {
	                	LOGGER.info("Authorization already exists for: " + (config.getGroupId() != null ? "Group " + config.getGroupId() : "User " + config.getUserId()));
	                }
	        	}
	            
	        }
    	}
    }
}