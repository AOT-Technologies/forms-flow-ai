package org.camunda.bpm.extension.hooks.delegates;



import java.util.logging.Logger;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.spin.json.SpinJsonNode;
import org.springframework.stereotype.Component;
import static org.camunda.spin.Spin.*;

/**
 * This class transforms all the form document data into CAM variables
 */
@Component
public class GenTaxRequestTransformer  implements JavaDelegate {

    private final Logger log = Logger.getLogger(GenTaxRequestTransformer.class.getName());

    /**
     * This method to be changed later to support array of objects.
     * @param execution
     * @throws Exception
     */
    @Override
    public void execute(DelegateExecution execution) throws Exception {
    	 log.info("Inside GentaxRequestTransformer ");
    	 SpinJsonNode retailer = (SpinJsonNode)execution.getVariable("retailer");
    	 log.info("retailer json"+retailer.toString());
    	 SpinJsonNode genTaxRequest = JSON("{}");
    	 genTaxRequest.prop("permitNumber", retailer.prop("tesPermitNumber"));
    	 genTaxRequest.prop("filingPeriod", "");
    	 genTaxRequest.prop("productIdentifier", "");
    	 genTaxRequest.prop("training", false);
    	 log.info("gentax json"+genTaxRequest.toString());
    	 execution.setVariable("genTaxRequest", genTaxRequest);
    }
}
