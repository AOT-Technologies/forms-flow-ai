import React from "react";
import { useDispatch } from "react-redux";
import { setDraftDelete } from "../../actions/draftActions";

const DraftOperations = ({ row }) => {  
  const dispatch = useDispatch();
  const deleteDraft = () => {
    dispatch(
      setDraftDelete({
        modalOpen: true,
        draftId: row.id,
        draftName: row.DraftName,
      })
    );
  };

  return (
    <>
      <div>
        <span style={{ marginLeft: "2rem" }}>
          <span>
            <button
              className="btn btn-link text-danger mt-2"
              onClick={() => deleteDraft()}
            >
              Delete Draft
            </button>
            &nbsp;
          </span>
        </span>
      </div>
    </>
  );
};

export default DraftOperations;
