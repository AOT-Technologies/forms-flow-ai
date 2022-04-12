package org.camunda.bpm.extension.hooks.controllers.stubs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.engine.authorization.Authorization;
import org.camunda.bpm.engine.authorization.Permission;
import org.camunda.bpm.engine.authorization.Resource;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationStub implements Authorization {

    private String groupId;
    private String userId;
    private String resourceId;

    @Override
    public void addPermission(Permission permission) {

    }

    @Override
    public void removePermission(Permission permission) {

    }

    @Override
    public boolean isPermissionGranted(Permission permission) {
        return false;
    }

    @Override
    public boolean isPermissionRevoked(Permission permission) {
        return false;
    }

    @Override
    public boolean isEveryPermissionGranted() {
        return false;
    }

    @Override
    public boolean isEveryPermissionRevoked() {
        return false;
    }

    @Override
    public Permission[] getPermissions(Permission[] permissions) {
        return new Permission[0];
    }

    @Override
    public void setPermissions(Permission[] permissions) {

    }

    @Override
    public String getId() {
        return null;
    }

    @Override
    public void setResourceType(int i) {

    }

    @Override
    public void setResource(Resource resource) {

    }

    @Override
    public int getResourceType() {
        return 0;
    }

    @Override
    public int getAuthorizationType() {
        return 0;
    }

    @Override
    public Date getRemovalTime() {
        return null;
    }

    @Override
    public String getRootProcessInstanceId() {
        return null;
    }
}
