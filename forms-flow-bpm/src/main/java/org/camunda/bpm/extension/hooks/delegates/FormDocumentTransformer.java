package org.camunda.bpm.extension.hooks.delegates;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;
import java.util.logging.Logger;

/**
 * This class transforms all the form document data into CAM variables
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
public class FormDocumentTransformer  implements JavaDelegate {

    private final Logger LOGGER = Logger.getLogger(FormDocumentTransformer.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;

    /**
     * This method to be changed later to support array of objects.
     * @param execution
     * @throws Exception
     */
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String submission = formSubmissionService.readSubmission(String.valueOf(execution.getVariables().get("formUrl")));
        if(submission.isEmpty()) {
            throw new RuntimeException("Unable to retrieve submission");
        }
        JsonNode dataNode = getObjectMapper().readTree(submission);
        Iterator<Map.Entry<String, JsonNode>> dataElements = dataNode.findPath("data").fields();
        while (dataElements.hasNext()) {
            Map.Entry<String, JsonNode> entry = dataElements.next();
            Object fieldValue = entry.getValue().isBoolean() ? entry.getValue().booleanValue() :
                    entry.getValue().isInt() ? entry.getValue().intValue() :
                    entry.getValue().isBinary() ? entry.getValue().binaryValue() :
                    entry.getValue().isLong() ? entry.getValue().asLong() :
                    entry.getValue().isDouble() ? entry.getValue().asDouble() :
                    entry.getValue().isBigDecimal() ? entry.getValue().decimalValue() :
                            entry.getValue().asText();

            execution.setVariable(entry.getKey(), fieldValue);
        }
    }

    private ObjectMapper getObjectMapper(){
        return new ObjectMapper();
    }

}
