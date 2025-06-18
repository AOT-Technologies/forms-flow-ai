import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { NavDropdown } from "react-bootstrap";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import { MULTITENANCY_ENABLED } from "../constants/constants";
import { setBPMFilterLoader, setBPMFiltersAndCount, setDefaultFilter, setSelectedTaskID, setViewType } from '../actions/bpmTaskActions';
import CreateNewFilterDrawer from "../components/ServiceFlow/list/sort/CreateNewFilter";
import { useTranslation } from "react-i18next"; 
import { fetchBPMTaskCount } from "../apiManager/services/bpmTaskServices";
import { toast } from "react-toastify";
import { updateDefaultFilter } from "../apiManager/services/userservices";
import _ from "lodash";

function TaskHead() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const filtersAndCount = useSelector((state) => state.bpmTasks.filtersAndCount);
  const [filterSelectedForEdit, setFilterSelectedForEdit] = useState(null);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const viewType = useSelector((state) => state.bpmTasks.viewType);
  const isFilterLoading = useSelector((state) => state.bpmTasks.isFilterLoading);
  const filterListItems = useSelector((state) => state.bpmTasks.filterList);
  const isTaskListLoading = useSelector((state) => state.bpmTasks.isTaskListLoading);
  const defaultFilter = useSelector((state)=> state.user.defaultFilter);

  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const goToTask = () => {
    fetchBPMTaskCount(filterListItems)
      .then((res) => {
        dispatch(setBPMFiltersAndCount(res.data));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        dispatch(setBPMFilterLoader(false));
      });
    dispatch(push(`${baseUrl}task`));
  };

  const changeTaskView = (view) => {
    if (viewType !== view) {
      dispatch(setSelectedTaskID(null));
      dispatch(setViewType(view));
    }
  };

  const filterListLoading = () => {
    return <>{isFilterLoading && <>{t("Loading...")}</>}</>;
  };

  const getItemCount = (filterName) => {
    const filter = filtersAndCount?.find(f => f.name === filterName);
    return filter ? filter.count : 0;
  };

  const count = isTaskListLoading ? "" : `(${getItemCount(selectedFilter?.name)})`;

  const textTruncate = (wordLength, targetLength, text) => {
    return text?.length > wordLength
      ? text.substring(0, targetLength) + "..."
      : text;
  };

  const defaultFilterChange = useCallback(()=>{
    updateDefaultFilter(selectedFilter.id == defaultFilter ? null : selectedFilter.id).then((res)=>{
      dispatch(setDefaultFilter(res.data.defaultFilter));
      if (selectedFilter.id == defaultFilter){
        toast.success(t(`Default filter removed`));
      }else{
        toast.success(t(`${_.startCase(selectedFilter.name)} added as default filter`));
      }
        
    }).catch((err)=>{
      console.error(err);
    });
  },[selectedFilter,defaultFilter]);

  return (
    <div>
      <div className="d-flex flex-md-row flex-column align-items-md-center justify-content-between">
        <div className="d-flex align-items-center gap-3" style={{transition: "0.5s"}}>
          <NavDropdown
            className="filter-drop-down"
            title={
              <span className="h4 fw-bold">
                <i className="fa fa-list-ul me-2" />
                {selectedFilter?.name
                  ? textTruncate(25, 23, `${selectedFilter?.name} ${count}`)
                  : filterListLoading()}
              </span>
            }
            onClick={goToTask}
          >
            <ServiceFlowFilterListDropDown
              selectFilter={(filter, editPermission) => {
                setFilterSelectedForEdit(filter);
                setViewMode(editPermission ? false : true);
              }}
              openFilterDrawer={setOpenFilterDrawer}
            />
          </NavDropdown>
          {
            selectedFilter?.id ? <div className="form-check mx-2 mb-0 form-switch">

            <input
              className="form-check-input cursor-pointer"
              onChange={defaultFilterChange}
              disabled={!selectedFilter?.id}
              checked={defaultFilter == selectedFilter?.id}
              type="checkbox"
              role="switch"
              id="defaultFilter"
              data-testid="defaultFilter" 
            />
               <label
              className="form-check-label cursor-pointer set-default-filter-label"
              htmlFor="defaultFilter"
            >
              {t("Set as default filter")}
            </label>

          </div> : null }
          <CreateNewFilterDrawer
            selectedFilterData={filterSelectedForEdit}
            openFilterDrawer={openFilterDrawer}
            setOpenFilterDrawer={setOpenFilterDrawer}
            setFilterSelectedForEdit={setFilterSelectedForEdit}
            viewMode={viewMode}
            resetViewMode={() => setViewMode(false)} 
          />
        </div>
        <div>
          <button
            type="button"
            className={`btn me-1 btn-md${
              viewType ? "btn-light" : "btn-secondary active"
            }`}
            onClick={() => {
              changeTaskView(false);
            }}
          >
            <i className="fa-solid fa-list me-2"></i>
            {t("List View")}
          </button>
          <button
            type="button"
            className={`btn btn-md ${viewType ? "btn-secondary active" : "btn-light"}`}
            onClick={() => {
              changeTaskView(true);
            }}
          >
            <i className="fa-regular fa-rectangle-list me-2"></i>
            {t("Card View")}
          </button>
        </div>
      </div>
      <hr />
    </div>
  );
}

export default TaskHead;

