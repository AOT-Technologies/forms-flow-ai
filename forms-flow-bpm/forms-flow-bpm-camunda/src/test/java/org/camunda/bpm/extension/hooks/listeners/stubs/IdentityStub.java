package org.camunda.bpm.extension.hooks.listeners.stubs;

import org.camunda.bpm.engine.task.IdentityLink;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Identity Stub.
 * Stub class for Identity.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IdentityStub implements IdentityLink {

	private String id;
	private String type;
	private String groupId;
	private String taskId;
	private String processDefId;
	private String tenantId;
	private String userId;

}
