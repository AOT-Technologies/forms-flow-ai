package org.camunda.bpm.extension.hooks.listeners;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;

import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.FormElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.annotation.Resource;
import javax.inject.Named;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class transforms all the form document data into CAM variables
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Named("BPMFormDataPipelineListener")
public class BPMFormDataPipelineListener extends BaseListener implements TaskListener, ExecutionListener {

    private Logger LOGGER = Logger.getLogger(BPMFormDataPipelineListener.class.getName());

    private Expression fields;

    @Resource(name = "bpmObjectMapper")
    private ObjectMapper bpmObjectMapper;
    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

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
        String  formUrl= MapUtils.getString(execution.getVariables(),"formUrl", null);
        if(StringUtils.isBlank(formUrl)) {
            LOGGER.log(Level.SEVERE,"Unable to read submission for "+execution.getVariables().get("formUrl"));
            return;
        }
        ResponseEntity<String> response = httpServiceInvoker.execute(getUrl(execution), HttpMethod.PATCH, getModifiedFormElements(execution));
        if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
            throw new FormioServiceException("Unable to get patch values for: "+ formUrl+ ". Message Body: " +
                    response.getBody());
        }
    }


    private String getUrl(DelegateExecution execution){
        return String.valueOf(execution.getVariables().get("formUrl"));
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


}

