import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import {Form} from "react-formio";
import { useParams } from 'react-router-dom';
import { fetchFormById } from '../../../apiManager/services/bpmFormServices';
import Loading from '../../../containers/Loading';
const FormView = () => {
    const [getFormLoading ,setFormLoading] = useState(false);
    const [formData ,setFormData] = useState(false);
    const params = useParams();
    useEffect(()=>{
        if(params.formId){
            setFormLoading(true);
            fetchFormById(params.formId).then((res)=>{
                setFormData(res.data);
            }).finally(()=>{
                setFormLoading(false);
            });
        }
    },[params]);
  return (
          <div>
             <div className="main-header">
            <h3 className="ml-3">
              <span className="task-head-details">
                <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
                {"Bundle"}/
              </span>{" "}
              {formData.title}
            </h3>
            </div>
           {getFormLoading ? <Loading /> : <Form form={formData} options={{readOnly:true}}/>} 
          </div>
  );
};

export default FormView;