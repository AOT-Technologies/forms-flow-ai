package org.camunda.bpm.extension.hooks.listeners.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *  This class intends to update the form with attributes of execution context.
 *  Scope to extend support for generic attributes of form.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Component
public class FormAttributesListener implements ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(FormAttributesListener.class.getName());

    private Expression fields;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        LOGGER.info("FormAttributesListener input : "+execution.getVariables());
        String  formUrl= MapUtils.getString(execution.getVariables(),"form_url", null);
        if(StringUtils.isBlank(formUrl)) {
            LOGGER.log(Level.SEVERE,"Unable to read submission for "+execution.getVariables().get("form_url"));
            return;
        }
        ResponseEntity<String> response =  httpServiceInvoker.execute(getUrl(execution), HttpMethod.PATCH, getModifiedFormElements(execution));
        if(response.getStatusCode().value() != HttpStatus.OK.value()) {
            LOGGER.log(Level.SEVERE,"Exception occurred on updating application details", response.toString());
        }

    }


    private String getUrl(DelegateExecution execution){
        return String.valueOf(execution.getVariables().get("form_url"));
    }

    private List<FormElement> getModifiedFormElements(DelegateExecution execution) throws JsonProcessingException {
        List<FormElement> elements = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();
        List<String> injectableFields =  this.fields != null && this.fields.getValue(execution) != null ?
                objectMapper.readValue(String.valueOf(this.fields.getValue(execution)),List.class): null;
        for(String entry: injectableFields) {
            elements.add(new FormElement(entry,String.valueOf(execution.getVariable(entry))));
        }

        return elements;
    }

}

@Component
@Scope("prototype")
@Data
@NoArgsConstructor
class FormElement{
    private String op;
    private String path;
    private String value;

    FormElement(String elementId, String value) {
        this.op = "replace";
        this.path = "/data/"+elementId;
        this.value = value;
    }

}


