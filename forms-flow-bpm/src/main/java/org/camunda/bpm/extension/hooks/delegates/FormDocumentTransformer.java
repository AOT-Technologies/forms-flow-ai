package org.camunda.bpm.extension.hooks.delegates;



import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


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
        Map<String,Object> dataMap = formSubmissionService.retrieveFormValues(String.valueOf(execution.getVariables().get("formUrl")));
        for (Map.Entry<String, Object> entry: dataMap.entrySet()) {
            execution.setVariable(entry.getKey(), entry.getValue());
        }
    }
}
