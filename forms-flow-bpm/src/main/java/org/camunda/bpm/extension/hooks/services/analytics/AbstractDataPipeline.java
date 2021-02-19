package org.camunda.bpm.extension.hooks.services.analytics;

import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.Map;
import java.util.logging.Logger;

/**
 * Abstract template for publishing data to downstream analytics system.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public abstract class AbstractDataPipeline implements IDataPipeline {

    private final Logger LOGGER = Logger.getLogger(AbstractDataPipeline.class.getName());

    /**
     * Template method for defining the analytics publishing service
     * @param variables
     * @throws JsonProcessingException
     */
    @Override
    public  Map<String,Object> execute(Map<String,Object> variables) {
        Map<String,Object> data = prepare(variables);
        DataPipelineResponse response = publish(data);
        Map<String,Object> rspVarMap = notificationMessage(response);
        return rspVarMap;
    }

    /**
     * Abstract method prepares i.e. transforms source object to targeted object Model.
     * @param variables
     * @throws JsonProcessingException
     */
    public abstract Map<String, Object> prepare(Map<String,Object> variables);

    /**
     * Abstract method for the implementation class to have publishing snippet.
     * @param data
     */
    public abstract DataPipelineResponse publish(Map<String,Object> data);

    /**
     * Abstract method for the implementation class to have notification snippet.
     */
    public abstract Map<String,Object> notificationMessage(DataPipelineResponse response) ;

    public String getIdentityKey(Map<String,Object> variables) {
            return variables.containsKey("pid") && variables.get("pid") != null ? String.valueOf(variables.get("pid")) : null;
    }


}
