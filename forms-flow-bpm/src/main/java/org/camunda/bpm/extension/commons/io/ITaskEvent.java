package org.camunda.bpm.extension.commons.io;

/**
 * Defaults for websocket implementation
 */
public interface ITaskEvent {
    default String getTopicNameForTaskDetail() {  return "task-event-details"; }

    default String getTopicNameForTask() {  return "task-event"; }

}