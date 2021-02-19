package org.camunda.bpm.extension.hooks.listeners.execution;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.dmn.engine.DmnDecisionTableResult;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.camunda.bpm.extension.hooks.services.IUser;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Listener to inject custom attributes
 * 1. Region
 * 2. Manager Group
 * 3. Director Group
 * 4. Executive Director Group
 *
 * @author yichun.zhao@aot-technologies.com
 */
public class GroupAttributesListener implements ExecutionListener, IUser, IMessageEvent {

    private final Logger LOGGER = Logger.getLogger(GroupAttributesListener.class.getName());

    /**
     * Callback method for task creation
     * @param execution
     * @throws Exception
     */
    @Override
    public void notify(DelegateExecution execution) throws Exception {
        //Populate Region
        populateRegion(execution);
        //Populate groups
        populateGroups(execution);


    }

    private void populateRegion(DelegateExecution execution) {
        String location = execution.getVariable("location") != null ? String.valueOf(execution.getVariable("location")) : null;
        if(StringUtils.isNotEmpty(location)) {
            Map<String,Object> variableMap = new HashMap<String,Object>();
            variableMap.put("location",location);
            DmnDecisionTableResult regionDecisionResult = getDmnDecisionTableResult("decide-region", execution, variableMap);
            execution.setVariable("region", regionDecisionResult.getSingleEntry());
        }
    }

    private void populateGroups(DelegateExecution execution) {
        String serviceChannel = execution.getVariable("service_channel") != null ? StringUtils.trim(String.valueOf(execution.getVariable("service_channel"))) : null;
        String location = execution.getVariable("location") != null ? StringUtils.trim(String.valueOf(execution.getVariable("location"))) : null;
        //Temp solution to trim location issue
        execution.removeVariable("location");
        execution.setVariable("location", StringUtils.trim(location));
        if(StringUtils.isNotEmpty(serviceChannel)) {
            Map<String,Object> variableMap = new HashMap<String,Object>();
            variableMap.put("service_channel",serviceChannel);
            DmnDecisionTableResult groupDecisionResult = getDmnDecisionTableResult("decide-groups", execution, variableMap);
            String managerGroup = groupDecisionResult.getSingleResult().getEntry("manager_group");
            String directorGroup = groupDecisionResult.getSingleResult().getEntry("director_group");
            String edGroup = groupDecisionResult.getSingleResult().getEntry("ed_group");
            if(StringUtils.isNotBlank(location)) {
                variableMap = new HashMap<String,Object>();
                variableMap.put("location",location);
                DmnDecisionTableResult regionDecisionResult = getDmnDecisionTableResult("decide-region", execution, variableMap);
                String region = regionDecisionResult.getFirstResult().getEntry("region");
                managerGroup = StringUtils.replace(managerGroup,"$location",location);
                directorGroup = StringUtils.replace(directorGroup,"$region",region);
                execution.setVariable("region",region);
            }
            execution.setVariable("manager_group", StringUtils.trim(managerGroup));
            execution.setVariable("director_group", StringUtils.trim(directorGroup));
            execution.setVariable("ed_group", StringUtils.trim(edGroup));
        }
    }

    private DmnDecisionTableResult getDmnDecisionTableResult(String dmnReferenceKey, DelegateExecution execution, Map<String,Object> variables) {
        ProcessEngine processEngine = execution.getProcessEngine();
        return processEngine.getDecisionService().evaluateDecisionTableByKey(dmnReferenceKey, variables);
    }


}
