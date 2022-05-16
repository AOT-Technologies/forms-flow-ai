package org.camunda.bpm.extension.hooks.services;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.FileValue;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.connector.FormioTokenServiceProvider;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import javax.annotation.Resource;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Form Submission Service.
 * This class provides form submission functionalities.
 */

@Qualifier("formSubmissionService")
@Service
public class FormSubmissionService {

    private final Logger LOGGER = Logger.getLogger(FormSubmissionService.class.getName());

    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private FormioTokenServiceProvider formioTokenServiceProvider;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

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
        ResponseEntity<String> response =  httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
        if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
            JsonNode jsonNode = bpmObjectMapper.readTree(response.getBody());
            String submissionId = jsonNode.get("_id").asText();
            return submissionId;
        } else {
            throw new FormioServiceException("Unable to create revision for: "+ formUrl+ ". Message Body: " +
                    response.getBody());
        }
    }

    public String createSubmission(String formUrl, String submission) throws IOException {
        ResponseEntity<String> response =  httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
        if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
            JsonNode jsonNode = bpmObjectMapper.readTree(response.getBody());
            String submissionId = jsonNode.get("_id").asText();
            return submissionId;
        } else {
            throw new FormioServiceException("Unable to create submission for: "+ formUrl+ ". Message Body: " +
                    response.getBody());
        }
    }

    public String getFormIdByName(String formUrl) throws IOException {
        ResponseEntity<String> response =  httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if(response.getStatusCode().value() == HttpStatus.OK.value()) {
            JsonNode jsonNode = bpmObjectMapper.readTree(response.getBody());
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
            JsonNode dataNode = bpmObjectMapper.readTree(submission);
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
                    fieldValues.put(entry.getKey(), convertToOriginType(entry.getValue()));
                }
            }
        }
        return fieldValues;
    }

    private Object convertToOriginType(JsonNode value) throws IOException {
        Object fieldValue;
        if(value.isNull()){
            fieldValue = null;
        } else if(value.isBoolean()){
            fieldValue = value.booleanValue();
        } else if(value.isInt()){
            fieldValue = value.intValue();
        } else if(value.isBinary()){
            fieldValue = value.binaryValue();
        } else if(value.isLong()){
            fieldValue = value.asLong();
        } else if(value.isDouble()){
            fieldValue = value.asDouble();
        } else if(value.isBigDecimal()){
            fieldValue = value.decimalValue();
        } else if(value.isTextual()){
            fieldValue = value.asText();
        } else{
            fieldValue = value.toString();
        }

        if(Objects.equals(fieldValue, "")) {
            fieldValue = null;
        }

        return fieldValue;
    }

    public String createFormSubmissionData(Map<String,Object> bpmVariables) throws IOException {
        Map<String, Map<String,Object>> data = new HashMap<>();
        data.put("data",bpmVariables);
        return bpmObjectMapper.writeValueAsString(data);
    }

    @Deprecated
    public String getAccessToken() {
        return formioTokenServiceProvider.getAccessToken();
    }

}
