package org.camunda.bpm.extension.hooks.delegates;

import com.fasterxml.jackson.databind.JsonNode;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.camunda.bpm.extension.hooks.delegates.data.TextSentimentData;
import org.camunda.bpm.extension.hooks.delegates.data.TextSentimentRequest;
import org.camunda.bpm.extension.hooks.exceptions.AnalysisServiceException;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.FormElement;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import  com.fasterxml.jackson.core.JsonProcessingException;


import javax.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Component
public class FormTextAnalysisDelegate implements JavaDelegate {

    private final Logger LOGGER = LoggerFactory.getLogger(FormTextAnalysisDelegate.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;
    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        TextSentimentRequest textSentimentRequest = prepareAnalysisRequest(execution);
        if(textSentimentRequest != null) {
            ResponseEntity<IResponse> response =  httpServiceInvoker.execute(getAnalysisUrl(), HttpMethod.POST,textSentimentRequest, TextSentimentRequest.class);
            if(response.getStatusCode().value() == HttpStatus.OK.value() && response.getBody() != null) {
                prepareAndPatchFormData(execution, (TextSentimentRequest) response.getBody());
            } else {
                throw new AnalysisServiceException("Unable to read submission for: "+ getAnalysisUrl()+ ". Message Body: " +
                        response.getBody());
            }
        }
    }

    private TextSentimentRequest prepareAnalysisRequest(DelegateExecution execution) throws JsonProcessingException {
        List<TextSentimentData> txtRecords = new ArrayList<>();
        String submission = formSubmissionService.readSubmission(String.valueOf(execution.getVariables().get("formUrl")));
        if(submission.isEmpty()) {
            throw new RuntimeException("Unable to retrieve submission");
        }
        JsonNode dataNode = bpmObjectMapper.readTree(submission);
        Iterator<Map.Entry<String, JsonNode>> dataElements = dataNode.findPath("data").fields();
        while (dataElements.hasNext()) {
            Map.Entry<String, JsonNode> entry = dataElements.next();
            if(entry.getValue().has("type") && getSentimentCategory().equals(entry.getValue().get("type").asText())) {
                txtRecords.add(new TextSentimentData(entry.getKey(),
                        bpmObjectMapper.readValue(entry.getValue().get("topics").toString(), List.class), entry.getValue().get("text").asText()));
            }
        }
        if(CollectionUtils.isNotEmpty(txtRecords)) {
            return new TextSentimentRequest((Integer) execution.getVariable("applicationId"),
                    String.valueOf(execution.getVariable("formUrl")),txtRecords);
        }
        return null;
    }


    public void prepareAndPatchFormData(DelegateExecution execution, TextSentimentRequest textSentimentRequest) throws IOException {
        List<FormElement> elements = new ArrayList<>();
        if(textSentimentRequest.getData() != null) {
            for (TextSentimentData textSentimentData : textSentimentRequest.getData()) {
                elements.add(new FormElement(textSentimentData.getElementId(), "overallSentiment",
                        textSentimentData.getOverallSentiment()));
            }
        }
        ResponseEntity<String> response = httpServiceInvoker.execute(getFormUrl(execution), HttpMethod.PATCH, elements);
        if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
            throw new FormioServiceException("Unable to get patch values for: "+ getFormUrl(execution)+ ". Message Body: " +
                    response.getBody());
        }
    }

    private String getAnalysisUrl(){
        return httpServiceInvoker.getProperties().getProperty("analysis.url")+"/sentiment";
    }

    private String getFormUrl(DelegateExecution execution){
        return String.valueOf(execution.getVariables().get("formUrl"));
    }

    private String getSentimentCategory() {
        return "textAreaWithAnalytics";
    }

}
