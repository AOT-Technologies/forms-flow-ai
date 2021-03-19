package org.camunda.bpm.extension.hooks.services.analytics;


import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Service class for publishing data to downstream analytics system.
 *
 * @author  sumathi.thirumani@aot-technologies.com
 */
@Service("dbdatapipeline")
public class SimpleDBDataPipeline extends AbstractDataPipeline {

    private final Logger LOGGER = Logger.getLogger(SimpleDBDataPipeline.class.getName());

    @Autowired
    private NamedParameterJdbcTemplate  analyticsJdbcTemplate;

    /**
     * Transformation method.
     *
     * @param variables
     * @return
     */
    @Override
    public Map<String, Object> prepare(Map<String, Object> variables) {
        LOGGER.info("Inside transformation for pid :"+ getIdentityKey(variables) +" : map: "+variables);
        Map<String,Object> dataMap = new HashMap<>();
        for(Map.Entry<String,Object> entry : variables.entrySet()) {
            if(entry.getValue() != null) {
                if(StringUtils.endsWith(entry.getKey(),"_date") || StringUtils.endsWith(entry.getKey(),"_date_time")) {
                    if(entry.getValue() != null && !"null".equalsIgnoreCase(String.valueOf(entry.getValue())) && StringUtils.isNotBlank(String.valueOf(entry.getValue()))) {
                        DateTime ts = new DateTime(String.valueOf(entry.getValue()));
                        dataMap.put(entry.getKey(), new Timestamp((ts.getMillis())));
                    }
                } else {
                    dataMap.put(entry.getKey(), entry.getValue());
                }

            }
        }
        LOGGER.info("Post transformation:"+ dataMap);
        return dataMap;
    }

    /**
     * Implementation method for direct database connectivity with downstream system.
     * This method handles lob & non-lob objects separately to keep the thread span short.
     *
     * @param data
     * @return
     */
    @Override
    public DataPipelineResponse publish(Map<String,Object> data) {
        DataPipelineResponse response = new DataPipelineResponse();
        Map<String,Object> nonLobMap = new HashMap<>();
        Map<String,Map<String,Object>> lobMap = new HashMap<>();
        try {
            for(Map.Entry<String,Object> entry : data.entrySet()) {
                if(StringUtils.endsWith(entry.getKey(),"_file")) {
                    String fileNamePrefix = StringUtils.substringBefore(entry.getKey(),"_file");
                    if(!lobMap.containsKey(entry.getKey())) {
                        Map<String,Object> lobData = new HashMap<>();
                        lobData.put("name",getDateWithoutSpecialCharacters(String.valueOf(data.get(fileNamePrefix.concat("_name")))));
                        lobData.put("file_mimetype",data.get(fileNamePrefix.concat("_mimetype")));
                        lobData.put("file_stream",entry.getValue());
                        lobData.put("file_size",data.get(fileNamePrefix.concat("_size")));
                        lobData.put("stream_id",data.get(fileNamePrefix.concat("_stream_id")));
                        lobData.put("files_entity_key",data.get("files_entity_key"));
                         //nonLobMap.put(StringUtils.concat("_id"), data.get(fileNamePrefix.concat("_stream_id")));

                        lobMap.put(entry.getKey(),lobData);
                    }
                } else {
                    nonLobMap.put(entry.getKey(), entry.getValue());
                }


            }

            for(Map.Entry<String,Object> entry : data.entrySet()) {
                if (StringUtils.endsWith(entry.getKey(), "_uploadname")) {
                    if (entry.getValue() != null && StringUtils.isNotBlank(String.valueOf(entry.getValue())) && !"null".equals(String.valueOf(entry.getValue()))) {
                        String filename = String.valueOf(entry.getValue());
                        List<String> fieldValue = new ArrayList<>();
                        for (String fentry : filename.split(",")) {
                            String name = StringUtils.substringBefore(fentry, ".");
                            String prefix = StringUtils.substringBefore(entry.getKey(), "_file_uploadname");
                            fieldValue.add(String.valueOf(data.get(name + prefix + "_stream_id")));
                        }
                        nonLobMap.put(StringUtils.substringBefore(entry.getKey(), "_file_uploadname") + "_file_id", String.join(",", fieldValue));
                    }

                }
            }


            //Non-lob objects block
            String query = getQuery(String.valueOf(nonLobMap.get("entity_key")),nonLobMap,"pid",getIdentityKey(data));
            LOGGER.info("Non-lob query:"+ query);
            analyticsJdbcTemplate.update(query,nonLobMap);
            // Lob objects
            handleFileObject(lobMap);
            response.setStatus(ResponseStatus.SUCCESS);
        } catch(Exception ex) {
            LOGGER.log(Level.SEVERE, "Exception occurred in publishing data for analytics system", ex);
            response.setStatus(ResponseStatus.FAILURE, ex);
        }
        return response;
    }

    private static String getDateWithoutSpecialCharacters(String filename) {
        String timestampVal =  StringUtils.replace(StringUtils.replace(
                StringUtils.replace(StringUtils.replace(StringUtils.substringBefore(new DateTime().toString(), "."), "-", ""), ":", "")
                ,".","")," ","");
        return StringUtils.substringBeforeLast(filename, ".")+"_"+timestampVal+"."+StringUtils.substringAfterLast(filename, ".");
    }


    /**
     * Implementation method for notification of execution status.
     *
     * @param response
     * @return
     */
    @Override
    public Map<String,Object> notificationMessage(DataPipelineResponse response) {
        Map<String,Object> rspVarMap = new HashMap<>();
        LOGGER.info("Data pipeline status:" +response.getResponseCode());
        rspVarMap.put("code",response.getResponseCode());
        rspVarMap.put("message",response.getResponseMessage());
        rspVarMap.put("exception",response.getException());
        return rspVarMap;
    }

    /**
     * Method to handle updates of large objects as independent SQL statements.
     *
     * @param lobMap
     * @throws SQLException
     */
    private void handleFileObject(Map<String,Map<String,Object>> lobMap) throws SQLException {
        for(Map.Entry<String,Map<String,Object>> entry : lobMap.entrySet()) {
            String query = getQuery(String.valueOf(entry.getValue().get("files_entity_key")),entry.getValue(),"stream_id",String.valueOf(entry.getValue().get("stream_id")));
            LOGGER.info("lob query:"+ query);
            analyticsJdbcTemplate.update(query,entry.getValue());
        }
    }

    /**
     * Returns the query bound with the table and criteria columns.
     *
     * @param tableName
     * @param pkColums
     * @return
     */
    private String getValidationQuery(String tableName,String... pkColums) {
        return IQueryFactory.getValidationQuery(tableName,pkColums);
    }

    /**
     *  Returns the query
     * @param formKey
     * @param dataMap
     * @return
     * @throws SQLException
     */
    private String getQuery(String formKey, Map<String,Object> dataMap,String pkname, String pkvalue) throws SQLException {
        Map<String,Object> cols = getColumns(formKey, pkname,pkvalue);
        List<String> filteredCols = new ArrayList<>();
        LOGGER.info("Prepare query for columns:"+cols);
        for(Map.Entry<String,Object> entry : dataMap.entrySet()) {
            if(cols.containsKey(entry.getKey().toLowerCase())) {
                filteredCols.add(entry.getKey());
            }
        }
        LOGGER.info("Value of expression"+StringUtils.isEmpty(getIdentityKey(cols)));
        return IQueryFactory.prepareQuery(formKey,filteredCols,StringUtils.isEmpty(getIdentityKey(cols))? Boolean.FALSE : Boolean.TRUE,pkname);
    }


    /**
     * This method returns the column metadata for preparing dynamic queries.
     * @param formKey
     * @param pkName
     * @param pkValue
     * @return
     * @throws SQLException
     */
    private Map<String,Object> getColumns(String formKey,String pkName, String pkValue) throws SQLException {
        SqlParameterSource namedParameters = new MapSqlParameterSource(pkName, pkValue);
        Map<String, Object> resp = analyticsJdbcTemplate.query(getValidationQuery(formKey,pkName), namedParameters,new ResultSetExtractor<Map<String,Object>>(){
            @Override
            public Map<String,Object> extractData(ResultSet rs) throws SQLException, DataAccessException {
                Map<String,Object> dataMap=new HashMap<>();
                ResultSetMetaData resultSetMetaData = rs.getMetaData();
                for (int i = 1; i <= resultSetMetaData.getColumnCount(); i++) {
                    dataMap.put(rs.getMetaData().getColumnName(i).toLowerCase(), null);
                }
                while(rs.next()) {
                    for (int j = 1; j <= resultSetMetaData.getColumnCount(); j++) {
                        if(StringUtils.endsWith(rs.getMetaData().getColumnName(j),"_file")) {
                            //Not-loading the lob objects on retrieve to keep the metadata lightweight.
                            dataMap.put(rs.getMetaData().getColumnName(j), null);
                        } else {
                            dataMap.put(rs.getMetaData().getColumnName(j), JdbcUtils.getResultSetValue(rs, j));
                        }
                    }
                }
                return dataMap;
            }
        });
        return resp;
    }


}
