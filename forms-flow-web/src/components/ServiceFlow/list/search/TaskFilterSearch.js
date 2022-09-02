import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FILTER_COMPARE_OPTIONS,
  Filter_Search_Types,
} from "../../constants/taskConstants";
import OperatorFilterDropDown from "../../filter/OperatorFilterDropdown";
import TaskFilterSearchType from "./TaskFilterSearchType";
import {
  getFormattedDateAndTime,
  getISODateTime,
} from "../../../../apiManager/services/formatterService";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
const TaskFilterSearch = React.memo(
  ({
    filterSelections = [],
    deleteSearchFilter,
    updateSearchFilterData,
    updateFilter,
  }) => {
    const [valueBoxIndex, setShowValueBoxIndex] = useState(null);
    const [nameBoxIndex, setShowNameBoxIndex] = useState(null);
    const [selectedFilterInputValue, setSelectedFilterInputValue] =
      useState("");
    const [selectedFilterInputName, setSelectedFilterInputName] = useState("");
    const [inputDate, setUpInputDate] = useState(null);
    const [filterTaskVariableArray, setFilterTaskVariableArray] = useState([]);
    const { t } = useTranslation();
    const [taskVariable, setTaskVariable] = useState([]);
    const selectedFilter = useSelector(
      (state) => state.bpmTasks.selectedFilter
    );
    const [showCalander, setCalander] = useState(false);
    useEffect(() => {
      if (selectedFilter) {
        const taskVariable = selectedFilter?.properties?.variables || [];
        setTaskVariable(taskVariable);
        setFilterTaskVariableArray(taskVariable);
      }
    }, [selectedFilter]);

    const filterTaskVariable = (e) => {
      setFilterTaskVariableArray(
        // eslint-disable-next-line no-unused-vars
        taskVariable.filter((task, index) =>
          task?.name.includes(e.target.value)
        )
      );
    };

    const handleFilterValueChange = (e, index) => {
      if (e.key === "Enter") {
        e.preventDefault();
        updateFilterValue(index);
      }
    };

    const updateFilterValue = (index) => {
      setCalander(false);
      updateSearchFilterData(index, "value", selectedFilterInputValue);
      setShowValueBoxIndex(null);
      setSelectedFilterInputValue("");
    };

    const updateOperator = (index, value) => {
      updateSearchFilterData(index, "operator", value);
    };

    const updateFilterName = (index, value) => {
      updateSearchFilterData(index, "name", value || selectedFilterInputName);
      setShowNameBoxIndex(null);
      setSelectedFilterInputName("");
    };

    const handleFilterNameChange = (e, index) => {
      if (e.key === "Enter") {
        e.preventDefault();
        updateFilterName(index);
      }
    };

    const handleValueInput = (index, value = "", type) => {
      setShowValueBoxIndex(index);
      type !== Filter_Search_Types.DATE
        ? setSelectedFilterInputValue(value.toString())
        : setUpInputDate(value ? new Date(value) : null);
    };

    const handleNameInput = (index, value = "") => {
      setShowNameBoxIndex(index);
      setSelectedFilterInputName(value);
    };

    const handleFilterUpdate = (filter, index) => {
      updateFilter(filter, index);
    };

    const onUpDateInputdate = (updatedDate, index) => {
      setUpInputDate(updatedDate);
      updateSearchFilterData(
        index,
        "value",
        updatedDate ? getISODateTime(updatedDate) : null
      );
      setShowValueBoxIndex(null);
      setSelectedFilterInputValue("");
      /*followUpDate?getISODateTime(followUpDate):null*/
    };

    // eslint-disable-next-line no-unused-vars
    const UpDateInputComponent = React.forwardRef(({ value, onClick }, ref) => {
      return (
        <div onClick={onClick} ref={ref}>
          <i className="fa fa-calendar" />{" "}
          {inputDate ? (
            <span className="mr-4">{getFormattedDateAndTime(inputDate)}</span>
          ) : (
            "??"
          )}
        </div>
      );
    });

    return (
      <>
        {filterSelections.map((filter, index) => (
          <div key={index}>
            <div className="filter-details" key={index}>
              <div
                className="close-container  click-element"
                onClick={() => deleteSearchFilter(filter, index)}
              >
                <span className="close-btn" title={t("Remove search")}>
                  <i className="fa fa-times" aria-hidden="true" />
                </span>
              </div>

              <div className="box-container">
                <TaskFilterSearchType
                  filter={filter}
                  index={index}
                  handleFilterUpdate={handleFilterUpdate}
                />
                <span>
                  <span className="btn-container">
                    {filter.type === Filter_Search_Types.VARIABLES &&
                    nameBoxIndex === index ? (
                      <>
                        <button
                          className="btn click-element"
                          onClick={() => updateFilterName(index)}
                        >
                          <i className="fa fa-check" aria-hidden="true" />
                        </button>
                        <button
                          className="btn click-element"
                          onClick={() => setShowNameBoxIndex(null)}
                        >
                          <i className="fa fa-times" aria-hidden="true" />
                        </button>
                      </>
                    ) : null}
                  </span>
                  {filter.type === Filter_Search_Types.VARIABLES ? (
                    nameBoxIndex === index ? (
                      <div>
                        <input
                          type="text"
                          className="filters position-box"
                          placeholder=""
                          value={selectedFilterInputName}
                          onChange={(e) => {
                            filterTaskVariable(e);
                            setSelectedFilterInputName(e.target.value);
                          }}
                          onKeyDown={(e) => handleFilterNameChange(e, index)}
                        />
                        <div className="filter-items variable-filter-item">
                          {filterTaskVariableArray.map((variable) => (
                            <div
                              key={variable.label}
                              className="clickable p-0 mb-2 text-truncate"
                              onClick={() => {
                                setSelectedFilterInputName(variable.name);
                                updateFilterName(index, variable.name);
                              }}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title={`${variable.name}  (${variable.label})`}
                            >
                              <span>
                                {variable.name}{" "}
                                <span className="text-muted">
                                  {" "}
                                  ({variable.label})
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-truncate">
                        <span
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title={`${filter.name ? filter.name : "property"}`}
                          className="click-element"
                          onClick={() => handleNameInput(index, filter.name)}
                        >
                          {filter.name ? filter.name : "??"}
                        </span>
                      </div>
                    )
                  ) : null}

                  <span className="condition-container">
                    {valueBoxIndex === index &&
                    filter.type !== Filter_Search_Types.DATE ? (
                      <span className="btn-container second-box">
                        <span className="second-inner-box">
                          {filter.type === Filter_Search_Types.VARIABLES ? (
                            <button className="btn">
                              <i
                                className="fa fa-calendar"
                                aria-hidden="true"
                                onClick={() => setCalander(true)}
                              />
                            </button>
                          ) : null}
                          <button
                            className="btn click-element"
                            onClick={() => updateFilterValue(index)}
                          >
                            <i className="fa fa-check" aria-hidden="true" />
                          </button>

                          <button
                            className="btn click-element"
                            onClick={() => {
                              setShowValueBoxIndex(null);
                              setCalander(false);
                            }}
                          >
                            <i className="fa fa-times" aria-hidden="true" />
                          </button>
                        </span>
                      </span>
                    ) : null}
                    <div className="operator-box-container">
                      <span
                        title={t("Operator")}
                        className="operator-container"
                      >
                        <OperatorFilterDropDown
                          compareOptions={FILTER_COMPARE_OPTIONS[filter.type]}
                          operator={filter.operator}
                          changeOperator={(value) =>
                            updateOperator(index, value)
                          }
                        />
                      </span>

                      <span
                        id="task-search-input"
                        className={
                          filter.type === Filter_Search_Types.DATE && inputDate
                            ? "date-with-value"
                            : ""
                        }
                      >
                        {valueBoxIndex === index ? (
                          filter.type === Filter_Search_Types.DATE ? (
                            <DatePicker
                              selected={inputDate}
                              onChange={(date) =>
                                onUpDateInputdate(date, index)
                              }
                              showTimeSelect
                              isClearable
                              popperPlacement="bottom-start"
                              popperModifiers={{
                                offset: {
                                  enabled: true,
                                  offset: "5px, 10px",
                                },
                                preventOverflow: {
                                  enabled: true,
                                  escapeWithReference: false,
                                  boundariesElement: "viewport",
                                },
                              }}
                              customInput={<UpDateInputComponent />}
                            />
                          ) : (
                            <input
                              type={showCalander ? "datetime-local" : "text"}
                              className="filters"
                              placeholder=""
                              value={selectedFilterInputValue}
                              onChange={(e) =>
                                setSelectedFilterInputValue(e.target.value)
                              }
                              onKeyDown={(e) =>
                                handleFilterValueChange(e, index)
                              }
                            />
                          )
                        ) : (
                          <span
                            title={t("value")}
                            className="click-element"
                            onClick={() =>
                              handleValueInput(index, filter.value, filter.type)
                            }
                          >
                            {filter.value !== (undefined || null || "")
                              ? filter.type !== Filter_Search_Types.DATE
                                ? filter.value.toString()
                                : getFormattedDateAndTime(filter.value)
                              : "??"}
                          </span>
                        )}
                      </span>
                    </div>
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }
);

export default TaskFilterSearch;
