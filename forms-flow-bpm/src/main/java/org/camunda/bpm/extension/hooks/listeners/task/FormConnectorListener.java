package org.camunda.bpm.extension.hooks.listeners.task;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;


import java.util.List;

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

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateTask delegateTask) {
        LOGGER.info("Inside form connector listener-7");
        String submissionId = createSubmission(getFormUrl(delegateTask),getModifiedFormUrl(delegateTask));
        if(StringUtils.isNotBlank(submissionId)) {
            delegateTask.getExecution().setVariable("formUrl", StringUtils.substringBeforeLast(getModifiedFormUrl(delegateTask),"/") + "/" + submissionId);
        }
    }


    private String createSubmission(String sourceFormUrl, String targetFormUrl) {
        String submission = formSubmissionService.readSubmission(sourceFormUrl);
        if(submission.isEmpty()) {
            throw new RuntimeException("Unable to retrieve submission");
        }
        return  formSubmissionService.createSubmission(targetFormUrl, createFormSubmissionData(submission));
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

    private String createFormSubmissionData(String submission) {
        try {
            JsonNode dataNode = getObjectMapper().readTree(submission);
            return getObjectMapper().writeValueAsString(new FormSubmission(dataNode.get("data")));
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
}

@Scope("prototype")
@Data
@NoArgsConstructor
@AllArgsConstructor
class FormSubmission{
     private JsonNode data;
}
