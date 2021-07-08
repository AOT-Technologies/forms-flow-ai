package org.camunda.bpm.extension.hooks.services;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.FileValue;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.connector.support.FormTokenAccessHandler;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;


@Qualifier("formSubmissionService")
@Service
public class FormSubmissionService {

    private final Logger LOGGER = Logger.getLogger(FormSubmissionService.class.getName());

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private FormTokenAccessHandler formTokenAccessHandler;

    public String readSubmission(String formUrl) {
        ResponseEntity<String> response =  httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if(response.getStatusCode().value() == HttpStatus.OK.value()) {
            return response.getBody();
        } else {
            throw new FormioServiceException("Unable to read submission for: "+ formUrl+ ". Message Body: " +
                    response.getBody());
        }
    }

    public String createRevision(String formUrl) throws IOException {
        String submission =  readSubmission(formUrl);
        if(StringUtils.isBlank(submission)) {
            LOGGER.log(Level.SEVERE,"Unable to read submission for "+formUrl);
            return null;
        }
        ObjectMapper objectMapper = new ObjectMapper();
            ResponseEntity<String> response =  httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
            if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String submissionId = jsonNode.get("_id").asText();
                return submissionId;
            } else {
                throw new FormioServiceException("Unable to create revision for: "+ formUrl+ ". Message Body: " +
                        response.getBody());
            }
    }

    public String createSubmission(String formUrl, String submission) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
            ResponseEntity<String> response =  httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
            if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String submissionId = jsonNode.get("_id").asText();
                return submissionId;
            } else {
                throw new FormioServiceException("Unable to create submission for: "+ formUrl+ ". Message Body: " +
                        response.getBody());
            }
    }

    public String getFormIdByName(String formUrl) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
            ResponseEntity<String> response =  httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
            if(response.getStatusCode().value() == HttpStatus.OK.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String formId = jsonNode.get("_id").asText();
                return formId;
            } else {
                throw new FormioServiceException("Unable to get name for: "+ formUrl+ ". Message Body: " +
                        response.getBody());
            }

    }

    private String getSubmissionUrl(String formUrl){
        if(StringUtils.endsWith(formUrl,"submission")) {
            return formUrl;
        }
        return StringUtils.substringBeforeLast(formUrl,"/");
    }

    public Map<String,Object> retrieveFormValues(String formUrl) throws IOException {
        Map<String,Object> fieldValues = new HashMap();
        String submission = readSubmission(formUrl);
        if(StringUtils.isNotEmpty(submission)) {
        JsonNode dataNode = getObjectMapper().readTree(submission);
        Iterator<Map.Entry<String, JsonNode>> dataElements = dataNode.findPath("data").fields();
        while (dataElements.hasNext()) {
            Map.Entry<String, JsonNode> entry = dataElements.next();
            if(StringUtils.endsWithIgnoreCase(entry.getKey(),"_file")) {
                List<String> fileNames = new ArrayList();
                if(entry.getValue().isArray()) {
                    for (JsonNode fileNode : entry.getValue()) {
                        byte[] bytes = Base64.getDecoder().decode(StringUtils.substringAfterLast(fileNode.get("url").asText(), "base64,"));
                        FileValue fileValue = Variables.fileValue(fileNode.get("originalName").asText())
                                .file(bytes)
                                .mimeType(fileNode.get("type").asText())
                                .create();
                        fileNames.add(fileNode.get("originalName").asText());
                        fieldValues.put(StringUtils.substringBeforeLast(fileNode.get("originalName").asText(),".")+entry.getKey(), fileValue);
                        if(fileNames.size() > 0) {
                            fieldValues.put(entry.getKey()+"_uploadname", StringUtils.join(fileNames, ","));
                        }
                    }
                }
            } else{
                Object fieldValue = entry.getValue().isBoolean() ? entry.getValue().booleanValue() :
                        entry.getValue().isInt() ? entry.getValue().intValue() :
                                entry.getValue().isBinary() ? entry.getValue().binaryValue() :
                                        entry.getValue().isLong() ? entry.getValue().asLong() :
                                                entry.getValue().isDouble() ? entry.getValue().asDouble() :
                                                        entry.getValue().isBigDecimal() ? entry.getValue().decimalValue() :
                                                                entry.getValue().isTextual() ? entry.getValue().asText():
                                                                    entry.getValue().toString();
                if(fieldValue.equals("")) fieldValue = null;
                fieldValues.put(entry.getKey(), fieldValue);
            }
        }
        }
        return fieldValues;
    }

    public String createFormSubmissionData(Map<String,Object> bpmVariables) throws IOException {
            Map<String, Map<String,Object>> data = new HashMap<>();
            data.put("data",bpmVariables);
            return getObjectMapper().writeValueAsString(data);
    }


    public String getAccessToken() {
        return formTokenAccessHandler.getAccessToken();
    }

    private ObjectMapper getObjectMapper(){
        return new ObjectMapper();
    }

}
