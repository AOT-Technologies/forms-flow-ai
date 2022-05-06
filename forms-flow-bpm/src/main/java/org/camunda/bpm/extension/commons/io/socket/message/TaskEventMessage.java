package org.camunda.bpm.extension.commons.io.socket.message;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

/**
 * Task Event Message.
 * Class for holding TaskEvent data.
 */

@Data
@NoArgsConstructor
@ToString
public class TaskEventMessage implements Serializable {
    private String id;
    private String eventName;
}
