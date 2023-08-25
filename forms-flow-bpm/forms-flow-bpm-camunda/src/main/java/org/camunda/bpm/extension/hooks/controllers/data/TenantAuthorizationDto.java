package org.camunda.bpm.extension.hooks.controllers.data;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tenant Authorization Dto.
 * Data transfer object for Tenant Authorization.
 */
public class TenantAuthorizationDto {
	
	private String tenantKey;
	private List<String> adminRoles;
	private List<String> designerRoles;
	private List<String> clientRoles;
	private List<String> reviewerRoles;

	public TenantAuthorizationDto() {
		super();
		this.adminRoles = new ArrayList<String>();
		this.designerRoles = new ArrayList<String>();
		this.clientRoles = new ArrayList<String>();
		this.reviewerRoles = new ArrayList<String>();
	}

	public String getTenantKey() {
		return tenantKey;
	}

	public void setTenantKey(String tenantKey) {
		this.tenantKey = tenantKey;
	}

	public List<String> getAdminRoles() {
		return adminRoles;
	}

	public void setAdminRoles(List<String> adminRoles) {
		this.adminRoles = adminRoles;
	}

	public List<String> getDesignerRoles() {
		return designerRoles;
	}

	public void setDesignerRoles(List<String> designerRoles) {
		this.designerRoles = designerRoles;
	}

	public List<String> getClientRoles() {
		return clientRoles;
	}

	public void setClientRoles(List<String> clientRoles) {
		this.clientRoles = clientRoles;
	}

	public List<String> getReviewerRoles() {
		return reviewerRoles;
	}

	public void setReviewerRoles(List<String> reviewerRoles) {
		this.reviewerRoles = reviewerRoles;
	}
}
