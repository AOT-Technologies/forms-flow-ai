import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { getForm, getSubmissions, selectRoot, selectError, SubmissionGrid, Errors } from 'react-formio';
import Loading from '../../containers/Loading';

const List = class extends Component {
  componentWillMount() {
    this.props.getForm();
    this.props.getSubmissions(1);
  }

  render() {
    const {form, submissions, isLoading, onAction, getSubmissions, errors} = this.props

    if (isLoading) {
      return (
        <Loading />
      );
    }

    if (errors.length && errors[0] === 'Invalid alias') {
      return (
        <div className="alert alert-warning">
          You have not yet created an Event Resource in your project. Either create an Event Resource with the path of "event" or import the src/project.json into your project.
        </div>
      )
    }

    return (
      <div className='form-index'>
        <h1>Events</h1>
        <Errors errors={errors} />
        <SubmissionGrid
          submissions={submissions}
          form={form}
          onAction={onAction}
          getSubmissions={getSubmissions}
        />
        <Link className='btn btn-primary' to={`/event/create`}>
          <i className='glyphicon glyphicon-plus fa fa-plus' aria-hidden='true'></i>
          New {form.title}
        </Link>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const form = selectRoot('form', selectRoot('event', state));
  const submissions = selectRoot('submissions', selectRoot('event', state));

  return {
    form: form.form,
    submissions: submissions,
    isLoading: form.isActive || submissions.isActive,
    errors: [
      selectError('submissions', selectRoot('event', state)),
      selectError('form', selectRoot('event', state))
    ]
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForm: () => dispatch(getForm('event')),
    getSubmissions: (page, query) => dispatch(getSubmissions('event', page, query)),
    onAction: (submission, action) => {
     switch(action) {
        case 'view':
        case 'row':
          dispatch(push(`/event/${submission._id}`));
          break;
        case 'edit':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`));
          break;
        case 'delete':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/delete`));
          break;
        default:
      }
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List)
