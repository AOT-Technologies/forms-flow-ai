package org.camunda.bpm.extension.hooks.controllers;

import com.nimbusds.oauth2.sdk.util.CollectionUtils;
import lombok.Data;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * This class list all task from history tables of camunda.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Deprecated
@Controller
public class TaskController {

    private static final Logger LOGGER = Logger.getLogger(TaskController.class.getName());

    @Autowired
    private NamedParameterJdbcTemplate bpmJdbcTemplate;

    @RequestMapping(value = "/engine-rest-ext/task", method = RequestMethod.GET, produces = "application/json")
    private @ResponseBody List<Task> getTasks(@AuthenticationPrincipal Jwt principal) {
        List<String> groups = getGroups(principal);
        Map<String,Task> taskMap = new HashMap<>();
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("groups", groups);
        List<Task> tasks = bpmJdbcTemplate.query(TaskQuery.TASK_BY_GROUP.getQuery(), parameters, (ResultSetExtractor<List<Task>>) rs -> {

            while(rs.next()){
                String taskId = rs.getString("taskid");
                if(!taskMap.containsKey(taskId)) {
                    taskMap.put(rs.getString("taskid"), new Task());
                    Task task = taskMap.get(taskId);
                    task.setId(rs.getString("taskid"));
                    task.setName(rs.getString("taskname"));
                    task.setAssignee(rs.getString("assignee"));
                    task.setStatus(rs.getString("status"));
                    task.setProcessInstanceId(rs.getString("pid"));
                    task.setProcessDefinitionKey(rs.getString("processdefkey"));
                    task.setTaskDefinitionKey(rs.getString("taskDefinitionKey"));
                    task.setGroupName(rs.getString("groupname"));
                    List<Variable> variables = new ArrayList<>();
                    task.setVariables(variables);
                }
                taskMap.get(taskId).getVariables().add(new Variable(rs.getString("variablename"), rs.getString("variablevalue")));
            }
            return new ArrayList<>(taskMap.values());
        });
        return tasks;
    }


    @RequestMapping(value = "/engine-rest-ext/task/{taskid}", method = RequestMethod.GET, produces = "application/json")
    private @ResponseBody Task getTask(@PathVariable("taskid") String taskid,@AuthenticationPrincipal Jwt principal) {
        List<String> groups = getGroups(principal);
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        parameters.addValue("groups", groups);
        parameters.addValue("taskid", taskid);
        Task task = bpmJdbcTemplate.query(TaskQuery.TASK_BY_ID.getQuery(), parameters, rs -> {
            Task taskObj = new Task();
            taskObj.setVariables(new ArrayList<>());
            while(rs.next()){
                taskObj.setId(rs.getString("taskid"));
                taskObj.setName(rs.getString("taskname"));
                taskObj.setAssignee(rs.getString("assignee"));
                taskObj.setStatus(rs.getString("status"));
                taskObj.setProcessDefinitionKey(rs.getString("processdefkey"));
                taskObj.setTaskDefinitionKey(rs.getString("taskDefinitionKey"));
                taskObj.setProcessInstanceId(rs.getString("pid"));
                taskObj.setGroupName(rs.getString("groupname"));
                taskObj.getVariables().add(new Variable(rs.getString("variablename"), rs.getString("variablevalue")));
            }
            return taskObj;
        });
        if(StringUtils.isBlank(task.getId())) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task Not Found"); }
        return task;
    }

    private List<String> getGroups(Jwt principal) {
        List<String> rawgroups = principal.getClaim("groups");
        List<String> groups = new ArrayList<>();
        if(CollectionUtils.isNotEmpty(rawgroups)) {
            for(String entry: rawgroups) {
                String groupName = StringEscapeUtils.unescapeJava(entry);
                if(StringUtils.startsWith(groupName,"/")) {
                    groups.add(StringUtils.substring(groupName,1));
                } else {
                    groups.add(groupName);
                }

            }
        }
        return groups;
    }

    @Data
    class Task  extends  TaskDto {
        private String processInstanceId;
        private String processDefinitionKey;
        private String taskDefinitionKey;
        private String groupName;
        private String status;
        private List<Variable> variables;
    }

    @Data
    class Variable {
        private String name;
        private String value;

        Variable(String name, String value) {
            this.name = name;
            this.value = value;
        }
    }

    enum TaskQuery {
        TASK_BY_GROUP("select aht.id_  taskid, aht.name_ taskname,  act.group_id_ groupname, aht.proc_inst_id_ pid, " +
                "aht.proc_def_key_ processdefkey, aht.task_def_key_ taskDefinitionKey, aht.assignee_ assignee, ahv.name_ variablename, ahv.text_ variablevalue, " +
                "aht.delete_reason_ status from act_hi_varinst ahv, act_hi_taskinst aht FULL OUTER JOIN act_ru_identitylink act  " +
                "ON aht.id_ = act.task_id_ where aht.proc_inst_id_ = ahv.proc_inst_id_ and (act.group_id_ is null or act.group_id_  IN (:groups))"),

        TASK_BY_ID("select aht.id_  taskid, aht.name_ taskname,  act.group_id_ groupname, aht.proc_inst_id_ pid, " +
                              "aht.proc_def_key_ processdefkey, aht.task_def_key_ taskDefinitionKey, aht.assignee_ assignee, ahv.name_ variablename, ahv.text_ variablevalue, " +
                              "aht.delete_reason_ status from act_hi_varinst ahv, act_hi_taskinst aht FULL OUTER JOIN act_ru_identitylink act  " +
                              "ON aht.id_ = act.task_id_ where aht.proc_inst_id_ = ahv.proc_inst_id_ and (act.group_id_ is null or act.group_id_  IN (:groups)) and aht.id_ = :taskid");

        private String query;
        TaskQuery(String query) {
            this.query = query;
        }

        private String getQuery() {
            return query;
        }
    }

}
