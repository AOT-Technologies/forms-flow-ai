package org.camunda.bpm.extension.hooks.rest.service.impl;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.authorization.Permissions;
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.authorization.Resources;
import org.camunda.bpm.engine.impl.persistence.entity.AuthorizationEntity;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderConfigProperties;
import org.camunda.bpm.extension.commons.utils.RestAPIBuilderUtil;
import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.*;

import static org.camunda.bpm.engine.authorization.Authorization.AUTH_TYPE_GRANT;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.ANONYMOUS_USER;

public class AdminRestServiceImpl implements AdminRestService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminRestServiceImpl.class);

    @Autowired
    private RestAPIBuilderConfigProperties restAPIBuilderConfigProperties;

    private final String adminGroupName;
    private final AuthorizationService authService;
    private final RepositoryService repoService;

    public AdminRestServiceImpl(
            String adminGroupName, AuthorizationService authorizationService, RepositoryService repositoryService
    ) {
        this.adminGroupName = adminGroupName;
        this.authService = authorizationService;
        this.repoService = repositoryService;
    }

    @Override
    public AuthorizationInfo getFormAuthorization() throws ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LOGGER.debug("authentication" + authentication);
        List<String> groups = getGroups(authentication);
        AuthorizationInfo authorizationInfo = null;
        if (groups != null && !groups.isEmpty() && groups.contains(adminGroupName)) {
            if (!RestAPIBuilderUtil.fetchUserName(restAPIBuilderConfigProperties.getUserNameAttribute()).equals(ANONYMOUS_USER)) {
                groups = null;
            }
            authorizationInfo = fetchAuthorizationInfo(true, groups);
        } else {
            authorizationInfo = fetchAuthorizationInfo(false, groups);
        }
        return ResponseEntity.ok(authorizationInfo).getBody();
    }

    private AuthorizationInfo fetchAuthorizationInfo(boolean adminGroupEnabled, List<String> groups){
        return new AuthorizationInfo(adminGroupEnabled, groups!=null ? getAuthorization(groups) : null);
    }

    @Override
    public void createTenant(TenantAuthorizationDto dto) throws ServletException {

        LOGGER.info("Creating authorizations for tenant");
        String tenantKey = dto.getTenantKey();
        // Add all the roles with correct authorizations for multi tenancy
        // for camunda-admin, group name would start with tenantKey. For other users, it's a REST operation and role is retrieved from token.
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.APPLICATION, "tasklist");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.APPLICATION, "cockpit");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.PROCESS_DEFINITION, "*");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.PROCESS_INSTANCE, "*");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.TASK, "*");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.TENANT, tenantKey);
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.DEPLOYMENT, "*");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.FILTER, "*");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.DECISION_DEFINITION, "*");
        createAuthorization(tenantKey, tenantKey+"-camunda-admin", Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        
        // Client role
        createAuthorization(tenantKey, "ROLE_create_submissions", Resources.PROCESS_DEFINITION, "*");
        createAuthorization(tenantKey, "ROLE_create_submissions", Resources.PROCESS_INSTANCE, "*");
        createAuthorization(tenantKey, "ROLE_create_submissions", Resources.TENANT, tenantKey);
        createAuthorization(tenantKey, "ROLE_create_submissions", Resources.AUTHORIZATION, "*");
        createAuthorization(tenantKey, "ROLE_create_submissions", Resources.DECISION_DEFINITION, "*");
        createAuthorization(tenantKey, "ROLE_create_submissions", Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        
        // Designer
        createAuthorization(tenantKey, "ROLE_view_designs", Resources.PROCESS_DEFINITION, "*");
        createAuthorization(tenantKey, "ROLE_view_designs", Resources.PROCESS_INSTANCE, "*");
        createAuthorization(tenantKey, "ROLE_view_designs", Resources.TENANT, tenantKey);
        createAuthorization(tenantKey, "ROLE_view_designs", Resources.DEPLOYMENT, "*");
        createAuthorization(tenantKey, "ROLE_view_designs", Resources.DECISION_DEFINITION, "*");
        createAuthorization(tenantKey, "ROLE_view_designs", Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        
        // Reviewer
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.PROCESS_DEFINITION, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.PROCESS_INSTANCE, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.TASK, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.TENANT, tenantKey);
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.FILTER, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.USER, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.AUTHORIZATION, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.DECISION_DEFINITION, "*");
        createAuthorization(tenantKey, "ROLE_view_tasks", Resources.DECISION_REQUIREMENTS_DEFINITION, "*");

        LOGGER.info("Finished creating authorizations for tenant");
    }

    @Override
    public void createTenantDeployment(String tenantKey, MultipartFile file) {

        LOGGER.info("Deploying " + file.getOriginalFilename() + "; for Tenant " + tenantKey);
        try {
            this.repoService.createDeployment().tenantId(tenantKey)
                    .addInputStream(file.getOriginalFilename(), file.getInputStream()).deploy();
        } catch (IOException e) {
            LOGGER.error("Error deploying definition " + e);
            throw new ApplicationServiceException("Error while deploying process for tenant " + tenantKey);
        }
        LOGGER.info("Deployed " + file.getOriginalFilename() + "; for Tenant " + tenantKey);
    }

    /**
     * Return groups associated with authentication object.
     *
     * @param authentication
     * @return
     */
    private List<String> getGroups(Authentication authentication) throws ServletException {

        Map<String, Object> claims;
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            claims = jwtAuthenticationToken.getToken().getClaims();
        } else if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            claims = oidcUser.getClaims();
        } else {
            throw new ServletException("Invalid authentication request token");
        }
        String tenantKey = null;
        if (claims != null && claims.containsKey("tenantKey")) {
            tenantKey = claims.get("tenantKey").toString();
        }
        List<String> groupIds = null;
        if (claims != null && claims.containsKey("groups")) {
            groupIds = getKeyValues(claims, "groups", null);
        } else if (claims != null && claims.containsKey("roles")) {
            groupIds = getKeyValues(claims, "roles", tenantKey);
        }
        return groupIds;
    }

    private List<String> getKeyValues(Map<String, Object> claims, String claimName, String tenantKey) {
        List<String> groupIds = new ArrayList<String>();
        for (Object group1 : (List<String>) claims.get(claimName)){
            String groupName = group1.toString();
            if (StringUtils.startsWith(groupName, "/")) {
                groupIds.add(StringUtils.substring(groupName, 1));
            } else {
//                if (tenantKey != null)
//                    groupName = tenantKey + "-" + groupName;
                groupIds.add(groupName);
            }
        }
        return groupIds;
    }


    /**
     * This method returns all authorization details of Groups.
     *
     * @param groups
     * @return
     */
    private Set<Authorization> getAuthorization(List<String> groups) {
    	LOGGER.debug("getAuthorization>>");
        Set<Authorization> authorizationList = new HashSet<>();
        String[] groupIds = groups.size() > 0 ? groups.toArray(new String[0]) : new String[]{};

        List<org.camunda.bpm.engine.authorization.Authorization> authorizations;
        if (RestAPIBuilderUtil.fetchUserName(restAPIBuilderConfigProperties.getUserNameAttribute()).equals(ANONYMOUS_USER)) {
            authorizations = ProcessEngines.getDefaultProcessEngine()
                    .getAuthorizationService()
                    .createAuthorizationQuery()
                    .resourceType(Resources.PROCESS_DEFINITION.resourceType())
                    .list();
        } else {
            authorizations = ProcessEngines.getDefaultProcessEngine()
                    .getAuthorizationService()
                    .createAuthorizationQuery()
                    .resourceType(Resources.PROCESS_DEFINITION.resourceType())
                    .hasPermission(ProcessDefinitionPermissions.CREATE_INSTANCE)
                    .groupIdIn(groupIds)
                    .list();
        }
        LOGGER.info(" authorizations {}", authorizations);
        authorizations.forEach(authorization -> {
            Authorization auth = new Authorization(authorization.getGroupId(), authorization.getUserId(), authorization.getResourceId());
            authorizationList.add(auth);
        });
        LOGGER.debug(" authorizationList {}", authorizationList);
        return authorizationList;
    }

    /**
     * Create authorization entity.
     *
     * @param tenantKey
     * @param role
     * @param resourceType
     * @param resourceId
     */
    private void createAuthorization(String tenantKey, String role, Resources resourceType, String resourceId) {
        AuthorizationEntity authEntity = new AuthorizationEntity();
        authEntity.setAuthorizationType(AUTH_TYPE_GRANT);
        authEntity.setGroupId(/*tenantKey + "-" +*/ role);
        authEntity.addPermission(Permissions.ALL);
        authEntity.setResourceId(resourceId);
        authEntity.setResourceType(resourceType.resourceType());
        this.authService.saveAuthorization(authEntity);
    }
}