package org.camunda.bpm.extension.hooks.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;


import java.util.logging.Level;
import java.util.logging.Logger;


@Qualifier("formSubmissionService")
@Service
public class FormSubmissionService {

    private final Logger LOGGER = Logger.getLogger(FormSubmissionService.class.getName());

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;


    public String readSubmission(String formUrl) {
        ResponseEntity<String> response =  httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if(response.getStatusCode().value() == HttpStatus.OK.value()) {
            return response.getBody();
        }
        return null;
    }

    public String createRevision(String formUrl) {
        String submission =  readSubmission(formUrl);
        if(StringUtils.isBlank(submission)) {
            LOGGER.log(Level.SEVERE,"Unable to read submission for "+formUrl);
            return null;
        }
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response =  httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
            if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String submissionId = jsonNode.get("_id").asText();
                return submissionId;
            }
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE,"Exception occurred in creating submission", e);
        }
        return null;
    }

    public String createSubmission(String formUrl, String submission) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response =  httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
            if(response.getStatusCode().value() == HttpStatus.CREATED.value()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String submissionId = jsonNode.get("_id").asText();
                return submissionId;
            }
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE,"Exception occurred in creating submission", e);
        }
        return null;
    }

    private String getSubmissionUrl(String formUrl){
        return StringUtils.substringBeforeLast(formUrl,"/");
    }



}
