import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setRestoreFormId,
} from "../../../actions/formActions";
import Loading from "../../../containers/Loading";
import { useTranslation } from "react-i18next";
import { HelperServices} from "@formsflow/service";

const FormHistoryModal = ({ historyModal, handleModalChange, gotoEdit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showCount, setShowCount] = useState(3); 
  const formHistory = useSelector((state) => state.formRestore?.formHistory);
  const [sliceFormHistory, setSliceFormHistory] = useState([]);
  const historyRef = useRef(null);
   
  useEffect(() => {
    setSliceFormHistory(formHistory?.slice(0, showCount));
  },[showCount,formHistory]);

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
        data-testid="form-history-modal"
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

          <div className="d-flex align-items-center">
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowCount(3);
                handleModalChange();
              }}
              aria-label="Close"
              data-testid="form-history-modal-close-button"
            >
            </button>
          </div>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex align-items-start p-3">
            <i className="fa fa-info-circle text-primary me-2"></i>
            <span className="text-muted h6">
            {t("Formsflow automatically saves your previous form data. Now you can switch to the previous stage and edit.")}
            </span>
          </div>
          {!formHistory ? 
          <Loading/>
          : ( sliceFormHistory.length ? (
            <>
              <ul className="form-history-container" ref={historyRef}>
                {sliceFormHistory.map((history, index) => (
                  <li key={index}>
                    <div
                      className={`d-flex flex-column flex-md-row 
                      justify-content-between history-details ${
                        index === 0 ? "active" : ""
                      }`}
                    >
                      <div className="form-history">
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
                        <p className="mb-0">{HelperServices?.getLocalDateAndTime(history.created)}</p>
                        {
                          formHistory.length > 1 && (
                            <span className="text-primary">{
                              history.changeLog?.new_version ? 
                              t(history.version ? `Version ${history.version} created` : "New version created") : 
                              t(history.version ? `Version ${history.version}` : "")}
                              </span>
                          )
                        }
                      </div>
                      <div>
                        <span className="d-block text-muted">{t("Action")}</span>
                        <button
                          className="btn btn-outline-primary"
                          disabled={index === 0}
                          onClick={() =>
                            selectHistory(history.changeLog.cloned_form_id)
                          }
                          data-testid={`form-version-${index}-revert-button`}
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                          &nbsp;&nbsp; {t("Revert")}
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
                    data-testid="form-history-show-more-button"
                  >
                    {t("Show more")}
                    <i
                      className="fa fa-arrow-circle-down ms-2"
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
