import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form } from 'react-bootstrap';
import {
  setIsVariableNameIgnoreCase,
  setIsVariableValueIgnoreCase,
} from "../../../../actions/bpmTaskActions";
import { isVariableTypeAvailable } from "../../../../apiManager/services/taskSearchParamsFormatterService";
import { useTranslation } from "react-i18next";
const TaskIgnoreCaseComponent = React.memo(() => {
  const variableNameIgnoreCase = useSelector(
    (state) => state.bpmTasks.variableNameIgnoreCase
  );
  const variableValueIgnoreCase = useSelector(
    (state) => state.bpmTasks.variableValueIgnoreCase
  );
  const filterSelections = useSelector(
    (state) => state.bpmTasks.filterSearchSelections
  );
  const [isVariableTypeInFilter, setIsVariableTypeInFilter] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const setVariableNameIgnoreCase = (isIgnoreCase) => {
    dispatch(setIsVariableNameIgnoreCase(isIgnoreCase));
  };

  const setVariableValueIgnoreCase = (isIgnoreCase) => {
    dispatch(setIsVariableValueIgnoreCase(isIgnoreCase));
  };

  useEffect(() => {
    setIsVariableTypeInFilter(isVariableTypeAvailable(filterSelections));
  }, [filterSelections]);

  return (
    <>
      {filterSelections.length && isVariableTypeInFilter ? (
        <div>
          <span className="name-value-container d-flex align-items-center">
            {t("For Variable, ignore case of")}
            <Form className="ms-2">
              <Form.Check
                type="checkbox"
                id="name"
                label={t("Name")}
                checked={variableNameIgnoreCase}
                onChange={() =>
                  setVariableNameIgnoreCase(!variableNameIgnoreCase)
                }
              />
            </Form>
            <Form className="ms-2">
              <Form.Check
                type="checkbox"
                id="value"
                label={t("value")}
                checked={variableValueIgnoreCase}
                onChange={() =>
                  setVariableValueIgnoreCase(!variableValueIgnoreCase)
                }
              />
            </Form>
          </span>
        </div>
      ) : null}
    </>
  );
});

export default TaskIgnoreCaseComponent;
