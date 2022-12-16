import React, { PureComponent } from "react";
import { connect } from "react-redux";
 
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
import { getLocalDateTime } from "../../../apiManager/services/formatterService";
const Preview = class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      activeStep: 1,
      workflow: null,
      status: null,
      historyModal: false,
    };
   
 
  }

  componentDidMount(){ 
    this.props.getFormHistories(this.props.form.id);
  }
  componentWillUnmount(){
    this.props.clearFormHistories();
  }

  handleModalChange() {
    this.setState({ ...this.state, historyModal: !this.state.historyModal});
  }

 

  handleRestore(redirecUrl, restoreId){
    this.props.onRestore(restoreId);
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
            <div>
            <Modal.Title id="example-custom-modal-styling-title">
              Form History
            </Modal.Title>
            <div className="d-flex align-items-start">
            <i className="fa fa-info-circle text-primary mr-2"></i>
            <span className="text-muted h6">Formsflow automatically save your previous form data.<br></br>
              Now you can switch to previous stage and edit.</span>
            </div>
            </div>

            <div>
             
              <button
                onClick={() => {
                  this.handleModalChange();
                }}
                className="btn btn-outline-danger btn-small ml-2"
              >
                close
              </button>
            </div>
          </Modal.Header>
          <Modal.Body>
            {formRestore?.formHistory.length ? ( <table className="table table-borderless">
              <thead>
                <tr>
                  <th scope="col">{ formRestore?.formHistory.length === 1 ? 'created' : 'modified'}</th>
                  <th scope="col">{ formRestore?.formHistory.length === 1 ? 'created by' : 'modified by'}</th>
                </tr>
              </thead>
              <tbody>
                {
                  formRestore?.formHistory.map((i,index)=>(
                    <tr key={i.id}>
                 
                  <td>{getLocalDateTime(i.created)}</td>
                  <td>{i.createdBy}</td>
                  <td>
                     
             
               
                <button onClick={()=>{
                  this.handleRestore(`${redirecUrl}formflow/${form._id}/edit`,
                  i.changeLog.cloned_form_id);
                }} className="btn btn-primary btn-small"
                disabled={index === formRestore?.formHistory.length - 1}
                >Switch to edit</button>
             
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
      }).catch(()=>{
        dispatch(setFormHistories([]));
      });
    }
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Preview);
