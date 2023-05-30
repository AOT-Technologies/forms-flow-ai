package org.camunda.bpm.extension.hooks.rest.service.impl;

import com.nimbusds.jose.shaded.json.JSONArray;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.authorization.Permissions;
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.authorization.Resources;
import org.camunda.bpm.engine.impl.persistence.entity.AuthorizationEntity;
import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.rest.service.AdminRestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import javax.servlet.ServletException;
import java.io.IOException;
import java.util.*;

import static org.camunda.bpm.engine.authorization.Authorization.AUTH_TYPE_GRANT;

public class AdminRestServiceImpl implements AdminRestService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminRestServiceImpl.class);

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
    public Mono<ResponseEntity<AuthorizationInfo>> getFormAuthorization() throws ServletException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LOGGER.debug("authentication" + authentication);
        List<String> groups = getGroups(authentication);
        AuthorizationInfo authorizationInfo = null;

        if (CollectionUtils.isNotEmpty(groups) && groups.contains(adminGroupName)) {
            authorizationInfo = new AuthorizationInfo(true, null);
        } else {
            authorizationInfo = new AuthorizationInfo(false, getAuthorization(groups));
        }
        return Mono.just(ResponseEntity.ok(authorizationInfo));
    }

    @Override
    public void createTenant(TenantAuthorizationDto dto) throws ServletException {

        LOGGER.info("Creating authorizations for tenant");
        String tenantKey = dto.getTenantKey();
        // Administrator gets access to the tasklist and cockpit.
        for (String adminRole : dto.getAdminRoles()) {
            createAuthorization(tenantKey, adminRole, Resources.APPLICATION, "tasklist");
            createAuthorization(tenantKey, adminRole, Resources.APPLICATION, "cockpit");
            createAuthorization(tenantKey, adminRole, Resources.PROCESS_DEFINITION, "*");
            createAuthorization(tenantKey, adminRole, Resources.PROCESS_INSTANCE, "*");
            createAuthorization(tenantKey, adminRole, Resources.TASK, "*");
            createAuthorization(tenantKey, adminRole, Resources.TENANT, tenantKey);
            createAuthorization(tenantKey, adminRole, Resources.DEPLOYMENT, "*");
            createAuthorization(tenantKey, adminRole, Resources.FILTER, "*");
            createAuthorization(tenantKey, adminRole, Resources.DECISION_DEFINITION, "*");
            createAuthorization(tenantKey, adminRole, Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        }

        // Client authorizations
        for (String clientRole : dto.getClientRoles()) {
            createAuthorization(tenantKey, clientRole, Resources.PROCESS_DEFINITION, "*");
            createAuthorization(tenantKey, clientRole, Resources.PROCESS_INSTANCE, "*");
            createAuthorization(tenantKey, clientRole, Resources.TENANT, tenantKey);
            createAuthorization(tenantKey, clientRole, Resources.AUTHORIZATION, "*");
            createAuthorization(tenantKey, clientRole, Resources.DECISION_DEFINITION, "*");
            createAuthorization(tenantKey, clientRole, Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        }

        // Designer authorizations
        for (String designerRole : dto.getDesignerRoles()) {
            createAuthorization(tenantKey, designerRole, Resources.PROCESS_DEFINITION, "*");
            createAuthorization(tenantKey, designerRole, Resources.PROCESS_INSTANCE, "*");
            createAuthorization(tenantKey, designerRole, Resources.TENANT, tenantKey);
            createAuthorization(tenantKey, designerRole, Resources.DEPLOYMENT, "*");
            createAuthorization(tenantKey, designerRole, Resources.DECISION_DEFINITION, "*");
            createAuthorization(tenantKey, designerRole, Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        }

        // Reviewer authorizations
        for (String reviewerRole : dto.getReviewerRoles()) {
            createAuthorization(tenantKey, reviewerRole, Resources.PROCESS_DEFINITION, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.PROCESS_INSTANCE, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.TASK, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.TENANT, tenantKey);
            createAuthorization(tenantKey, reviewerRole, Resources.FILTER, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.USER, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.AUTHORIZATION, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.DECISION_DEFINITION, "*");
            createAuthorization(tenantKey, reviewerRole, Resources.DECISION_REQUIREMENTS_DEFINITION, "*");
        }
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
        JSONArray groups = (JSONArray) claims.get(claimName);
        for (Object group1 : groups) {
            String groupName = group1.toString();
            if (StringUtils.startsWith(groupName, "/")) {
                groupIds.add(StringUtils.substring(groupName, 1));
            } else {
                if (tenantKey != null)
                    groupName = tenantKey + "-" + groupName;
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
        List<org.camunda.bpm.engine.authorization.Authorization> authorizations = ProcessEngines.getDefaultProcessEngine().getAuthorizationService().createAuthorizationQuery()
                .resourceType(Resources.PROCESS_DEFINITION.resourceType())
                .hasPermission(ProcessDefinitionPermissions.CREATE_INSTANCE)
                .groupIdIn(groupIds).list();
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
        authEntity.setGroupId(tenantKey + "-" + role);
        authEntity.addPermission(Permissions.ALL);
        authEntity.setResourceId(resourceId);
        authEntity.setResourceType(resourceType.resourceType());
        this.authService.saveAuthorization(authEntity);
    }
}
