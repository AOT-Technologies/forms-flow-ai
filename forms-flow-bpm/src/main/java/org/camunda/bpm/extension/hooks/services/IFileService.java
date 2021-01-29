package org.camunda.bpm.extension.hooks.services;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.FileValue;

import java.util.Map;
import java.util.logging.Logger;

/**
 * This class aimed at centralizing all file related operations.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public interface IFileService {

    Logger LOGGER = Logger.getLogger(IFileService.class.getName());


    default void transformFiles(DelegateTask delegateTask) {
        LOGGER.info("Inside CustomFileUploadListener");
        for(Map.Entry<String,Object> entry : delegateTask.getExecution().getVariables().entrySet()) {
            if(StringUtils.isNotBlank(entry.getKey()) && entry.getKey().endsWith("_bytes")) {
                FileValue oldFileValue = delegateTask.getExecution().getProcessEngineServices().getRuntimeService().getVariableTyped(delegateTask.getProcessInstanceId(), entry.getKey()+"_metadata");
                boolean skipCreate = false;

                if(delegateTask.getExecution().getVariables().containsKey(StringUtils.substringBefore(entry.getKey(),"_bytes"))) {
                    FileValue newFileValue = delegateTask.getExecution().getProcessEngineServices().getRuntimeService().getVariableTyped(delegateTask.getProcessInstanceId(), StringUtils.substringBefore(entry.getKey(),"_bytes"));
                    if(StringUtils.isNotBlank(oldFileValue.getFilename()) && StringUtils.isNotBlank(newFileValue.getFilename()) &&
                            oldFileValue.getFilename().equals(newFileValue.getFilename())) {
                        skipCreate = true;
                    }
                }
                if(!skipCreate) {
                    FileValue newFileValue = Variables.fileValue(oldFileValue.getFilename())
                            .file((byte[])entry.getValue())
                            .mimeType(oldFileValue.getMimeType())
                            .create();
                    delegateTask.getExecution().setVariable(StringUtils.substringBefore(entry.getKey(),"_bytes"),newFileValue);
                }
                delegateTask.getExecution().removeVariable(entry.getKey());
                delegateTask.getExecution().removeVariable(entry.getKey()+"_metadata");
            }
        }
    }
}
