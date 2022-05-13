package org.camunda.bpm.extension.hooks.rest;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestResourceExceptionHandler extends ResponseEntityExceptionHandler {
}
