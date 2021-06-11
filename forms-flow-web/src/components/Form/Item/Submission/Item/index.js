import {Link, Route, Switch, useParams} from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getSubmission, selectRoot} from "react-formio";

import View from './View'
import Edit from './Edit'
import {getApplicationById} from "../../../../../apiManager/services/applicationServices";
import {setApplicationDetailLoader} from "../../../../../actions/applicationActions";

import {getUserRolePermission} from "../../../../../helper/user";
import {CLIENT, STAFF_REVIEWER} from "../../../../../constants/constants";
import {CLIENT_EDIT_STATUS} from "../../../../../constants/applicationConstants";

const Item = React.memo((props) => {
  const {formId, submissionId} = useParams();
  const dispatch = useDispatch();
  //const path = props.location.pathname;
  const applicationId = useSelector((state) => selectRoot('submission', state)?.submission?.data?.applicationId || null);
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const applicationStatus = useSelector(state => state.applications.applicationDetail?.applicationStatus || '');

  const [editAllowed, setEditAllowed] = useState(false);

  useEffect(() => {
    dispatch(getSubmission('submission', submissionId, formId))
  }, [submissionId, formId, dispatch]);

  useEffect(() => {
    if (applicationId) {
      dispatch(setApplicationDetailLoader(true));
      dispatch(getApplicationById(applicationId));
    }
  }, [applicationId, dispatch]);

  useEffect(() => {
    if (getUserRolePermission(userRoles, STAFF_REVIEWER)) {
      setEditAllowed(true);
    }else if (applicationStatus) {
       if (getUserRolePermission(userRoles, CLIENT)) {
        setEditAllowed(CLIENT_EDIT_STATUS.includes(applicationStatus));
      }
    }
  }, [applicationStatus, userRoles]);


  return (
    <div>
      <ul className="nav nav-tabs">
        {getUserRolePermission(userRoles, STAFF_REVIEWER) ?<li className="nav-item">
          <Link className="nav-link" to={`/form/${formId}/submission`}>
            <img src="/webfonts/fa_chevron-left.svg" alt="back"/>
          </Link>
        </li>:null}
        {/*{(path.indexOf("edit") > 0) ?
          <li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}`}>
            <img src="/webfonts/fa_eye.svg" alt="back"/> View
            </Link>
          </li>
          :
          editAllowed ? (<li className="nav-item">
            <Link className="nav-link" to={`/form/${formId}/submission/${submissionId}/edit`}>
              <img src="/webfonts/fa_edit.svg" alt="back"/> Edit
            </Link>
          </li>) : null
        }*/}
      </ul>
      <Switch>
        <Route exact path="/form/:formId/submission/:submissionId" component={View}/>
        {editAllowed ?<Route path="/form/:formId/submission/:submissionId/edit" component={Edit}/>:null}
      </Switch>
    </div>
  );
})

export default Item;
