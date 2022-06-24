package org.camunda.bpm.extension.hooks.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 *
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class FormsflowInternalException  extends RuntimeException {

    public FormsflowInternalException(String message) {
        super(message);
    }
}
