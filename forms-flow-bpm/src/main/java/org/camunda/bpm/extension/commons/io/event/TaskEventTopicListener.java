package org.camunda.bpm.extension.commons.io.event;

import org.camunda.bpm.extension.commons.io.message.service.TaskEventMessageService;
import org.camunda.bpm.extension.commons.io.socket.message.TaskMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import spinjar.com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.logging.Logger;

/**
 * This component listens to message topic
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Qualifier("taskEventTopicListener")
@Component
public class TaskEventTopicListener {

    @Autowired
    private TaskEventMessageService taskEventMessageService;

    private final Logger LOGGER = Logger.getLogger(TaskEventTopicListener.class.getName());

    public void receiveTaskMessage(String message) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        TaskMessage taskMessage = objectMapper.readValue(message, TaskMessage.class);
        taskEventMessageService.sendMessage(taskMessage);
    }
}
