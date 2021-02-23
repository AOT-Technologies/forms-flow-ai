package org.camunda.bpm.extension.hooks.listeners.task;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;


import java.util.HashMap;
import java.util.List;

import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * This class associates form for workflow user task.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
public class FormConnectorListener implements TaskListener {

    private static final Logger LOGGER = Logger.getLogger(FormConnectorListener.class.getName());

    private Expression fields;
    private Expression propogateData;


    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateTask delegateTask) {
        LOGGER.info("Inside form connector listener-7");
        try {
            String submissionId = createSubmission(getFormUrl(delegateTask),getModifiedFormUrl(delegateTask), delegateTask);
            if(StringUtils.isNotBlank(submissionId)) {
                delegateTask.getExecution().setVariable("formUrl", StringUtils.substringBeforeLast(getModifiedFormUrl(delegateTask),"/") + "/" + submissionId);
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

    }


    private String createSubmission(String sourceFormUrl, String targetFormUrl,DelegateTask delegateTask) throws JsonProcessingException {
        String submission = formSubmissionService.readSubmission(sourceFormUrl);
        if(submission.isEmpty()) {
            throw new RuntimeException("Unable to retrieve submission");
        }
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String,Object> superVariables = new HashMap<>();
        List<String> supFields =  this.fields != null && this.fields.getValue(delegateTask) != null ?
                objectMapper.readValue(String.valueOf(this.fields.getValue(delegateTask)),List.class): null;

        for(String entry : supFields) {
            superVariables.put(entry, delegateTask.getExecution().getVariables().get(entry));
        }
        return  formSubmissionService.createSubmission(targetFormUrl, createFormSubmissionData(submission, superVariables, getPropogateData(delegateTask)));
    }


    private String getFormId(DelegateTask delegateTask) {

        CamundaProperties camundaProperties = delegateTask.getExecution()
                    .getBpmnModelElementInstance()
                    .getExtensionElements()
                    .getElementsQuery()
                    .filterByType(CamundaProperties.class).singleResult();

            List<CamundaProperty> userTaskExtensionProperties = camundaProperties.getCamundaProperties()
                    .stream()
                    .filter(camundaProperty ->
                            camundaProperty.getCamundaName()
                                    .equals(getFormIdProperty()))
                    .collect(Collectors.toList());


            if(CollectionUtils.isNotEmpty(userTaskExtensionProperties)) {
                return userTaskExtensionProperties.get(0).getCamundaValue();
            }

            return null;
    }

    private ObjectMapper getObjectMapper(){
        return new ObjectMapper();
    }

      private String createFormSubmissionData(String submission, Map<String,Object> superVariables, String propogateData) {
        try {
            JsonNode submissionNode = getObjectMapper().readTree(submission);
            JsonNode dataNode =submissionNode.get("data");
            if("Y".equals(propogateData)) {
                for(Map.Entry<String,Object> entry : superVariables.entrySet()) {
                    ((ObjectNode)dataNode).put(entry.getKey(), (String) entry.getValue());
                }
                return getObjectMapper().writeValueAsString(new FormSubmission(dataNode));
            } else {
                return getObjectMapper().writeValueAsString(new FormSubmission(getObjectMapper().convertValue(superVariables, JsonNode.class)));
            }


        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return  null;
    }

    private String getModifiedFormUrl(DelegateTask delegateTask) {
        String formUrl = getFormUrl(delegateTask);
        return StringUtils.replace(formUrl, StringUtils.substringBetween(formUrl, "form/", "/submission"), getFormId(delegateTask));

    }

    private String getFormUrl(DelegateTask delegateTask) {
        return String.valueOf(delegateTask.getExecution().getVariables().get("formUrl"));
    }

    private String getFormIdProperty() {
        return "formid";
    }

    private String getPropogateData(DelegateTask delegateTask){
        if(this.propogateData != null &&
                StringUtils.isNotBlank(String.valueOf(this.propogateData.getValue(delegateTask)))) {
            return String.valueOf(this.propogateData.getValue(delegateTask));
        }
        return "N";
    }
}

@Scope("prototype")
@Data
@NoArgsConstructor
@AllArgsConstructor
class FormSubmission{
     private JsonNode data;
}
