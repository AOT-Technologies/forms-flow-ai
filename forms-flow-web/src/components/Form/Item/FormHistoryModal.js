import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setFormHistories,
  setRestoreFormId,
} from "../../../actions/formActions";
import { getLocalDateTime } from "../../../apiManager/services/formatterService";
import { getFormHistory } from "../../../apiManager/services/FormServices";
import Loading from "../../../containers/Loading";
import { useTranslation } from "react-i18next";

const FormHistoryModal = ({ historyModal, handleModalChange, gotoEdit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showCount, setShowCount] = useState(3);
  const [isLoading, setLoading] = useState(false);
  const processData = useSelector((state) => state.process?.formProcessList);
  const formHistory = useSelector((state) => state.formRestore?.formHistory);
  const [sliceFormHistory, setSliceFormHistory] = useState([]);
  const historyRef = useRef(null);
   
  useEffect(() => {
    setSliceFormHistory(formHistory.slice(0, showCount));
  },[showCount,formHistory]);

  useEffect(() => {
    if (historyModal) {
      setLoading(true);
      getFormHistory(processData.parentFormId)
        .then((res) => {
          const historyLength = res.data?.length;
          setShowCount(historyLength <= 3 ? historyLength : 3);
          dispatch(setFormHistories(res.data));
        })
        .catch(() => {
          dispatch(setFormHistories([]));
        }).finally(()=>{
          setLoading(false);
        });
    }
  }, [historyModal]);

 

  useEffect(() => {
    historyRef?.current?.lastElementChild.scrollIntoView({
      behavior: "smooth",
    });
  }, [sliceFormHistory]);


  const handleShowMore = () => {
    if (showCount + 3 <= formHistory.length) {
      setShowCount(showCount + 3);
    } else {
      setShowCount(formHistory.length);
    }
  };

  const selectHistory = (cloneId) => {
    dispatch(setRestoreFormId(cloneId));
    gotoEdit();
  };


  return (
    <>
      <Modal
        show={historyModal}
        size="lg"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header>
          <div>
            <Modal.Title id="example-custom-modal-styling-title">
              {t("Form History")}
            </Modal.Title>
          </div>

          <div>
            <button
              type="button"
              className="close"
              onClick={() => {
                handleModalChange();
              }}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex align-items-start p-3">
            <i className="fa fa-info-circle text-primary mr-2"></i>
            <span className="text-muted h6">
            {t("Formsflow automatically saves your previous form data. Now you can switch to the previous stage and edit.")}
            </span>
          </div>
          {isLoading ? 
          <Loading/>
          : ( sliceFormHistory.length ? (
            <>
              <ul className="form-history-container" ref={historyRef}>
                {sliceFormHistory.map((history, index) => (
                  <li key={index}>
                    <div
                      className={`d-flex justify-content-between history-details ${
                        index === 0 ? "active" : ""
                      }`}
                    >
                      <div>
                        <span className="text-muted text-small">
                          {formHistory.length === 1
                            ? t("Created By")
                            : t("Modified By")}
                        </span>
                        <span className="d-block">{history.createdBy}</span>
                      </div>
                      <div>
                        <span className="text-muted">
                          {formHistory.length === 1
                            ? t("Created On")
                            : t("Modified On")}
                        </span>
                        <p className="mb-0">{getLocalDateTime(history.created)}</p>
                        <span className="text-muted">{history.changeLog.new_version && t("New version created")}</span>
                      </div>
                      <div>
                        <span className="d-block text-muted">{t("Action")}</span>
                        <button
                          className="btn btn-outline-primary"
                          disabled={index === 0}
                          onClick={() =>
                            selectHistory(history.changeLog.cloned_form_id)
                          }
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                          &nbsp;&nbsp; {t("Edit")}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {formHistory.length > showCount && (
                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      handleShowMore();
                    }}
                  >
                    {t("Show more")}
                    <i
                      className="fa fa-arrow-circle-down ml-2"
                      aria-hidden="true"
                    ></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>{t("No histories found")}</p>
          ))}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FormHistoryModal;
