package org.camunda.bpm.extension.keycloak.plugin;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "formsflow.ai")
public class CamundaAuthorizationProperties {

    private List<AuthorizationConfig> authorizations;

    public List<AuthorizationConfig> getAuthorizations() {
        return authorizations;
    }

    public void setAuthorizations(List<AuthorizationConfig> authorizations) {
        this.authorizations = authorizations;
    }

    public static class AuthorizationConfig {
        private String groupId;
        private String userId;
        private String resourceType;
        private String resourceId;
        private List<String> permissions;

        public String getGroupId() {
            return groupId;
        }

        public void setGroupId(String groupId) {
            this.groupId = groupId;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getResourceType() {
            return resourceType;
        }

        public void setResourceType(String resourceType) {
            this.resourceType = resourceType;
        }

        public String getResourceId() {
            return resourceId;
        }

        public void setResourceId(String resourceId) {
            this.resourceId = resourceId;
        }

        public List<String> getPermissions() {
            return permissions;
        }

        public void setPermissions(List<String> permissions) {
            this.permissions = permissions;
        }
    }
}