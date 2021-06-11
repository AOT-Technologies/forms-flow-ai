import React, {PureComponent} from "react";
import { connect } from "react-redux";
import { selectRoot, Form, selectError, Errors } from "react-formio";
import { push } from "connected-react-router";
import { Button } from "react-bootstrap";
/*import { Link } from "react-router-dom";
import StepperPage from "../Stepper.js";*/
import Loading from "../../../containers/Loading";

const Preview = class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      activeStep: 1,
      workflow: null,
      status: null,
    };
  }

  render() {
    const {
      hideComponents,
      onSubmit,
      options,
      errors,
      form: { form, isActive: isFormActive },
      dispatch,
      submission: { submission, isActive: isSubActive, url },
      handleNext,
    } = this.props;
    if (isFormActive || isSubActive) {
      return <Loading />;
    }
    // const handleNext = () => {
    //   this.setState(prevState =>({
    //     activeStep:prevState.activeStep + 1
    // }))
    //   // this.setState({activeStep:this.state.activeStep =+ 1});
    //   // this.props.saveForm(null);
    //   // if(this.state.activeStep === this.state.activeStep - 1){
    //   //   if(this.state.checked){
    //   //     const data = {
    //   //       "formId": "5f1993f28dc3a1b73ae6b6bf",
    //   //       "formName": "New RPAS Self Assessment Form",
    //   //       "formRevisionNumber": "V1" ,
    //   //       "processKey": this.state.workflow.value,
    //   //       "processName": this.state.workflow.label,
    //   //       "status": this.state.status.value,
    //   //       "comments": "test 5555"
    //   //     };
    //   //     this.props.onSaveFormProcessMapper(data);
    //   //   }else{
    //   //     console.log('do nothing for now');
    //   //   }

    //   // }
    // };
    return (
      <div className="container">
        <div className="main-header">
          {/* <Link to="/form">
            <img src="/back.svg" alt="back" />
          </Link> */}
{/*          <span>
           <img src="/form.svg" width="30" height="30" alt="form" />
          </span>*/}
          <h3 className="task-head"> <img src="/webfonts/fa-wpforms.svg" alt="back"/> &nbsp; {form.title}</h3>
          <Button
            className="btn btn-primary btn-sm form-btn pull-right btn-right"
            onClick={() => {
              dispatch(push(`/formflow/${form._id}/edit`));
            }}
          >
            <img src="/webfonts/fa_pencil.svg" alt="back"/>
            &nbsp;&nbsp;Edit Form
          </Button>
          {/* <Button className="btn btn-primary btn-sm form-btn pull-right btn-right"
         onClick={()=>{dispatch(push(`/form/create`))}}>
            <i className="fa fa-pencil" aria-hidden="true"></i>
            &nbsp;&nbsp;Next
        </Button> */}
          <Button
            variant="contained"
            onClick={handleNext}
            className="ml-3 btn btn-primary btn-sm form-btn"
          >
            {(this.state.activeStep === 1, "Next")}
          </Button>
        </div>

        <Errors errors={errors} />
        <Form
          form={form}
          submission={submission}
          url={url}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
          options={{ ...options }}
        />
      </div>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    form: selectRoot("form", state),
    submission: selectRoot("submission", state),
    options: {
      readOnly: true,
    },
    errors: [selectError("submission", state), selectError("form", state)],
  };
};

export default connect(mapStateToProps)(Preview);
