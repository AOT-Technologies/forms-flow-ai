import React from "react";
import ReactQuill from "react-quill";
import { modules, formats, QuillToolbar } from "./Toolbar";
import "quill/dist/quill.snow.css";
import "react-quill/dist/quill.snow.css";
import "../RichText/richText.scss";

const Editor = ({ placeholder, onChange, value }) => {
  const handleQuillChange = (content, delta, source) => {
    if (source === "user") {
      delta.ops.forEach((op) => {
        if (op.attributes && op.attributes.link) {
          op.attributes.target = "_blank";
        }
      });
      onChange(content);
    }
  };

  return (
    <div>
      <QuillToolbar />
      <ReactQuill
        theme={"snow"}
        onChange={handleQuillChange}
        value={value}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="height"
      />
    </div>
  );
};

export default Editor;
