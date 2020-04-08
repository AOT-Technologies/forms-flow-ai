package org.camunda.bpm.extension.keycloak.showcase.test.bpm.local;

import static org.camunda.bpm.engine.test.assertions.bpmn.AbstractAssertions.init;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.assertThat;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.complete;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.execute;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.job;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.runtimeService;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.task;
import static org.camunda.bpm.engine.test.assertions.bpmn.BpmnAwareTests.withVariables;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.engine.test.Deployment;
import org.camunda.bpm.engine.test.ProcessEngineRule;
import org.camunda.bpm.engine.test.mock.Mocks;
import org.camunda.bpm.extension.keycloak.showcase.ProcessConstants.Variable;
import org.camunda.bpm.extension.keycloak.showcase.task.LoggerDelegate;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

/**
 * Sample process unit test covering exactly the process itself with absolutely everything else mocked.
 * <p>
 * With this type of test you can identify errors in the BPM process itself early and before 
 * integrating with more complex business logic.
 */
public class ProcessLocalTest {

	/** BPMN 2 file to the process under test. */
	private static final String PROCESS_RESOURCE = "processes/process.bpmn";
	
	/** The process definition key of the process under test. */
	private static final String PROCESS_DEFINITION_KEY = "camunda.showcase";

	/**
	 * Access to the process engine.
	 */
	@Rule
	public ProcessEngineRule rule = new ProcessEngineRule("camunda.local.cfg.xml", true);
	
	/**
	 * Mock for the sample service task.
	 */
	@Mock
	private LoggerDelegate loggerTask;
	
	/**
	 * Setup the test case.
	 */
	@Before
	public void setup() {
		// Initialize and register mocks
		MockitoAnnotations.initMocks(this);
		Mocks.register("logger", loggerTask);

		// Initialize BPM Assert
		init(rule.getProcessEngine());
	}

	/**
	 * Tear down test case.
	 */
	@After
	public void tearDown() {
		// Reset mocks
		reset(loggerTask);
	}

	// ---------------------------------------------------------------------------
	// Tests
	// ---------------------------------------------------------------------------

	/**
	 * Just tests if the process definition is deployable.
	 */
	@Test
	@Deployment(resources = PROCESS_RESOURCE)
	public void testParsingAndDeployment() {
		// nothing is done here, as we just want to check for exceptions during
		// deployment
	}

	/**
	 * Test the happy (approved) path.
	 */
	@Test
	@Deployment(resources = PROCESS_RESOURCE)
	public void testApprovedPath() throws Exception {
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
		execute(job());
		assertThat(pi).hasPassed("ServiceTask_Logger");

		// check corresponding process end
		assertThat(pi).hasPassed("END_APPROVED");
		assertThat(pi).isEnded();

		// verify mocks
		verify(loggerTask, times(1)).execute(any(DelegateExecution.class));
	}

	/**
	 * Test the not approved path.
	 */
	@Test
	@Deployment(resources = PROCESS_RESOURCE)
	public void testNotApprovedPath() throws Exception {
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

		// verify mocks
		verify(loggerTask, times(0)).execute(any(DelegateExecution.class));
	
	}

}
