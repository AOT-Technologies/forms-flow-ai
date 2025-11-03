import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CustomSearch, V8CustomButton, BuildModal } from "@formsflow/components";
import FormListGrid from "../../../components/Form/FormListGrid";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
// Grid handles fetching
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { push } from "connected-react-router";
import ImportProcess from "../../../components/Modals/ImportProcess";
import { setBpmnSearchText, setDmnSearchText, setIsPublicDiagram } from "../../../actions/processActions";
import userRoles from "../../../constants/permissions";
// import { HelperServices, StyleServices } from "@formsflow/service";
import {
  navigateToSubflowBuild,
  navigateToDecisionTableBuild,
} from "../../../helper/routerHelper";


const ProcessTable = React.memo(() => {
  const { viewType } = useParams();
  const isBPMN = viewType === "subflow";
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { createDesigns, manageAdvancedWorkFlows } = userRoles();
  const ProcessContents = isBPMN
    ? {
      processType: "BPMN",
      extension: ".bpmn",
      filterDataTestId: "Process-list-filter-bpmn",
      filterAriaLabel: "Filter the Process list (BPMN)",
      refreshDataTestId: "Process-list-refresh-bpmn",
      refreshAriaLabel: "Refresh the Process list (BPMN)",
      message: "No subflows have been found. Create a new subflow by clicking \"New BPMN\" button in the top right."
    }
    : {
      processType: "DMN",
      extension: ".dmn",
      filterDataTestId: "Process-list-filter-dmn",
      filterAriaLabel: "Filter the Process list (DMN)",
      refreshDataTestId: "Process-list-refresh-dmn",
      refreshAriaLabel: "Refresh the Process list (DMN)",
      message: "No decision tables have been found. Create a new decision table by clicking \"New DMN\" button in the top right."
    };

  // States and selectors
  const searchTextDMN = useSelector((state) => state.process.dmnSearchText);
  const searchTextBPMN = useSelector((state) => state.process.bpmnSearchText);
  // const iconColor = StyleServices.getCSSVariable('--ff-gray-medium-dark');
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  
  // Local UI state
  const [searchDMN, setSearchDMN] = useState(searchTextDMN || "");
  const [searchBPMN, setSearchBPMN] = useState(searchTextBPMN || "");
  const search = isBPMN ? searchBPMN : searchDMN;

  const [showBuildModal, setShowBuildModal] = useState(false);
  const [importProcess, setImportProcess] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Pagination/sort handled by FormListGrid

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  
  // const fetchProcesses = () => {};

 
  // const handleSortApply = (selectedSortOption, selectedSortOrder) => {
  //   setIsLoading(true);
  //   const action = isBPMN ? setBpmSort : setDmnSort;
  //   const resetSortOrders = HelperServices.getResetSortOrders(optionSortBy);
  //   dispatch(action({
  //     ...resetSortOrders,
  //     activeKey: selectedSortOption,
  //     [selectedSortOption]: { sortOrder: selectedSortOrder },
  //   }));

  //   setIsLoading(false);
  // };


  // const handleRefresh = () => {};

  // fetching handled by FormListGrid

  //Update api call when search field is empty
  useEffect(() => {
    if (!search.trim()) {
      dispatch(isBPMN ? setBpmnSearchText("") : setDmnSearchText(""));
    }
  }, [search, dispatch, isBPMN]);

  // const handleSort = () => {};
  const handleSearch = () => {
    setSearchLoading(true);
    if (isBPMN) {
      dispatch(setBpmnSearchText(searchBPMN));
    } else {
      dispatch(setDmnSearchText(searchDMN));
    }
    // FormListGrid will handle resetting pagination
  };


  // const handlePaginationChange = () => {};

  const gotoEdit = (data) => {
    if (MULTITENANCY_ENABLED) {
      dispatch(setIsPublicDiagram(!!data.tenantId));
    }
    dispatch(
      push(
        `${redirectUrl}${viewType}/edit/${data.processKey}`
      )
    );
  };

  const handleCreateProcess = () => {
    if (isBPMN) {
      navigateToSubflowBuild(dispatch, tenantKey);
    } else {
      navigateToDecisionTableBuild(dispatch, tenantKey);
    }
  };

  const handleBuildModal = () => {
    setShowBuildModal(false);
  };

  const showImportModal = () => {
    setShowBuildModal(false);
    setImportProcess(true);
  };

  // contents for import of  BPMN or DMN
  const modalContents = [
    {
      id: 1,
      heading: t("Build"),
      body: t(`Create the ${ProcessContents.processType} from scratch`),
      onClick: () => dispatch(push(`${redirectUrl}${viewType}/create`)),
    },
    {
      id: 2,
      heading: t("Import"),
      body: t(`Upload ${ProcessContents.processType} from a file`),
      onClick: showImportModal,
    },
  ];

  // Grid moved to FormListGrid
  return (
    <>
      <div className="toast-section">{/* <p>Toast message</p> */}</div>
      <div className="header-section-1">
        <div className="section-seperation-left">
          <h4> Build</h4>
        </div>
        <div className="section-seperation-right">
          {(createDesigns || manageAdvancedWorkFlows) && (
            <V8CustomButton
              variant="primary"
              label={t(`New ${ProcessContents.processType}`)}
              onClick={handleCreateProcess}
              dataTestid={`create-${ProcessContents.processType}-button`}
              ariaLabel={` Create ${ProcessContents.processType}`}
            />
          )}
        </div>
      </div>
      <div className="header-section-2">
        <div className="section-seperation-left">
          <CustomSearch
            search={search}
            setSearch={isBPMN ? setSearchBPMN : setSearchDMN}
            handleSearch={handleSearch}
            placeholder={t(`Search ${ProcessContents.processType} Name`)}
            searchLoading={searchLoading}
            title={t(`Search ${ProcessContents.processType} Name`)}
            dataTestId={`${ProcessContents.processType}-search-input`}
            width="22rem"
          />
        </div>
      </div>
      <FormListGrid
        mode="process"
        processType={isBPMN ? "BPMN" : "DMN"}
        onProcessEdit={gotoEdit}
        canProcessEdit={createDesigns || manageAdvancedWorkFlows}
      />

      <BuildModal
        show={showBuildModal}
        onClose={handleBuildModal}
        title={t(`New ${ProcessContents.processType}`)}
        contents={modalContents}
      />
      {importProcess && (
        <ImportProcess
          showModal={importProcess}
          closeImport={() => setImportProcess(false)}
          fileType={ProcessContents.extension}
        />
      )}
    </>
  );
});

export default ProcessTable;
