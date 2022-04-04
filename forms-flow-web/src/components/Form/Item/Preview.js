import React, {PureComponent} from "react";
import { connect } from "react-redux";
import { selectRoot, Form, selectError, Errors } from "react-formio";
import { push } from "connected-react-router";
import { Button } from "react-bootstrap";
/*import { Link } from "react-router-dom";
import StepperPage from "../Stepper.js";*/
import Loading from "../../../containers/Loading";
import { Translation } from "react-i18next";
import { formio_translation } from "../../../translations/formiotranslation";

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
      handleNext,
    } = this.props;
    if (isFormActive ) {
      return <Loading />;
    }
    
    return (
      <div className="container">
        <div className="main-header">
          <h3 className="task-head"> <i className="fa fa-wpforms" aria-hidden="true"/> &nbsp; {form.title}</h3>
          <Button
            className="btn btn-primary btn-sm form-btn pull-right btn-right"
            onClick={() => {
              dispatch(push(`/formflow/${form._id}/edit`));
            }}
          >
            <i className="fa fa-pencil" aria-hidden="true"/>
            &nbsp;&nbsp;<Translation>{(t)=>t(""Edit Form"")}</Translation>
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            className="ml-3 btn btn-primary btn-sm form-btn"
          >
            {(this.state.activeStep === 1, <Translation>{(t)=>t("Next")}</Translation>)}
          </Button>
        </div>

        <Errors errors={errors} />
        <Form
          form={form}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
          options={{ ...options,
            i18n: formio_translation}}
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
    errors: [selectError("submission", state), selectError("form", state)],
  };
};

export default connect(mapStateToProps)(Preview);
