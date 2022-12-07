import React, { PureComponent } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { selectRoot, Form, selectError, Errors } from "react-formio";
import { push } from "connected-react-router";
import { Button } from "react-bootstrap";
import Loading from "../../../containers/Loading";
import { Translation } from "react-i18next";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import Modal from "react-bootstrap/Modal";
import { setFormHistories, setRestoreFormId } from "../../../actions/formActions";
import { getFormHistory } from "../../../apiManager/services/FormServices";

const Preview = class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      activeStep: 1,
      workflow: null,
      status: null,
      historyModal: false,
      selectedRestoreId:null,
    };
   
 
  }

  componentDidMount(){ 
    this.props.getFormHistories(this.props.form.id);
  }
  componentWillUnmount(){
    this.props.clearFormHistories();
  }

  handleModalChange() {
    this.setState({ ...this.state, historyModal: !this.state.historyModal,
       selectedRestoreId:null });
  }

  handleSelectChange(value) {
    this.setState({ ...this.state, selectedRestoreId: value });
  }

  handleRestore(redirecUrl){
    this.props.onRestore(this.state.selectedRestoreId);
    this.props.gotoEdit(redirecUrl);

  }

  gotoEdit(redirecUrl){
    this.props.gotoEdit(redirecUrl);
  }

  render() {
    const {
      hideComponents,
      onSubmit,
      options,
      errors,
      form: { form, isActive: isFormActive },
      handleNext,
      tenants,
      formRestore
    } = this.props;
    const tenantKey = tenants?.tenantId;
    const redirecUrl = MULTITENANCY_ENABLED
    
    ? `/tenant/${tenantKey}/`
    : "/";
    if (isFormActive) {
      return <Loading />;
    }
    return (
      <div className="container">
        <div className="main-header">
          <h3 className="task-head">
            {" "}
            <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
            {form.title}
          </h3>

          <Button
            className="btn btn-primary  form-btn pull-right btn-right"
            onClick={() => {
              this.handleModalChange();
            }}
          >
            <i className="fa fa-rotate-left " aria-hidden="true" />
            &nbsp;&nbsp;<Translation>{(t) => t("Form History")}</Translation>
          </Button>
          <Button
            className="btn btn-primary  form-btn pull-right ml-2"
            onClick={() => {
            this.gotoEdit(`${redirecUrl}formflow/${form._id}/edit`);
            }}
          >
            <i className="fa fa-pencil" aria-hidden="true" />
            &nbsp;&nbsp;<Translation>{(t) => t("Edit Form")}</Translation>
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            className="ml-3 btn btn-primary  form-btn"
          >
            {
              (this.state.activeStep === 1,
              (<Translation>{(t) => t("Next")}</Translation>))
            }
          </Button>
        </div>

        <Modal
          show={this.state.historyModal}
          size="lg"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header>
            <Modal.Title id="example-custom-modal-styling-title">
              Form History
            </Modal.Title>
            <div>
              {formRestore?.formHistory.length ? (
                <button onClick={()=>{
                  this.handleRestore(`${redirecUrl}formflow/${form._id}/edit`);
                }} className="btn btn-primary btn-small">Restore</button>
              ) : null}
              <button
                onClick={() => {
                  this.handleModalChange();
                }}
                className="btn btn-outline-danger btn-small ml-2"
              >
                cancel
              </button>
            </div>
          </Modal.Header>
          <Modal.Body>
            {formRestore?.formHistory.length ? ( <table className="table table-borderless">
              <thead>
                <tr>
                  
                  <th scope="col">created</th>
                  <th scope="col">createdBy</th>
                  <th scope="col">Select</th>
                </tr>
              </thead>
              <tbody>
                {
                  formRestore?.formHistory.map((i)=>(
                    <tr key={i.id}>
                 
                  <td>{moment(i.created).fromNow()}</td>
                  <td>{i.createdBy}</td>
                  <td>
                     
                  <div className="round" onClick={()=>{this.handleSelectChange(i.changeLog.cloned_form_id);}} >
                       <input type="checkbox" readOnly checked={i.changeLog.cloned_form_id === this.state.selectedRestoreId}  />
                     <span ></span>
                  </div>
                 
                  </td>
                </tr>
                  ))
                }
                
                 
              </tbody>
            </table>) : (
              <p>No histories found</p>
            )}
           
          </Modal.Body>
        </Modal>

        <Errors errors={errors} />
        <Form
          form={form}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
          options={{ ...options, i18n: formio_resourceBundles }}
        />
      </div>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    form: selectRoot("form", state),
    options: {
      readOnly: true,
      language: state.user.lang,
    },
    errors: [selectError("form", state)],
    tenants: selectRoot("tenants", state),
    formRestore:selectRoot("formRestore", state)
  };
};

// eslint-disable-next-line no-unused-vars
const mapDispatchToProps = (dispatch, ownProps)  => {
  return {
    onRestore:(formId)=>{
      dispatch(setRestoreFormId(formId));
    },
    gotoEdit:(redirecUrl)=>{
      dispatch(push(redirecUrl));
    },
    clearFormHistories:()=>{
      dispatch(setFormHistories([]));
    },
    getFormHistories: (formId)=>{
      getFormHistory(formId).then((res)=>{
        dispatch(setFormHistories(res.data));
      }).catch((err)=>{
        dispatch(setFormHistories([]));
        console.log(err);
      });
    }
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Preview);
