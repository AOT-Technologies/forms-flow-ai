import React from "react";

// Modules object for setting up the Quill editor
export const modules = {
  toolbar: {
    container: "#toolbar",
  },
  clipboard: {
    matchVisual: false,
  },
};

// Formats objects for setting up the Quill editor
export const formats = [
  "bold",
  "italic",
  "underline",
  "align", 
  "indent",
  "link",
];

// Quill Toolbar component
export const QuillToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <button aria-label="bold" className="ql-bold" />
      <button aria-label="italic" className="ql-italic" />
      <button aria-label="underline" className="ql-underline" /> 
    </span>
    <span className="ql-formats">
    <button aria-label="Align Left" className="ql-align" value="" />
    <button aria-label="Align Center" className="ql-align" value="center" />
    <button aria-label="Align Right"className="ql-align" value="right" />
    <button aria-label="Align Justify"  className="ql-align" value="justify" />
    
    </span>
    <span className="ql-formats"> 
      <button className="ql-link" aria-label="Insert Link" title="Insert Link"/> 
    </span>
    <span className="ql-formats"> 
      <button className="ql-clean" aria-label="Clear Formatting" title="clean"/>
    </span>
 
  </div>
);

export default QuillToolbar;