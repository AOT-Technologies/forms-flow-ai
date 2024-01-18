import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { Translation} from "react-i18next";
import { fetchApplicationAuditHistoryList } from "../../apiManager/services/applicationAuditServices";
import Loading from "../../containers/Loading";
import Nodata from "../../components/Nodata";
import { setUpdateHistoryLoader } from "../../actions/taskApplicationHistoryActions";
import HistoryTable from "./historyTable";

const HistoryList = React.memo((props) => {
  const dispatch = useDispatch();
  const isHistoryListLoading = useSelector(
    (state) => state.taskAppHistory.isHistoryListLoading
  );
  const appHistory = useSelector((state) => state.taskAppHistory.appHistory);
  const applicationId = props.applicationId;
  useEffect(() => {
    dispatch(setUpdateHistoryLoader(true));
  }, [dispatch]);

  useEffect(() => {
    if (applicationId && isHistoryListLoading) {
      dispatch(fetchApplicationAuditHistoryList(applicationId));
    }
  }, [applicationId, isHistoryListLoading, dispatch]);

  if (!applicationId) {
    return (
      <Nodata
        text={
          <Translation>{(t) => t("No Submission History found")}</Translation>
        }
        className={"div-no-application-list text-center"}
      />
    );
  }
  if (isHistoryListLoading) {
    return <Loading />;
  }
  return appHistory.length > 0 ? (
    <>
    <HistoryTable/>
    </>
  ) : (
    <Nodata
      text={
        <Translation>{(t) => t("No Submission History found")}</Translation>
      }
      className={"div-no-application-list text-center"}
    />
  );
});

export default HistoryList;
