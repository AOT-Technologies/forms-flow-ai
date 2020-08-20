import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Tabs, Tab} from "react-bootstrap";
import {connect} from "react-redux";
import {selectError, getSubmission, getForm, FormGrid} from "react-formio";
import Details from "./Details";
import {getTaskDetail} from "../../apiManager/services/taskServices";
import Loading from "../../containers/Loading";
import {setLoader} from "../../actions/taskActions";
import View from "../Form/Item/Submission/Item/View";
import {getProcessStatusList} from "../../apiManager/services/processServices";
import History from './History';

class ViewTask extends Component {
  render() {
    const {detail} = this.props;
    if (this.props.isLoading) {
      return <Loading/>;
    }
    return (
      <div className="container">
        <div className="main-header">
          <Link to="/task">
            <img src="/back.svg" alt="back"/>
          </Link>
          <span className="ml-3">
            <img src="/clipboard.svg" alt="Task"/>
          </span>
          <h3>
            <span className="task-head-details">Tasks /</span>{" "}
            {`${detail.name}`}
          </h3>
        </div>
        <br/>
        <Tabs id="task-details" defaultActiveKey="details">
          <Tab eventKey="details" title="Details">
            <Details/>
          </Tab>
          <Tab eventKey="form" title="Form">
            <View page="task-detail"/>
          </Tab>
          <Tab eventKey="history" title="History" enabled>
            
          
            <History page="task-detail"/>
          
           </Tab>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    submission: state.submission,
    form: state.form.form,
    detail: state.tasks.taskDetail,
    isLoading: state.tasks.isLoading,
    options: {
      readOnly: true,
    },
    errors: [selectError("submission", state), selectError("form", state)],
  };
};

const isDataLoaded = (id) => {
  return (dispatch, getState) => {
    let task = getState().tasks.taskDetail;
    if (task && task.id === id) {
      dispatch(setLoader(false));
    } else {
      dispatch(setLoader(true));
      dispatch(
        getTaskDetail(id, (err, res) => {
          if (!err) {
            if (res.submission_id && res.form_id) {
              dispatch(getForm("form", res.form_id));
              dispatch(
                getProcessStatusList(
                  res.processDefinitionKey,
                  res.taskDefinitionKey
                )
              );

              dispatch(
                getSubmission("submission", res.submission_id, res.form_id)
              );
            }
          }
        })
      );
    }
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getTask: dispatch(isDataLoaded(window.location.pathname.split("/")[2]))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTask);
