package org.camunda.bpm.extension.commons.io.event;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.io.socket.message.TaskEventMessage;
import org.camunda.bpm.extension.commons.io.socket.message.TaskMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.*;


/**
 * This class intercepts all camunda task and push socket messages for web tier updates.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
public class CamundaEventListener {

    private final Logger logger = LoggerFactory.getLogger(CamundaEventListener.class.getName());

    @Autowired
    private SimpMessagingTemplate template;

    @Value("${websocket.messageType}")
    private String messageCategory;

    @Value("${websocket.messageEvents}")
    private String messageEvents;



    @EventListener
    public void onTaskEventListener(DelegateTask taskDelegate) {
        try {
            if (isRegisteredEvent(taskDelegate.getEventName())) {
                if (isAllowed("TASK_EVENT_DETAILS")) {
                    this.template.convertAndSend("/topic/task-event-details", getObjectMapper().writeValueAsString(getTaskMessage(taskDelegate)));
                }
                if (isAllowed("TASK_EVENT")) {
                    this.template.convertAndSend("/topic/task-event", getObjectMapper().writeValueAsString(getTaskEventMessage(taskDelegate)));
                }
            }
            } catch(JsonProcessingException e){
                logger.error("Unable to send message", e);
            }

    }

    private ObjectMapper getObjectMapper() {
        return new ObjectMapper();
    }

    private TaskMessage getTaskMessage(DelegateTask taskDelegate) {
        TaskMessage taskObj = new TaskMessage();
        BeanUtils.copyProperties(taskDelegate, taskObj);
        taskObj.setVariables(getVariables(taskDelegate));
        return taskObj;
    }

    private TaskEventMessage getTaskEventMessage(DelegateTask taskDelegate) {
        TaskEventMessage taskObj = new TaskEventMessage();
        BeanUtils.copyProperties(taskDelegate, taskObj);
        return taskObj;
    }


    private boolean isAllowed(String category) {
        return Arrays.asList(StringUtils.split(messageCategory,",")).contains(category);
    }

    private boolean isRegisteredEvent(String eventName) {
        if("ALL".equalsIgnoreCase(messageEvents)) { return true;}
        return getRegisteredEvents().contains(eventName);
    }

    private List<String> getRegisteredEvents() {
        if ("DEFAULT".equalsIgnoreCase(messageEvents)) {
            return getDefaultRegisteredEvents();
        }
        return Arrays.asList(StringUtils.split(messageEvents,","));
    }

    private Map<String,Object> getVariables(DelegateTask taskDelegate) {
        List<String> configMap =getElements();
        Map<String,Object> variables = new HashMap<>();
        for(String entry : configMap) {
            if(taskDelegate.getVariables().containsKey(entry)) {
                variables.put(entry, taskDelegate.getVariable(entry));
            }
        }
        return variables;
    }

    private List<String> getElements() {
        return new ArrayList<>(Arrays. asList("applicationId", "formUrl", "applicationStatus"));
    }

    private List<String> getDefaultRegisteredEvents() {
        return Arrays.asList(TaskListener.EVENTNAME_CREATE,TaskListener.EVENTNAME_UPDATE,TaskListener.EVENTNAME_COMPLETE);
    }


}
