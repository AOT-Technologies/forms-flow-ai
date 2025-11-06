import React, { useEffect, useState, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FormSubmissionHistoryModal,
  SubmissionHistoryWithViewButton,
  DownloadPDFButton,
  V8CustomButton,
  BreadCrumbs,
  BreadcrumbVariant,
  RefreshIcon,
  
} from "@formsflow/components";
import { WrappedTable } from "@formsflow/components";
import { getApplicationById } from "../../../apiManager/services/applicationServices";
import Loading from "../../../containers/Loading";
import {
  setApplicationDetailLoader,
  setApplicationDetailStatusCode,
} from "../../../actions/applicationActions";
import View from "../../../routes/Submit/Submission/Item/View";
import { getForm, getSubmission } from "@aot-technologies/formio-react";
import NotFound from "../../../components/NotFound";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { getCustomSubmission } from "../../../apiManager/services/FormServices";
import { setUpdateHistoryLoader } from "../../../actions/taskApplicationHistoryActions";
import { fetchApplicationAuditHistoryList } from "../../../apiManager/services/applicationAuditServices";
import userRoles from "../../../constants/permissions";
import { 
  getProcessActivities,
  getProcessDetails,
} from "../../../apiManager/services/processServices";
import { navigateToSubmitFormsListing, navigateToFormEntries } from "../../../helper/routerHelper";
import { HelperServices, StyleServices } from "@formsflow/service";

const HistoryDataGrid = ({ historyData, onRefresh, iconColor, loading }) => {
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 1 });

  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
  };

  const columns = [
    {
      field: "Completed2",
      headerName: t("Completed"),
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "created",
      headerName: t("Created"),
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        const dateValue = HelperServices.getLocaldate(params.value);
        return (
          <span title={dateValue}>
            {dateValue}
          </span>
        );
      },
    },
    {
      field: "applicationStatus",
      headerName: t("Status"),
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      align: "right",
      sortable: false,
      cellClassName: "last-column",
      renderHeader: () => (
        <V8CustomButton
          variant="secondary"
          icon={<RefreshIcon color={iconColor} />}
          iconOnly
          onClick={onRefresh}
          />
        )
    },
  ];

  const rows = historyData || [];

  return (
    <WrappedTable
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.submissionId || `${row.formId}-${row.created}`}
      rowCount={rows.length}
      noRowsLabel={t("No history found")}
      paginationMode="client"
      sortingMode="client"
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}
    />
  );
};

HistoryDataGrid.propTypes = {
  historyData: PropTypes.array,
  onRefresh: PropTypes.func,
  iconColor: PropTypes.string,
  loading: PropTypes.bool,
};


const ViewApplication = React.memo(() => {
  const { t } = useTranslation();
  const { applicationId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { viewSubmissionHistory,analyze_submissions_view_history, 
    analyze_process_view} = userRoles();
  const isFromFormEntries =
    new URLSearchParams(history.location.search).get("from") === "formEntries";
  const {
    applicationDetail,
    applicationDetailStatusCode,
    isApplicationDetailLoading,
  } = useSelector((state) => ({
    applicationDetail: state.applications.applicationDetail,
    applicationDetailStatusCode: state.applications.applicationDetailStatusCode,
    isApplicationDetailLoading: state.applications.isApplicationDetailLoading,
  }));
  const submission = useSelector((state) => state.submission?.submission || {});
  const form = useSelector((state) => state.form?.form || {});
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);
  const [diagramXML, setDiagramXML] = useState("");
  const markers = useSelector((state) => state.process.processActivityList);
  const parentFormId = useSelector(
      (state) => state.form.form?.parentFormId
  );
  const iconColor = StyleServices.getCSSVariable("--ff-gray-medium-dark");

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHistoryGrid, setShowHistoryGrid] = useState(false);
  const { appHistory, isHistoryListLoading } = useSelector(
    useMemo(
      () => (state) => ({
        appHistory: state.taskAppHistory.appHistory,
        isHistoryListLoading: state.taskAppHistory.isHistoryListLoading,
      }),
      []
    )
  );

  const handleHistoryRefresh = () => {
    dispatch(setUpdateHistoryLoader(true));
    dispatch(fetchApplicationAuditHistoryList(applicationId));
  };

  useEffect(() => {
    dispatch(setUpdateHistoryLoader(true));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setApplicationDetailLoader(true));
    dispatch(
      getApplicationById(applicationId, (err, res) => {
        if (!err) {
          if (res.submissionId && res.formId) {
            dispatch(getForm("form", res.formId));
            if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
              dispatch(getCustomSubmission(res.submissionId, res.formId));
            } else {
              dispatch(
                getSubmission("submission", res.submissionId, res.formId)
              );
            }
          }
        }
      })
    );

    return () => {
      dispatch(setApplicationDetailLoader(true));
      dispatch(setApplicationDetailStatusCode(""));
    };
  }, [applicationId, dispatch]);


 useEffect(() => {
    if (
      (viewSubmissionHistory || analyze_submissions_view_history) &&
      applicationId &&
      isHistoryListLoading
    ) {
      dispatch(fetchApplicationAuditHistoryList(applicationId));
    }
  }, [applicationId, isHistoryListLoading, dispatch]);

    useEffect(async() => {
    const processKey = applicationDetail?.processKey;
    const processInstanceId = applicationDetail?.processInstanceId;
    if ( processKey && processInstanceId && analyze_process_view) {
      try{
        setIsDiagramLoading(true);
        dispatch(getProcessActivities(processInstanceId));
        const res = await getProcessDetails({processKey,tenant_key: tenantKey});
        setDiagramXML(res?.data?.processData || "");
       
        }
      catch (error) {
        console.error("Error fetching process details:", error);
      }finally{
         setIsDiagramLoading(false);
      }
      
    }
  }, [applicationDetail, tenantKey, analyze_process_view]);
  if (isApplicationDetailLoading) {
    return <Loading />;
  }

  if (
    Object.keys(applicationDetail).length === 0 &&
    applicationDetailStatusCode === 403
  ) {
    return (
      <NotFound
        errorMessage={t("Access Denied")}
        errorCode={applicationDetailStatusCode}
      />
    );
  }

    // will be updated once application/draft listing page is ready
  const handleBack = () => {
    navigateToFormEntries(dispatch, tenantKey, parentFormId || applicationDetail.formId);

  };

  const redirectBackToForm = () => {
    navigateToSubmitFormsListing(dispatch, tenantKey);
  };

  const breadcrumbItems = [
    { id: "submit", label: t("Submit") },
    { id: "form-title", label: form.title },
  ];

  const handleBreadcrumbClick = (item) => {
    if (item.id === "submit") {
      redirectBackToForm();
    } else if (item.id === "form-title") {
      handleBack();
    }
  };

  return (
    <div>
      {/* Header Section */}

         <div className="header-section-1">
            <div className="section-seperation-left d-block">
                <BreadCrumbs 
                  items={breadcrumbItems}
                  variant={BreadcrumbVariant.MINIMIZED}
                  underline
                  onBreadcrumbClick={handleBreadcrumbClick} 
                /> 
                <h4>{applicationId}</h4>
            </div>
        </div>

      <div className="header-section-2">
        <div className="section-seperation-left">
          {((isFromFormEntries && viewSubmissionHistory) ||
            (!isFromFormEntries && analyze_submissions_view_history)) && (
            <>
              <V8CustomButton
                variant="secondary"
                label={t("Form")}
                selected={!showHistoryGrid}
                onClick={() => setShowHistoryGrid(false)}
              />
              <V8CustomButton
                variant="secondary"
                label={t("History")}
                selected={showHistoryGrid}
                onClick={() => setShowHistoryGrid(true)}
              />
            </>
          )}
          {(form?._id && submission?._id) && (
            <DownloadPDFButton
              form_id={form._id}
              submission_id={submission._id}
              title={form.title}
            />
          )}
        </div>
      </div>

      <div className="body-section">
        {showHistoryGrid ? (
          <HistoryDataGrid
            historyData={appHistory}
            onRefresh={handleHistoryRefresh}
            iconColor={iconColor}
            loading={isHistoryListLoading}
          />
        ) : (
          <View page="application-detail" />
        )}
      </div>
      {(analyze_submissions_view_history && !isFromFormEntries) ?  
      <SubmissionHistoryWithViewButton
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        redirectUrl={redirectUrl}
        histories={appHistory}
        isHistoryListLoading={isHistoryListLoading}
        title="History"
        showBpmnDiagram={analyze_process_view}
        diagramXML={diagramXML}
        activityId={markers?.[0]?.activityId ?? ""}
        isProcessDiagramLoading={isDiagramLoading}
      /> : <FormSubmissionHistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="History"
        allHistory={appHistory}
        historyCount={appHistory.length}
      /> }
      
     
    </div>
  );
});

export default ViewApplication;
