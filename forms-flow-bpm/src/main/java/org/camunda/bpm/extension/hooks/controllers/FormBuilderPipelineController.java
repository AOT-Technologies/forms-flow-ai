package org.camunda.bpm.extension.hooks.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.StringValue;
import org.glassfish.jersey.internal.util.ExceptionUtils;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class is intended to perform the data transformation from different source systems.
 * Supported sources : Orbeon
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@RestController
@RequestMapping("/form-builder")
public class FormBuilderPipelineController {

    private final Logger LOGGER = Logger.getLogger(FormBuilderPipelineController.class.getName());

    @Value("${formbuilder.pipeline.service.bpm-url}")
    private String appcontexturl;

    @Autowired
    private Properties clientCredentialProperties;

    @PostMapping(value = "/orbeon/data",consumes = MediaType.APPLICATION_XML_VALUE)
    public void createProcess(HttpServletRequest request) {
        LOGGER.info("Inside Data transformation controller" +request.getParameterMap());
        String formXML = null;
        try(InputStream is = request.getInputStream();BufferedInputStream bis = new BufferedInputStream(is)) {
            byte[] xmlData = new byte[request.getContentLength()];
            bis.read(xmlData, 0, xmlData.length);
            if (request.getCharacterEncoding() != null) {
                formXML = new String(xmlData, request.getCharacterEncoding());
            } else {
                formXML = new String(xmlData);
            }
            LOGGER.info("Received XML Document-------->"+formXML);
            Map<String,Object> processVariables = prepareRequestVariableMap(formXML);

            Boolean status = createProcessInstance(processVariables);
            if(status == false) {
                //Email the form to support group for manual processing
                sendEmail(formXML,request.getParameter("document"),null);
            }
        } catch (Exception ex) {
            sendEmail(formXML,request.getParameter("document"), null);
            LOGGER.log(Level.SEVERE,"Exception occurred:"+ ExceptionUtils.exceptionStackTraceAsString(ex));
        }

    }

    private void sendEmail(String formXML,String documentId, String exceptionTrace){
        Map<String,Object> variables = new HashMap<>();
        try {
            HttpHeaders headers = new HttpHeaders();
            ObjectMapper mapper = new ObjectMapper();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + getOAuth2RestTemplate().getAccessToken());
            CreateProcessMessageRequest msgRequest = new CreateProcessMessageRequest();
            variables.put("category", new VariableData("api_start_failure"));
            variables.put("orbeon_document_id", new VariableData(documentId));
            variables.put("formXML", new VariableData(formXML));
            //Include exception if any
            if(StringUtils.isNotBlank(exceptionTrace)) {
                StringValue exceptionDataValue = Variables.stringValue(exceptionTrace,true);
                variables.put("exception", exceptionDataValue);
            }
            msgRequest.setMessageName("Service_Api_Message_Email");
            msgRequest.setProcessVariables(variables);
            HttpEntity<String> msgReq = new HttpEntity<String>(mapper.writeValueAsString(msgRequest), headers);
            ResponseEntity<String> msgResponse = getOAuth2RestTemplate().postForEntity(
                    getAPIContextURL() + "/engine-rest/message", msgReq, String.class);
            LOGGER.info("Message response code:"+msgResponse.getStatusCode());
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE,"Exception occurred:"+ExceptionUtils.exceptionStackTraceAsString(ex));
        }
    }

    private Boolean createProcessInstance(Map<String,Object> processVariables) throws JsonProcessingException {
        //HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        ObjectMapper mapper = new ObjectMapper();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getOAuth2RestTemplate().getAccessToken());
        CreateProcessRequest procReq = new CreateProcessRequest();
        procReq.setVariables(processVariables);
        HttpEntity<String> prcReq =
                new HttpEntity<String>(mapper.writeValueAsString(procReq), headers);

        ResponseEntity<String> wrsp = getOAuth2RestTemplate().postForEntity(
                getAPIContextURL() + "/engine-rest/process-definition/key/CC_Process/start", prcReq, String.class);
        Map<String, Object> responseMap = mapper.readValue(wrsp.getBody(), HashMap.class);
        LOGGER.info("Response Map post instance creation-------->" + responseMap);
        String instanceId = responseMap != null && responseMap.containsKey("id") ? String.valueOf(responseMap.get("id")) : null;
        if (StringUtils.isNotBlank(instanceId)) {
            return true;
        }
        return false;
    }


    private OAuth2RestTemplate getOAuth2RestTemplate() {
        ResourceOwnerPasswordResourceDetails  resourceDetails = new ResourceOwnerPasswordResourceDetails ();
        resourceDetails.setClientId(clientCredentialProperties.getProperty("client-id"));
        resourceDetails.setClientSecret(clientCredentialProperties.getProperty("client-secret"));
        resourceDetails.setAccessTokenUri(clientCredentialProperties.getProperty("accessTokenUri"));
        resourceDetails.setUsername(getAPIClientUsername());
        resourceDetails.setPassword(getAPIClientPassword());
        resourceDetails.setGrantType("password");
        return new OAuth2RestTemplate(resourceDetails);
    }

    private Map<String,Object> prepareRequestVariableMap(String formXML) throws IOException {
        Map<String,Object> variables = new HashMap<>();
        if(StringUtils.isNotBlank(formXML)) {
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode node = xmlMapper.readTree(formXML.getBytes());
            ObjectMapper mapper = new ObjectMapper();
            Map<String,Object> values = mapper.readValue(node.get("Main").toString(), HashMap.class);
            for(Map.Entry<String, Object> entry : values.entrySet()) {
                variables.put(entry.getKey(),new VariableData(entry.getValue()));
            }
            //Inject custom attributes
            variables.put("form_key", new VariableData("CCII"));
            variables.put("entity_key", new VariableData("CCII"));
            variables.put("subprocess_entity_key", new VariableData("cciiissue"));
            variables.put("files_entity_key", new VariableData("cciifiles"));
            variables.put("submit_date_time", new VariableData(new DateTime().toString()));
            variables.put("entered_by", new VariableData("orbeon"));
        }
        return variables;
    }

    public class CreateProcessRequest{
        Map<String,Object> variables;
        public Map<String, Object> getVariables() { return variables; }
        public void setVariables(Map<String, Object> variables) { this.variables = variables; }
    }

    public class CreateProcessMessageRequest{
        private String messageName;
        Map<String,Object> processVariables;
        public String getMessageName() { return messageName; }
        public void setMessageName(String messageName) { this.messageName = messageName; }
        public Map<String, Object> getProcessVariables() { return processVariables; }
        public void setProcessVariables(Map<String, Object> processVariables) { this.processVariables = processVariables; }
    }

    public class VariableData {
        private Object value;
        VariableData(Object value) {
            this.value=value;
        }
        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
    }

    private String getAPIClientUsername() {
        return StringUtils.substringBefore(StringUtils.substringBetween(appcontexturl,"://","@"),":");
    }

    private String getAPIClientPassword() {
        return StringUtils.substringAfter(StringUtils.substringBetween(appcontexturl,"://","@"),":");
    }

    private String getAPIContextURL() {
        return StringUtils.remove(StringUtils.remove(appcontexturl, StringUtils.substringBetween(appcontexturl,"://","@")),"@");
    }


}
