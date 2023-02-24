import React from "react";
import FormSelect from "./FormSelect";

const BundleCreate = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Create Bundle</h3>
        <button className="btn btn-primary" >
          Save & Preview
        </button>
      </div>
      <section>
        <div className="mt-2 align-items-center">
          <div className="m-3">
            <label>Bundle Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter name"
            />
          </div>
          <div className="m-3">
            <label>Bundle Description</label>
            <textarea
              type="text"
              className="form-control"
              placeholder="Enter Description"
            />
          </div>
        </div>
      </section>
      <section>
        <div className="m-3">
          <FormSelect/>
        </div>
      </section>
    </div>
  );
};

export default BundleCreate;
