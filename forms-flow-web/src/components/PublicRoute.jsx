import React, {PureComponent} from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { getForm } from 'react-formio'

import UserService from '../services/UserService'
import View from '../components/Form/Item/View'

class PublicRoute extends PureComponent {

    componentDidMount() {
        UserService.authenticateAnonymousUser(this.props.store)
    }

    render() {
        return (
            <div className="container">
                <Route exact path="/public/form/:formId" component={View}/>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch,ownProps) => {
    return {
        getForm: (id) => dispatch(getForm('form', id))
    };
};

export default connect(null, mapDispatchToProps)(PublicRoute);
