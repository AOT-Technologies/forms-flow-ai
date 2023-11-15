package org.camunda.bpm.extension.hooks.listeners;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;

import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.FormElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpMethod;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.HashMap;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;
/**
 * BPM Form Data Pipeline Listener.
 * This class copies all the CAM variables into form document data.
 */
@Qualifier("BPMFormDataPipelineListener")
@Component
public class BPMFormDataPipelineListener extends BaseListener implements TaskListener, ExecutionListener {

    private Logger LOGGER = LoggerFactory.getLogger(BPMFormDataPipelineListener.class);

    private Expression fields;

    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;
    @Autowired
    private Properties integrationCredentialProperties;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            patchFormAttributes(execution);
        } catch (IOException e) {
            handleException(execution,ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            patchFormAttributes(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void patchFormAttributes(DelegateExecution execution) throws IOException {
        String  formUrl= MapUtils.getString(execution.getVariables(),FORM_URL, null);
        ResponseEntity<String> response = null;
        Boolean enableCustomSubmission = Boolean.valueOf(integrationCredentialProperties.getProperty("forms.enableCustomSubmission"));

        if(StringUtils.isBlank(formUrl)) {
            LOGGER.error("Unable to read submission for Empty Url string");
        } else {
            if (enableCustomSubmission){
                //Form submission data to custom data store using custom url.
                response = httpServiceInvoker.execute(getUrl(execution), HttpMethod.PATCH, getModifiedFormElementsCustomSubmission(execution));        
            } else{
               response = httpServiceInvoker.execute(getUrl(execution), HttpMethod.PATCH, getModifiedFormElements(execution));
            }
            if (response.getStatusCodeValue() != HttpStatus.OK.value()) {
                throw new FormioServiceException("Unable to get patch values for: " + formUrl + ". Message Body: " +
                        response.getBody());
            }
        }
    }


    private String getUrl(DelegateExecution execution){
        return String.valueOf(execution.getVariables().get(FORM_URL));
    }

    private List<FormElement> getModifiedFormElements(DelegateExecution execution) throws IOException {
        List<FormElement> elements = new ArrayList<>();
        List<String> injectableFields =  this.fields != null && this.fields.getValue(execution) != null ?
                bpmObjectMapper.readValue(String.valueOf(this.fields.getValue(execution)),List.class): null;
        for(String entry: injectableFields) {
            elements.add(new FormElement(entry,String.valueOf(execution.getVariable(entry))));
        }

        return elements;
    }

    private  Map<String, Map<String,String>> getModifiedFormElementsCustomSubmission(DelegateExecution execution) throws IOException {
        Map<String,String> paramMap = new HashMap<>();
        Map<String, Map<String,String>> dataMap = new HashMap<>();
        List<String> injectableFields =  this.fields != null && this.fields.getValue(execution) != null ?
                bpmObjectMapper.readValue(String.valueOf(this.fields.getValue(execution)),List.class): null;
        for(String entry: injectableFields) {
            paramMap.put(entry, String.valueOf(execution.getVariable(entry)));
        }
        dataMap.put("data", paramMap);
        return dataMap;
    }


}

