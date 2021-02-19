package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.engine.impl.el.FixedValue;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.inject.Named;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This component executes the query passed in and stores the response in execution variable map using split-by-size logic.
 * Future scope to fully flush the response from listener.
 *
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Named("dataHistoryDelegate")
public class DataReaderListener implements TaskListener, ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(DataReaderListener.class.getName());

    @Autowired
    private NamedParameterJdbcTemplate analyticsJdbcTemplate;

    private FixedValue query;

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        SplitBySizeAndStore(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        SplitBySizeAndStore(delegateTask.getExecution());
    }

    /**
     * This method splits the response and flush into variables map.
     * @param execution
     */
    private void SplitBySizeAndStore(DelegateExecution execution) {
        String data = getData(execution);
        AtomicInteger index = new AtomicInteger();
        Arrays
                .stream(data.split("(?<=\\G.{"+getSplitSize()+"})"))
                .forEach(str -> {
                    execution.setVariable(getStoreVariableName()+"_"+index.incrementAndGet(), str);
                });
        execution.setVariable(getStoreVariableName()+"_size",index.intValue());
    }

    /**
     * This method executes the query and returns the response as list of key value pairs.
     *
     * @param execution
     * @return
     */
    private String getData(DelegateExecution execution)  {
        List<Map<String, Object>> results = analyticsJdbcTemplate.queryForList(getQuery(),getQueryCriteria(execution));
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String response = objectMapper.writeValueAsString(results);
            return response;
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE,"Exception occurred in preparing response.", e);
        }
        return null;
    }

    private String getQuery() {
        return this.query.getExpressionText();
    }

    /**
     * This method prepares the query parameter map from execution variables.
     *
     * @param execution
     * @return
     */
    private Map<String, String> getQueryCriteria(DelegateExecution execution) {
        Map<String, String> paramMap = new HashMap<>();
        if(execution.getVariables().containsKey("process_pid")) {
            paramMap.put("process_pid",  String.valueOf(execution.getVariables().get("process_pid")));
        } else {
            paramMap.put("pid",  String.valueOf(execution.getVariables().get("pid")));
        }
        return paramMap;
    }

    /**
     * This method defines the split size.
     * In this 4000 corresponds to the size of the camunda variable value column.
     *
     * @return
     */
    private Integer getSplitSize(){
        return 4000;
    }

    private String getStoreVariableName() {
        return "datajson";
    }

}
