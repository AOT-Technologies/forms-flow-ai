package org.camunda.bpm.extension.hooks.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Specialized exception class for formio calls.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class FormioServiceException extends RuntimeException {

    public FormioServiceException(String message) {
        super(message);
    }
}
