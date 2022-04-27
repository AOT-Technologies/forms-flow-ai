package org.camunda.bpm.extension.hooks.controllers;

import static org.camunda.bpm.engine.authorization.Authorization.AUTH_TYPE_GRANT;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Resource;
import javax.servlet.ServletException;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.authorization.Permissions;
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.authorization.Resources;
import org.camunda.bpm.engine.impl.persistence.entity.AuthorizationEntity;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizedAction;
import org.camunda.bpm.extension.hooks.controllers.data.TenantAuthorizationDto;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;

import net.minidev.json.JSONArray;

/**
 * This class assist with admin operations of formsflow.ai: Giving all authorized form details
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Controller
public class AdminController {

    private static final Logger LOGGER = Logger.getLogger(AdminController.class.getName());

    @Value("${plugin.identity.keycloak.administratorGroupName}")
    private String adminGroupName;

    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.api.url}")
    private String formsflowApiUrl;
    
    @Autowired
	private AuthorizationService authorizationService;

	@Autowired
	private RepositoryService repositoryService;
	

    @GetMapping(value = "/engine-rest-ext/form/authorization", produces = MediaType.APPLICATION_JSON_VALUE)
    private @ResponseBody AuthorizationInfo getFormAuthorization() throws ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> groups = getGroups(authentication);
        AuthorizationInfo authorizationInfo = null;

        if (CollectionUtils.isNotEmpty(groups) && groups.contains(adminGroupName)) {
            authorizationInfo = new AuthorizationInfo(true, null);
        } else {
            authorizationInfo = new AuthorizationInfo(false, getAuthorization(groups));
        }
        return authorizationInfo;
    }

    @Deprecated
    @RequestMapping(value = "/engine-rest-ext/form", method = RequestMethod.GET, produces = "application/json")
    private @ResponseBody List<AuthorizedAction> getForms() throws ServletException,  ApplicationServiceException{
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> groups = getGroups(authentication);
        Set<Authorization> authorizationList =  getAuthorization(groups);
        List<AuthorizedAction> formList = new ArrayList<>();
        List<AuthorizedAction> filteredList = new ArrayList<>();
        try {
            ResponseEntity<String> response = httpServiceInvoker.execute(formsflowApiUrl + "/form", HttpMethod.GET, null);
            if (response.getStatusCode().value() == HttpStatus.OK.value()) {
                JsonNode jsonNode = bpmObjectMapper.readTree(response.getBody());
                if (jsonNode.get("totalCount") != null && jsonNode.get("totalCount").asInt() > 0) {
                    JsonNode arrayNode = jsonNode.get("forms");
                    if (arrayNode.isArray()) {
                        for (JsonNode formNode : arrayNode) {
                            AuthorizedAction action = new AuthorizedAction();
                            action.setFormId(formNode.get("formId").asText());
                            action.setFormName(formNode.get("formName").asText());
                            action.setProcessKey(formNode.get("processKey").asText());
                            formList.add(action);
                        }
                    }

                }
                if(CollectionUtils.isNotEmpty(groups) && groups.contains(adminGroupName)) {
                    for(AuthorizedAction formObj : formList) {
                        if(!isExists(filteredList, formObj.getFormId())) {
                            filteredList.add(formObj);
                        }

                    }
                } else {
                    for (Authorization authObj : authorizationList) {
                        for (AuthorizedAction formObj : formList) {
                            if (("*".equals(authObj.getResourceId()) || authObj.getResourceId().equals(formObj.getProcessKey())) && !isExists(filteredList, formObj.getFormId()))  {
                                filteredList.add(formObj);
                            }
                        }
                    }
                }
            }else{
                LOGGER.log(Level.SEVERE, "Error while processing form data");
                throw new ApplicationServiceException("Error while processing form data");
            }
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE, "Exception occurred in reading form", e);
            throw new ApplicationServiceException("Exception occurred in reading form", e);
        }
        return filteredList;
    }
    
	/**
	 * Create all authorizations needed for tenant.
	 * 
	 * @param dto
	 * @throws ServletException
	 */
	@RequestMapping(value = "/engine-rest-ext/tenant/authorization", method = RequestMethod.POST, produces = "application/json")
	private @ResponseBody void createTenant(@RequestBody TenantAuthorizationDto dto) throws ServletException {
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
		}

		// Client authorizations
		for (String clientRole : dto.getClientRoles()) {
			createAuthorization(tenantKey, clientRole, Resources.PROCESS_DEFINITION, "*");
			createAuthorization(tenantKey, clientRole, Resources.PROCESS_INSTANCE, "*");
			createAuthorization(tenantKey, clientRole, Resources.TENANT, tenantKey);
		}

		// Designer authorizations
		for (String designerRole : dto.getDesignerRoles()) {
			createAuthorization(tenantKey, designerRole, Resources.PROCESS_DEFINITION, "*");
			createAuthorization(tenantKey, designerRole, Resources.PROCESS_INSTANCE, "*");
			createAuthorization(tenantKey, designerRole, Resources.TENANT, tenantKey);
		}

		// Reviewer authorizations
		for (String reviewerRole : dto.getReviewerRoles()) {
			createAuthorization(tenantKey, reviewerRole, Resources.PROCESS_DEFINITION, "*");
			createAuthorization(tenantKey, reviewerRole, Resources.PROCESS_INSTANCE, "*");
			createAuthorization(tenantKey, reviewerRole, Resources.TASK, "*");
			createAuthorization(tenantKey, reviewerRole, Resources.TENANT, tenantKey);
			createAuthorization(tenantKey, reviewerRole, Resources.FILTER, "*");
		}
		LOGGER.info("Finished creating authorizations for tenant");

	}

	/**
	 * Create a deployment at the tenant level.
	 * 
	 * @param tenantKey
	 * @param file
	 * @throws ServletException
	 */
	@RequestMapping(value = "/engine-rest-ext/tenant/{tenantKey}/deployment", method = RequestMethod.POST, produces = "application/json", consumes = {
			MediaType.MULTIPART_FORM_DATA_VALUE })
	private @ResponseBody void createTenantDeployment(@PathVariable("tenantKey") String tenantKey,
			@RequestParam("file") MultipartFile file) throws ServletException {
		LOGGER.info("Deploying " + file.getOriginalFilename() + "; for Tenant " + tenantKey);
		try {
			this.repositoryService.createDeployment().tenantId(tenantKey)
					.addInputStream(file.getOriginalFilename(), file.getInputStream()).deploy();
		} catch (IOException e) {
			LOGGER.severe("Error deploying definition " + e);
			throw new ApplicationServiceException("Error while deploying process for tenant " + tenantKey);
		}
		LOGGER.info("Deployed " + file.getOriginalFilename() + "; for Tenant " + tenantKey);
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
		this.authorizationService.saveAuthorization(authEntity);
	}


    /**
     * Utility method to avoid duplicate form entry in response.
     *
     * @param filteredList
     * @param formId
     * @return
     */
    private boolean isExists(List<AuthorizedAction> filteredList, String formId) {
        for(AuthorizedAction entry : filteredList) {
            if(entry.getFormId().equals(formId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Return groups associated with authentication object.
     * @param authentication
     * @return
     */
    private List<String> getGroups(Authentication authentication) throws ServletException {

        Map<String, Object> claims;
        if (authentication instanceof JwtAuthenticationToken) {
            claims = ((JwtAuthenticationToken)authentication).getToken().getClaims();
        } else if (authentication.getPrincipal() instanceof OidcUser) {
            claims = ((OidcUser)authentication.getPrincipal()).getClaims();
        } else {
            throw new ServletException("Invalid authentication request token");
        }
        String tenantKey = null;
		if (claims != null && claims.containsKey("tenantKey")) {
			tenantKey = claims.get("tenantKey").toString();
		}
        List<String> groupIds = null;
        if(claims != null && claims.containsKey("groups")) {
            groupIds = getKeyValues(claims, "groups", null);
        } else if (claims != null && claims.containsKey("roles")) {
            groupIds = getKeyValues(claims, "roles", tenantKey);
        }
        return groupIds;
    }

    private List<String> getKeyValues(Map<String, Object> claims, String claimName, String tenantKey) {
        List<String> groupIds = new ArrayList<String>();
        JSONArray groups = (JSONArray)claims.get(claimName);
        for (Object group1 : groups) {
            String groupName = group1.toString();
            if(StringUtils.startsWith(groupName,"/")) {
                groupIds.add(StringUtils.substring(groupName,1));
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
     * @param groups
     * @return
     */
    private Set<Authorization> getAuthorization(List<String> groups) {

        Set<Authorization> authorizationList = new HashSet<>();

        String[] groupIds = groups.size() > 0 ? groups.toArray(new String[0]) : new String[]{};
        List<org.camunda.bpm.engine.authorization.Authorization> authorizations =  ProcessEngines.getDefaultProcessEngine().getAuthorizationService().createAuthorizationQuery()
                .resourceType(Resources.PROCESS_DEFINITION.resourceType())
                .hasPermission(ProcessDefinitionPermissions.CREATE_INSTANCE)
                .groupIdIn(groupIds).list();

        authorizations.forEach(authorization -> {
            Authorization auth = new Authorization(authorization.getGroupId(), authorization.getUserId(), authorization.getResourceId());
            authorizationList.add(auth);
        });
        return authorizationList;
    }
}
