package org.camunda.bpm.extension.hooks.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Application Service Exception.
 * Specialized exception class for application calls.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ApplicationServiceException  extends RuntimeException {

    public ApplicationServiceException(String message) {
        super(message);
    }

    public ApplicationServiceException(String message, Exception ex) {
        super(message, ex);
    }
}

