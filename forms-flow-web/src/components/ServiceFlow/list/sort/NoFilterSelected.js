import React from "react";
import NoFilterSelectedImage from "./empty design.svg";
import { Translation } from "react-i18next";

function noFilterSelected() {
  return (
    <div>
      <img
        src={NoFilterSelectedImage}
        style={{ width: "100%", height: "300PX" }}
      />
      <h1 style={{ textAlign: "center", lineHeight: "1.5" }}>
        <Translation>{(t) => t("Select a task in the List")}</Translation>
      </h1>
      <p style={{ textAlign: "center", lineHeight: "1.5" }}>
        <Translation>
          {(t) =>
            t(
              "Select a specific task from the provided list of options. Your selection will determine the task you will be working on or interacting with."
            )
          }
        </Translation>
      </p>
    </div>
  );
}
export default noFilterSelected;
