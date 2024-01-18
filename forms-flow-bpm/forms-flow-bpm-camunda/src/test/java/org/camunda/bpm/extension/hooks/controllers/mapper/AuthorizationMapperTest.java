package org.camunda.bpm.extension.hooks.controllers.mapper;

import org.camunda.bpm.extension.hooks.controllers.data.Authorization;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.sql.ResultSet;
import java.sql.SQLException;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class AuthorizationMapperTest {

    @InjectMocks
    private AuthorizationMapper authorizationMapper;

    @Mock
    private ResultSet resultSet;

    @Test
    public void test_mapRow() throws SQLException {
        when(resultSet.getString("userid"))
                .thenReturn("id1");
        when(resultSet.getString("resourceid"))
                .thenReturn("resourceid1");
        when(resultSet.getString("groupid"))
                .thenReturn("groupid1");
        Authorization auth = authorizationMapper.mapRow(resultSet,1);
        assertEquals(auth.getUserId(),"id1");
        assertEquals(auth.getResourceId(),"resourceid1");
        assertEquals(auth.getGroupId(),"groupid1");
    }
}
