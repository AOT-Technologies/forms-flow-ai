package org.camunda.bpm.extension.hooks.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;


import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class aims at exposing forms based on user authorization
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

    @RequestMapping(value = "/engine-rest-ext/form", method = RequestMethod.GET, produces = "application/json")
    private @ResponseBody
    List<AuthorizedAction> getForms(@AuthenticationPrincipal Jwt principal) {
        List<String> groups = getGroups(principal);
        List<Authorization> authorizationList =  getAuthorization(groups);
        LOGGER.info("===================>"+authorizationList.size());
        List<AuthorizedAction> formList = new ArrayList<>();
        LOGGER.info("===================>"+formList.size());
        List<AuthorizedAction> filteredList = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response = httpServiceInvoker.execute(formsflowApiUrl + "/form", HttpMethod.GET, null);
            if (response.getStatusCode().value() == HttpStatus.OK.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                LOGGER.info(jsonNode.toString());
                LOGGER.info("--->"+jsonNode.get("totalCount").asInt());
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
                    return formList;
                }
                for(Authorization authObj : authorizationList) {
                    for(AuthorizedAction formObj : formList) {
                        if(authObj.getResourceId().equals(formObj.getProcessKey())) {
                            filteredList.add(formObj);
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

    private List<String> getGroups(Jwt principal) {
        List<String> rawgroups = principal.getClaim("groups");
        List<String> groups = new ArrayList<>();
        if(CollectionUtils.isNotEmpty(rawgroups)) {
            for(String entry: rawgroups) {
                String groupName = StringEscapeUtils.unescapeJava(entry);
                if(StringUtils.startsWith(groupName,"/")) {
                    groups.add(StringUtils.substring(groupName,1));
                } else {
                    groups.add(groupName);
                }

            }
        }
        return groups;
    }

    private List<Authorization> getAuthorization(List<String> groups) {
        String query = "select group_id_ groupid, user_id_ userid, resource_id_  resourceid from act_ru_authorization where resource_type_=6 and  group_id_ IN (:groups) ";
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("groups", groups);
        return bpmJdbcTemplate.query(query, parameters, new AuthorizationMapper());
    }

    private final class AuthorizationMapper implements RowMapper<Authorization> {
        public AdminController.Authorization mapRow(ResultSet rs, int rowNum) throws SQLException {
            Authorization auth = new Authorization();
            auth.setUserId(rs.getString("userid"));
            auth.setResourceId(rs.getString("resourceid"));
            auth.setGroupId(rs.getString("groupid"));
            return auth;
        }
    }


    @NoArgsConstructor
    @Data
    class Authorization {
        private String groupId;
        private String userId;
        private String resourceId;


    }

    @NoArgsConstructor
    @Data
    class AuthorizedAction {
        private String formId;
        private String formName;
        private String processKey;
    }

}
