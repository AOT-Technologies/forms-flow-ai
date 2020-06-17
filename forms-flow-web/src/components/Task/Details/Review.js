import React, { Component } from "react";
import { connect } from "react-redux";
import Select from "react-select";

import { BPM_USER_DETAILS } from "../../../apiManager/constants/apiConstants";
import { getUserToken } from "../../../apiManager/services/bpmServices";
import { completeTask } from "../../../apiManager/services/taskServices";
import { getProcessStatusList } from "../../../apiManager/services/processServices";
import {
  setUpdateLoader,
  setTaskSubmissionDetail,
} from "../../../actions/taskActions";
import {
  getTaskDetail,
  getTaskSubmissionDetails,
} from "../../../apiManager/services/taskServices";
import { setFormSubmissionError } from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import Loading from "../../Loading";
import Error from "../../Error";

class Review extends Component {
  constructor(props) {
    super();
    this.state = {
      selectedOption: { value: "", label: "" },
      options: [
        { value: "approve", label: "Approve" },
        { value: "reject", label: "Reject" },
      ],
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      selectedOption: this.state.options.find(
        (ele) => ele.value === nextProps.detail.action
      ),
    });
  }

  static getDerivedStateFromProps(props, state) {
    const { processStatusList } = props;
    const { options } = state;

    if (processStatusList !== options) {
      return {
        options: processStatusList,
      };
    }
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
  };

  render() {
    const { selectedOption, options } = this.state;
    const { processLoadError, isProcessLoading } = this.props;
    return (
      <div className="review-section">
        <section className="review-box">
          <SubmissionError
            modalOpen={this.props.submissionError.modalOpen}
            message={this.props.submissionError.message}
            onConfirm={this.props.onConfirm}
          ></SubmissionError>
          <section className="row">
            <p
              className="col-md-6"
              style={{ fontSize: "21px", fontWeight: "bolder" }}
            >
              {this.props.detail.name}
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
                <label>Review Status</label>
              </div>
              <div className="col-md-6">
                {processLoadError && (
                  <Error noStyle text="Something went wrong.." />
                )}
                {isProcessLoading && <Loading />}
                {!processLoadError && !isProcessLoading && (
                  <Select
                    onChange={this.handleChange}
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
                      this.props.detail.assignee === null ||
                      !(
                        this.props.detail.assignee === this.props.userName &&
                        this.props.detail.deleteReason !== "completed"
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
                {this.props.detail.assignee &&
                this.props.detail.assignee === this.props.userName &&
                this.props.detail.deleteReason !== "completed" ? (
                  <button
                    className="btn btn-primary"
                    disabled={this.state.status === " "}
                    onClick={() =>
                      this.props.onCompleteTask(
                        this.props.detail.id,
                        this.state.selectedOption.value
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
  }
}

const mapStateToProps = (state) => {
  return {
    detail: state.tasks.taskDetail,
    userName: state.user.userDetail.preferred_username,
    submissionError: state.formDelete.formSubmissionError,
    isProcessLoading: state.process.isProcessLoading,
    processStatusList: state.process.processStatusList,
    processLoadError: state.process.processLoadError,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onCompleteTask: (id, status) => {
      dispatch(
        getUserToken(BPM_USER_DETAILS, (err, res) => {
          if (!err) {
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
                        dispatch(
                          getTaskSubmissionDetails(
                            res.processInstanceId,
                            (err, res) => {
                              if (!err) {
                                dispatch(setTaskSubmissionDetail(res));
                                dispatch(setUpdateLoader(false));
                              }
                            }
                          )
                        );
                      }
                    })
                  );
                }
              })
            );
          }
        })
      );
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" };
      dispatch(setFormSubmissionError(ErrorDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Review);
