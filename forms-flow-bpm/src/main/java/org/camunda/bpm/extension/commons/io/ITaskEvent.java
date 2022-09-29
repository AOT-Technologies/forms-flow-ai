package org.camunda.bpm.extension.commons.io;

/**
 * Defaults for websocket implementation
 */
public interface ITaskEvent {
    default String getTopicNameForTaskDetail() {  return "/topic/task-event-details"; }

    default String getTopicNameForTask() {  return "/topic/task-event"; }

}