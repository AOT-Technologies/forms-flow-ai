/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.camunda.bpm.extension.hooks.adapter.mail.request;

import org.camunda.bpm.extension.hooks.adapter.mail.CustomEmailConnector;
import org.camunda.bpm.extension.hooks.adapter.mail.response.EmptyResponse;
import org.camunda.connect.impl.AbstractConnectorRequest;

import java.util.Arrays;
import java.util.List;

public class ConnectorRequest extends AbstractConnectorRequest<EmptyResponse> {

    private static final String PARAM_TO =  "to";
    private static final String PARAM_CC = "cc";
    private static final String PARAM_SUBJECT ="subject" ;
    private static final String PARAM_TEXT = "text";
    private static final String PARAM_FILE_NAMES = "filenames";

    public ConnectorRequest(CustomEmailConnector connector) {
        super(connector);

    }
    public String getTo() {
        return getRequestParameter(PARAM_TO);
    }

    public ConnectorRequest to(String to) {
        setRequestParameter(PARAM_TO, to);
        return this;
    }

    public String getCc() {
        return getRequestParameter(PARAM_CC);
    }

    public ConnectorRequest cc(String cc) {
        setRequestParameter(PARAM_CC, cc);
        return this;
    }

    public String getSubject() {
        return getRequestParameter(PARAM_SUBJECT);
    }

    public ConnectorRequest subject(String subject) {
        setRequestParameter(PARAM_SUBJECT, subject);
        return this;
    }

    public String getText() {
        return getRequestParameter(PARAM_TEXT);
    }

    public ConnectorRequest text(String text) {
        setRequestParameter(PARAM_TEXT, text);
        return this;
    }

    public List<String> getFileNames() {
        return getRequestParameter(PARAM_FILE_NAMES);
    }

    public ConnectorRequest fileNames(String... fileNames) {
        setRequestParameter(PARAM_FILE_NAMES, Arrays.asList(fileNames));
        return this;
    }


}
