package org.camunda.bpm.extension.hooks.listeners;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Base class to apply default behavior to listeners.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public class BaseListener {

    private final Logger LOGGER = Logger.getLogger(BaseListener.class.getName());

    protected void handleException(DelegateExecution execution, ExceptionSource category, Exception e) {
        if(ExceptionSource.EXECUTION.name().equals(category.name())) {
            handleExecutionException(e);
        }
        if(ExceptionSource.TASK.name().equals(category.name())) {
            handleTaskException(e);
        }
    }

    private void handleExecutionException(Exception e) {
        throw new RuntimeException(ExceptionUtils.getRootCause(e));
    }

    private void handleTaskException(Exception e) {
        throw new RuntimeException(ExceptionUtils.getRootCause(e));
    }

    public enum ExceptionSource {
        TASK,
        EXECUTION;
    }
}
