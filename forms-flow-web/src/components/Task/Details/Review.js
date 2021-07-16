import React, { useEffect, useState} from "react";
import {connect, useSelector} from "react-redux";
import Select from "react-select";

import {completeTask} from "../../../apiManager/services/taskServices";

import {
  setUpdateHistoryLoader,
  setUpdateLoader
} from "../../../actions/taskActions";
import {
  getTaskDetail
} from "../../../apiManager/services/taskServices";
import {setFormSubmissionError} from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import Loading from "../../Loading";
import Error from "../../Error";

const Review = React.memo((props) => {
  const [selectedOption, changeSelectedOption]= useState({value: "", label: ""})
  const [options,setOptions] = useState([]);

  const detail = useSelector(state => state.tasks.taskDetail);
  const status = useSelector(state => state.tasks.taskDetail.status)
  const detailAction = useSelector(state=>state.tasks.taskDetail.action)
  const userName = useSelector(state=>state.user.userDetail?.preferred_username||"");
  const submissionError = useSelector(state=>state.formDelete.formSubmissionError);
  const isProcessLoading= useSelector(state=>state.process.isProcessLoading);
  const processStatusList = useSelector(state=> state.process.processStatusList);

  const processLoadError= useSelector(state=> state.process.processLoadError);

  useEffect(()=>{
    if(detailAction && status ==="completed"){
      const option= options.find(
        (ele) => ele.value === detailAction
      );
      changeSelectedOption(option);
    }
  },[options, detailAction, status]);

  useEffect(()=>{
    if (processStatusList !== options){
      setOptions(processStatusList);
    }
  },[processStatusList, options]);


    return (
      <div className="review-section">
        <section className="review-box">
          <SubmissionError
            modalOpen={submissionError.modalOpen}
            message={submissionError.message}
            onConfirm={props.onConfirm}
          />
          <section className="row">
            <p
              className="col-md-6"
              style={{fontSize: "21px", fontWeight: "bolder"}}
            >
              {detail.name}
            </p>
          </section>
          {/* <section>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem por incididunt ut labore et dolore magna aliqua.
                        </p>
                    </section> */}
          <div className="review-status">
            <div className="row col-md-12">
              <div className="col-md-4">
                <label>Review Status:</label>
              </div>
              <div className="col-md-6">
                {processLoadError && (
                  <Error noStyle text="Something went wrong.."/>
                )}
                {isProcessLoading && <Loading/>}
                {!processLoadError && !isProcessLoading && (
                  <Select
                    onChange={changeSelectedOption}
                    className="basic-single"
                    classNamePrefix="select"
                    value={
                      selectedOption && selectedOption.value !== ""
                        ? selectedOption
                        : ""
                    }
                    name="status"
                    options={options}
                    getOptionLabel={(option) => `${option.name} `}
                    getOptionValue={(option) => `${option.value}`}
                    isSearchable={false}
                    isDisabled={
                      detail.assignee === null ||
                      !(
                        detail.assignee === userName &&
                        detail.status !== "completed"
                      )
                    }
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: "#f1f3f7",
                        primary: "#036",
                      },
                    })}
                  />
                )}
              </div>

              <div className="col-md-2">
                {detail.assignee &&
                detail.assignee === userName &&
                detail.status !== "completed" ? (
                  <button
                    className="btn btn-primary"
                    disabled={selectedOption?.value === ""}
                    onClick={() =>
                      props.onCompleteTask(
                        detail.id,
                        selectedOption.value
                      )
                    }
                  >
                    Submit
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
});

const mapDispatchToProps = (dispatch) => {
  return {
    onCompleteTask: (id, status) => {
      dispatch(setUpdateLoader(true));
      dispatch(
        completeTask(id, status, (err, response) => {
          if (err) {
            dispatch(setUpdateLoader(false));
            const ErrorDetails = {
              modalOpen: true,
              message: "Unable to perform the action",
            };
            dispatch(setFormSubmissionError(ErrorDetails));
          } else {
              dispatch(
                getTaskDetail(id, (err, res) => {
                  if (!err) {
                    dispatch(setUpdateLoader(false));
                    dispatch(setUpdateHistoryLoader(true));
                  }
                })
              );
          }
        })
      );
    },
    onConfirm: () => {
      const ErrorDetails = {modalOpen: false, message: ""};
      dispatch(setFormSubmissionError(ErrorDetails));
    },
  };
};

export default connect(null, mapDispatchToProps)(Review);
