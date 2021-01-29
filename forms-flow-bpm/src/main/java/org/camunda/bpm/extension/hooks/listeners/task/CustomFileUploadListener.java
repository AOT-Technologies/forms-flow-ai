package org.camunda.bpm.extension.hooks.listeners.task;

import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.IFileService;

import javax.inject.Named;
import java.util.logging.Logger;


/**
 * This class supports upload of file upload as bytes and later transforms as File Object.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Named("customFileUploadListener")
public class CustomFileUploadListener implements TaskListener, IFileService {

    private final Logger LOGGER = Logger.getLogger(CustomFileUploadListener.class.getName());

    @Override
    public void notify(DelegateTask delegateTask) {
        transformFiles(delegateTask);
    }

}