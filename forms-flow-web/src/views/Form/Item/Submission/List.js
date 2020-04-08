import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { getSubmissions, selectRoot, selectError, SubmissionGrid, Errors } from 'react-formio';
import Loading from '../../../../containers/Loading';

const List = class extends Component {
  componentWillMount() {
    this.props.getSubmissions(1);
  }

  render() {
    const {match: {params: {formId}}} = this.props
    const {form, submissions, isLoading, onAction, getSubmissions, errors} = this.props

    if (isLoading) {
      return (
        <Loading />
      );
    }

    return (
      <div className='form-index'>
        <Errors errors={errors} />
        <SubmissionGrid
          submissions={submissions}
          form={form}
          onAction={onAction}
          getSubmissions={getSubmissions}
        />
        <Link className='btn btn-primary' to={`/form/${formId}`}>
          <i className='glyphicon glyphicon-plus fa fa-plus' aria-hidden='true'></i>
          New {form.title}
        </Link>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const form = selectRoot('form', state);
  const submissions = selectRoot('submissions', state);

  return {
    form: form.form,
    submissions: submissions,
    isLoading: form.isActive || submissions.isActive,
    errors: [
      selectError('submissions', state),
      selectError('form', state)
    ]
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSubmissions: (page, query) => dispatch(getSubmissions('submissions', page, query, ownProps.match.params.formId)),
    onAction: (submission, action) => {
     switch(action) {
        case 'view':
        case 'row':
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`));
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
