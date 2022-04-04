package org.camunda.bpm.extension.hooks.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import net.minidev.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.ProcessEngines;

import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizedAction;
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
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.authorization.Resources;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

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

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.api.url}")
    private String formsflowApiUrl;

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
    private @ResponseBody List<AuthorizedAction> getForms() throws ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> groups = getGroups(authentication);
        List<Authorization> authorizationList =  getAuthorization(groups);
        List<AuthorizedAction> formList = new ArrayList<>();
        List<AuthorizedAction> filteredList = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response = httpServiceInvoker.execute(formsflowApiUrl + "/form", HttpMethod.GET, null);
            if (response.getStatusCode().value() == HttpStatus.OK.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
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
                return filteredList;
            }
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE, "Exception occurred in reading form", e);
        }
        return filteredList;
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

        List<String> groupIds = null;
        if(claims != null && claims.containsKey("groups")) {
        	groupIds = getKeyValues(claims, "groups");
        } else if (claims != null && claims.containsKey("roles")) {
        	groupIds = getKeyValues(claims, "roles");
        }
        return groupIds;
    }

	private List<String> getKeyValues(Map<String, Object> claims, String claimName) {
		List<String> groupIds = new ArrayList<String>();
		JSONArray groups = (JSONArray)claims.get(claimName);
		for (Object group1 : groups) {
		    String groupName = group1.toString();
		    if(StringUtils.startsWith(groupName,"/")) {
		        groupIds.add(StringUtils.substring(groupName,1));
		    } else {
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
    private List<Authorization> getAuthorization(List<String> groups) {

        List<Authorization> authorizationList = new ArrayList<>();

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
