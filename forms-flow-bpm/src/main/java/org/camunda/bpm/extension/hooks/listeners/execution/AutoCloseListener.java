package org.camunda.bpm.extension.hooks.listeners.execution;


import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.impl.el.FixedValue;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.StringValue;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.camunda.bpm.extension.hooks.services.analytics.IDataPipeline;
import org.camunda.bpm.extension.hooks.services.analytics.SimpleDBDataPipeline;
import org.glassfish.jersey.internal.util.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.inject.Named;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class has been written specific to process, and to be enhanced to give generic behavior.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Named("autocloseDelegate")
public class AutoCloseListener implements ExecutionListener , IMessageEvent {

    @Autowired
    private SimpleDBDataPipeline dbdatapipeline;

    private final Logger LOGGER = Logger.getLogger(AutoCloseListener.class.getName());

    @Autowired
    private NamedParameterJdbcTemplate bpmJdbcTemplate;

    private FixedValue query;

    @Override
    public void notify(DelegateExecution execution) {
        List<AutoCloseProcessInstance> processInstances = getAllProcessInstances();
        List<String> deletedInstances = new ArrayList<>();
        LOGGER.info("Begin - AutoClose job");
        for (AutoCloseProcessInstance entry : processInstances) {
            Map<String, Object> processVariables = getVariables(execution, entry.getId());
            try {
                if(MapUtils.isNotEmpty(processVariables)) {
                    Map<String, Object> rspVariableMap = dbdatapipeline.execute(updateVariables(processVariables, execution.getVariables(), entry.getReasonId()));
                    execution.getProcessEngineServices().getRuntimeService().deleteProcessInstance(entry.getId(), "Delete", true, true);
                    deletedInstances.add(entry.getId());
                    notifyForAttention(execution, entry.getId(), rspVariableMap);
                }
            } catch (Exception ex) {
                LOGGER.log(Level.SEVERE, "Exception occurred while closing pid:" + entry, ex);
                notifyForAttention(execution, entry.getId(), ExceptionUtils.exceptionStackTraceAsString(ex));
            }

        }
        LOGGER.info("End - AutoClose job. Count =" + deletedInstances.size());
        LOGGER.info("End - AutoClose job. Deleted Instances = " + deletedInstances);
    }

    private Map<String, Object> getVariables(DelegateExecution execution, String processInstanceId) {
        Map<String,Object> variables = execution.getProcessEngineServices().getRuntimeService().getVariables(processInstanceId);
        String entityKey = MapUtils.isNotEmpty(variables) ?  MapUtils.getString(variables,"entity_key", null) : null;
        if(StringUtils.isNotEmpty(entityKey)) {return variables;}
        return null;
    }

    private List<AutoCloseProcessInstance> getAllProcessInstances() {
        return bpmJdbcTemplate.getJdbcTemplate().query(getQuery(), new BeanPropertyRowMapper<>(AutoCloseProcessInstance.class));
    }

    private String getQuery() {
        return this.query.getExpressionText();
    }

    private Map<String, Object> updateVariables(Map<String, Object> processVariables, Map<String, Object> variables, String conditionId) {
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            processVariables.put(entry.getKey(), entry.getValue());
        }
        processVariables.put("action", variables.get(conditionId + "_action_msg"));
        processVariables.put("feedback", variables.get(conditionId + "_feedback_msg"));
        return processVariables;
    }

    private void notifyForAttention(DelegateExecution execution, String pid, Map<String, Object> rspVariableMap) {
        if (IDataPipeline.ResponseStatus.FAILURE.name().equals(rspVariableMap.get("code"))) {
            for (Map.Entry<String, Object> entry : rspVariableMap.entrySet()) {
                if (StringUtils.startsWith(entry.getKey(), "exception")) {
                    notifyForAttention(execution, pid, String.valueOf(rspVariableMap.get("exception")));
                }
            }
        }
    }

    private void notifyForAttention(DelegateExecution execution, String pid, String exception) {
        Map<String, Object> exVarMap = new HashMap<>();
        //Additional Response Fields - BEGIN
        exVarMap.put("pid", pid);
        exVarMap.put("subject", "Exception Alert: AutoClose Job");
        exVarMap.put("category", "autoclose_service_exception");
        StringValue exceptionDataValue = Variables.stringValue(exception, true);
        exVarMap.put("exception", exceptionDataValue);
        //Additional Response Fields - END
        sendMessage(execution, exVarMap,getMessageName());
        LOGGER.info("\n\nMessage sent! " + "\n\n");

    }

    private String getMessageName(){
        return "Service_Api_Message_Email";
    }
}

@Data
@NoArgsConstructor
class AutoCloseProcessInstance {
    private String id;
    private String reasonId;

}