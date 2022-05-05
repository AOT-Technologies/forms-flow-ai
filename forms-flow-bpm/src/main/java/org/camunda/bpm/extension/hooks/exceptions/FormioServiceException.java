package org.camunda.bpm.extension.hooks.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Formio Service Exception.
 * Specialized exception class for formio calls.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class FormioServiceException extends RuntimeException {

    public FormioServiceException(String message) {
        super(message);
    }
}
