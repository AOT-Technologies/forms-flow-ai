package org.camunda.bpm.extension.hooks.controllers.mapper;

import org.camunda.bpm.extension.hooks.controllers.AdminController;
import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public final class AuthorizationMapper implements RowMapper<Authorization> {
    public Authorization mapRow(ResultSet rs, int rowNum) throws SQLException {
        Authorization auth = new Authorization();
        auth.setUserId(rs.getString("userid"));
        auth.setResourceId(rs.getString("resourceid"));
        auth.setGroupId(rs.getString("groupid"));
        return auth;
    }
}
