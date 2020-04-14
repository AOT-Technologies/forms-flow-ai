package org.camunda.bpm.extension.keycloak.showcase.test.bpm.integration;

import static org.camunda.bpm.engine.test.assertions.bpmn.AbstractAssertions.init;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.assertThat;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.complete;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.runtimeService;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.task;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.withVariables;
import static org.camunda.bpm.extension.keycloak.showcase.test.util.ProcessTestAssertions.waitUntil;
import static org.junit.Assert.assertNotNull;

import org.apache.ibatis.logging.LogFactory;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.extension.keycloak.showcase.ProcessConstants.Variable;
import org.camunda.bpm.extension.keycloak.showcase.plugin.KeycloakIdentityProvider;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.junit4.SpringRunner;

/**
 * Test case starting an in-memory database-backed Process Engine running 
 * with the complete Spring Boot stack. The web front end is omitted.
 * <p>
 * With this type of test you integrate all your local services and identify
 * errors arising out of the combination of the service implementation with 
 * the BPM process.
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
@EnableAutoConfiguration(exclude = { SecurityAutoConfiguration.class })
public class ProcessIntegrationTest {

	private static final String PROCESS_DEFINITION_KEY = "camunda.showcase";

	@Autowired
	private ProcessEngine processEngine;
	
	@MockBean
	public KeycloakIdentityProvider disableKeycloak;

	static {
		LogFactory.useSlf4jLogging(); // MyBatis
	}

	@Before
	public void setup() {
		// init BPM assert
		init(processEngine);
	}

	// ---------------------------------------------------------------------------
	// Tests
	// ---------------------------------------------------------------------------

	/**
	 * Test the happy (approved) path.
	 */
	@Test
	public void testApprovedPath() {
		// start process
		ProcessInstance pi = runtimeService().startProcessInstanceByKey(PROCESS_DEFINITION_KEY,
				withVariables(Variable.NAME, "Demo"));
		assertThat(pi).isStarted();

		// check user task and approve user
		assertThat(pi).isWaitingAt("ApproveUser");
		Task task = task();
		assertNotNull("User task expected", task);
		complete(task, withVariables("approved", Boolean.TRUE));

		// check service task (asynchronous continuation)
		waitUntil(pi).hasPassed("ServiceTask_Logger");

		// check corresponding process end
		assertThat(pi).hasPassed("END_APPROVED");
		assertThat(pi).isEnded();
		
		// TODO: insert assertions checking your local business logic impacts
	}

	/**
	 * Test the not approved path.
	 */
	@Test
	public void testNotApprovedPath() {
		// start process
		ProcessInstance pi = runtimeService().startProcessInstanceByKey(PROCESS_DEFINITION_KEY,
				withVariables(Variable.NAME, "Demo"));
		assertThat(pi).isStarted();

		// check user task and do not approve user
		assertThat(pi).isWaitingAt("ApproveUser");
		Task task = task();
		assertNotNull("User task expected", task);
		complete(task, withVariables("approved", Boolean.FALSE));

		// check corresponding process end
		assertThat(pi).hasPassed("END_NOT_APPROVED");
		assertThat(pi).isEnded();

		// TODO: insert assertions checking your local business logic impacts
	}
}
