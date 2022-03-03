package org.camunda.bpm.extension.hooks.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import net.minidev.json.JSONArray;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;

import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.camunda.bpm.extension.hooks.controllers.data.AuthorizedAction;
import org.camunda.bpm.extension.hooks.controllers.data.FormRO;
import org.camunda.bpm.extension.hooks.controllers.data.FormSearchInfo;
import org.camunda.bpm.extension.hooks.controllers.mapper.AuthorizationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.camunda.bpm.engine.authorization.ProcessDefinitionPermissions;
import org.camunda.bpm.engine.authorization.Resources;

import javax.servlet.ServletException;
import java.util.*;
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

    @Autowired
    private NamedParameterJdbcTemplate bpmJdbcTemplate;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.api.url}")
    private String formsflowApiUrl;

    @Value("${plugin.identity.keycloak.administratorGroupName}")
    private String adminGroupName;

    @GetMapping(value = "/engine-rest-ext/form",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    private @ResponseBody List<AuthorizedAction> getForms(@RequestBody(required = false) FormRO formRO) throws ServletException
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> groups = getGroups(authentication);
        List<Authorization> authorizationList =  getAuthorization(groups);
        List<AuthorizedAction> formList = new ArrayList<>();
        //FormSearchInfo formSearchInfo = new FormSearchInfo();
        List<AuthorizedAction> filteredList = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String payload = objectMapper.writeValueAsString(formRO);
            payload = (Objects.equals(payload,"")?null:payload);
            ResponseEntity<String> response = httpServiceInvoker.execute(formsflowApiUrl + "/form", HttpMethod.GET, payload);
            if (response.getStatusCode().value() == HttpStatus.OK.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode totalCount = jsonNode.get("totalCount");
                if (totalCount != null && totalCount.asInt() > 0) {
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
                            if (authObj.getResourceId().equals(formObj.getProcessKey()) && !isExists(filteredList, formObj.getFormId()))  {
                                filteredList.add(formObj);
                            }
                        }
                    }
                }
                //formSearchInfo.setFormDataList(filteredList);
                //if(formRO != null) formSearchInfo.setPagination(formRO.getPagination());
                //formSearchInfo.setTotalCount(totalCount.asInt());
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
        String query = "select group_id_ groupid, user_id_ userid, resource_id_  resourceid from act_ru_authorization " +
                "where resource_type_="+ Resources.PROCESS_DEFINITION.resourceType()+
                " and perms_ >= " + ProcessDefinitionPermissions.CREATE_INSTANCE.getValue()  +
                " and  group_id_ IN (:groups) ";
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("groups", groups);
        return bpmJdbcTemplate.query(query, parameters, new AuthorizationMapper());
    }
}
