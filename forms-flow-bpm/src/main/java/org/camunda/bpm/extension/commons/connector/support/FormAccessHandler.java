package org.camunda.bpm.extension.commons.connector.support;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;



/**
 * This class serves as gateway for all formio interactions.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("formAccessHandler")
public class FormAccessHandler extends FormTokenAccessHandler implements IAccessHandler {

    private final Logger logger = LoggerFactory.getLogger(FormAccessHandler.class.getName());

    @Autowired
    private NamedParameterJdbcTemplate bpmJdbcTemplate;


    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        String accessToken = getToken();
        if(StringUtils.isBlank(accessToken)) {
            logger.info("Access token is blank. Cannot invoke service:{}", url);
            return null;
        }
        ResponseEntity<String> response = exchange(url,method,payload,accessToken);
        if(response.getStatusCodeValue() == TOKEN_EXPIRY_CODE) {
            exchange(url,method,payload,getAccessToken());
        }
        logger.info("Response code for service invocation: {}" , response.getStatusCode());
        return response;
    }

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, String accessToken) {
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-jwt-token", accessToken);
        HttpEntity<String> reqObj =
                new HttpEntity<>(payload, headers);
        if(HttpMethod.PATCH.name().equals(method.name())) {
            HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
            RestTemplate restTemplate = new RestTemplate(requestFactory);
            String response = restTemplate.patchForObject(getDecoratedServerUrl(url), reqObj, String.class);
            if("Token Expired".equalsIgnoreCase(response)) {
                return new ResponseEntity<>(response, HttpStatus.valueOf(TOKEN_EXPIRY_CODE));
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return getRestTemplate().exchange(getDecoratedServerUrl(url), method, reqObj, String.class);
    }



    private String getDecoratedServerUrl(String url) {
        if(StringUtils.contains(url,"/form/")) {
            return getIntegrationCredentialProperties().getProperty("formio.url") + "/form/" + StringUtils.substringAfter(url, "/form/");
        }
        return getIntegrationCredentialProperties().getProperty("formio.url") +"/"+ StringUtils.substringAfterLast(url, "/");
    }

    private String getToken() {
        ProcessDefinition processDefinition = ProcessEngines.getDefaultProcessEngine().getRepositoryService().createProcessDefinitionQuery()
                .latestVersion()
                .processDefinitionKey(TOKEN_PROCESS_NAME)
                .singleResult();
        String accessToken = processDefinition != null ? getTokenFromDBStore(processDefinition.getId()) : null;
        if(StringUtils.isBlank(accessToken)) {
            logger.info("Unable to extract token from variable context. Generating new JWT token.");
            return accessToken != null ? accessToken : getAccessToken();
        }
        return accessToken;
    }

    private String getTokenFromDBStore(String processDefinitionId) {
        String query = "select arv.text_ from act_ru_variable arv, act_ru_job rjb " +
                "where arv.proc_def_id_ = rjb.process_def_id_ and arv.proc_inst_id_  " +
                "= rjb.process_instance_id_ and rjb.process_def_key_=:tokenProcessName " +
                "and rjb.type_='timer' and arv.name_ = :tokenName " +
                "and rjb.process_def_id_ =:processDefinitionId order by rjb.create_time_ desc LIMIT 1";
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("tokenProcessName", TOKEN_PROCESS_NAME);
        parameters.addValue("tokenName", TOKEN_NAME);
        parameters.addValue("processDefinitionId", processDefinitionId);
        return bpmJdbcTemplate.queryForObject(query,parameters, String.class);
    }

    static final String TOKEN_NAME = "formio_access_token";
    static final String TOKEN_PROCESS_NAME = "formio-access-token";
    static final int TOKEN_EXPIRY_CODE = 440;

}