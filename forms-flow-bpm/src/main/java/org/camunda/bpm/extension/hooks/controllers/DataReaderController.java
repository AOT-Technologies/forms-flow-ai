package org.camunda.bpm.extension.hooks.controllers;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;


/**
 * This class is intended to query the analytics DB with query received in request and respond.
 * Blacklisted words : delete,update,insert,drop,create,truncate,grant
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Controller
public class DataReaderController {

    private final Logger LOGGER = Logger.getLogger(DataReaderController.class.getName());

    @Autowired
    private NamedParameterJdbcTemplate analyticsJdbcTemplate;


    @RequestMapping(value = "/engine-rest-ext/data", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody List<Map<String, Object>> getData(@RequestBody DataRequest dataRequest) {
        if(dataRequest != null && StringUtils.isNotBlank(dataRequest.getQuery())) {
            if(checkForBlackListedWords(dataRequest.getQuery())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid Input");
            }
            return analyticsJdbcTemplate.queryForList(dataRequest.getQuery(), dataRequest.getQueryParams());
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid Input");
    }

    /**
     * validation for blacklisted operations
     * @param query
     * @return
     */
    private boolean checkForBlackListedWords(String query) {
        String[] breachWords = new String[] {"delete","update","insert","drop","create","truncate","grant"};
        List<String> words = Arrays.asList(StringUtils.split(query.toLowerCase()));
        for(String entry : breachWords) {
            if(words.contains(entry)) {
                return true;
            }
        }
        return false;
    }

}

@Data
@NoArgsConstructor
class DataRequest {
    private String query;
    private Map<String, String> queryParams;
}