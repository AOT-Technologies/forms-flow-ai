package org.camunda.bpm.extension.hooks.controllers;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import net.minidev.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.ProcessEngines;

import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizationInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.authorization.Resources;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletException;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
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

    @GetMapping(value = "/engine-rest-ext/form/authorization",
            produces = MediaType.APPLICATION_JSON_VALUE)
    private @ResponseBody
    AuthorizationInfo getFormAuthorization() throws ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> groups = getGroups(authentication);
        AuthorizationInfo authorizationInfo = null;

        if(CollectionUtils.isNotEmpty(groups)) {
            if (groups.contains(adminGroupName)) {
                authorizationInfo = new AuthorizationInfo(true, null);
            } else {
                authorizationInfo = new AuthorizationInfo(false, getAuthorization(groups));
            }
        }
        return authorizationInfo;
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

        List<String> groupIds = new ArrayList<>();
        if(claims != null && claims.containsKey("groups")) {
            JSONArray groups = (JSONArray)claims.get("groups");
            for (Object group1 : groups) {
                String groupName = group1.toString();
                if(StringUtils.startsWith(groupName,"/")) {
                    groupIds.add(StringUtils.substring(groupName,1));
                } else {
                    groupIds.add(groupName);
                }
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

        String[] groupIds = (String[]) groups.toArray();
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
