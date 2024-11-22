import { Form } from "@aot-technologies/formio-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n.js";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices.js";
import Loading from "../../../containers/Loading.js";

const FormPreview = () => {
  const { lang } = useSelector((state) => state.user);
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formId) {
      setLoading(true);
      // Fetch form data by ID
      fetchFormById(formId)
        .then((res) => {
          if (res.data) {
            const { data } = res;
            setForm(data);
          }
        })
        .catch((err) => {
          console.error(
            "Error fetching form data:",
            err.response?.data || err.message
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [formId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="form-preview-tab">
      <div className="preview-header-text mb-4">{form?.title}</div>
      <div>
        <Form
          form={form}
          options={{
            disableAlerts: true,
            noAlerts: true,
            language: lang,
            i18n: RESOURCE_BUNDLES_DATA,
          }}
        />
      </div>
    </div>
  );
};

export default FormPreview;
